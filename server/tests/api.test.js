process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/lead-manager-test';
process.env.JWT_SECRET = 'test-secret';

import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { default: User } = await import('../src/models/User.js');
const { default: Lead } = await import('../src/models/Lead.js');
const { default: mongoose } = await import('mongoose');

const baseLead = {
  name: 'Aarav Mehta',
  email: 'aarav@northstar.io',
  phone: '+91 98100 24518',
  company: 'Northstar Labs',
  source: 'Website',
  status: 'New',
};

async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/register').send(payload).expect(201);

  return {
    token: response.body.token,
    user: response.body.user,
    payload,
  };
}

function createLead(token, overrides = {}) {
  return request(app)
    .post('/api/leads')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...baseLead, ...overrides });
}

before(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Lead.deleteMany({});
  await User.deleteMany({});
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

test('health endpoint reports ok', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
});

test('registration validates input, hashes the password, and returns a token', async () => {
  const invalid = await request(app)
    .post('/api/auth/register')
    .send({ name: 'A', email: 'not-an-email', password: 'short' })
    .expect(422);

  assert.ok(invalid.body.errors.length >= 3);

  const { token, user } = await registerUser();
  assert.ok(token);
  assert.equal(user.email, 'test@example.com');
  assert.equal(user.passwordHash, undefined);

  const stored = await User.findOne({ email: 'test@example.com' }).select('+passwordHash');
  assert.ok(stored.passwordHash);
  assert.notEqual(stored.passwordHash, 'Password123');

  const duplicate = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Another User', email: 'TEST@example.com', password: 'Password123' })
    .expect(409);

  assert.match(duplicate.body.message, /already exists/i);
});

test('login handles bad credentials and protects private routes', async () => {
  await registerUser();

  await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'WrongPassword1' })
    .expect(401);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'TEST@example.com', password: 'Password123' })
    .expect(200);

  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${login.body.token}`)
    .expect(200);

  assert.equal(me.body.user.email, 'test@example.com');

  await request(app).get('/api/leads').expect(401);
  await request(app).get('/api/leads').set('Authorization', 'Bearer nonsense').expect(401);
});

test('lead CRUD validates input and returns consistent payloads', async () => {
  const { token } = await registerUser();

  const invalid = await createLead(token, { email: 'bad', status: 'Unknown' }).expect(422);
  assert.ok(invalid.body.errors.some((error) => error.field === 'email'));
  assert.ok(invalid.body.errors.some((error) => error.field === 'status'));

  const created = await createLead(token).expect(201);
  assert.ok(created.body.data.id);
  assert.equal(created.body.data.name, baseLead.name);
  assert.equal(created.body.data.status, 'New');

  const list = await request(app)
    .get('/api/leads')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.pagination.total, 1);
  assert.equal(list.body.pagination.totalPages, 1);

  const leadId = created.body.data.id;

  const fetched = await request(app)
    .get(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(fetched.body.data.email, baseLead.email);

  const updated = await request(app)
    .patch(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'Qualified', company: 'Northstar Group' })
    .expect(200);

  assert.equal(updated.body.data.status, 'Qualified');
  assert.equal(updated.body.data.company, 'Northstar Group');

  const emptyUpdate = await request(app)
    .patch(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({})
    .expect(422);

  assert.ok(emptyUpdate.body.errors.length > 0);

  const invalidStatus = await request(app)
    .patch(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'Maybe' })
    .expect(422);

  assert.ok(invalidStatus.body.errors.some((error) => error.field === 'status'));

  await request(app)
    .get('/api/leads/not-a-real-id')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);

  await request(app)
    .delete(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);

  await request(app)
    .get(`/api/leads/${leadId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404);
});

test('leads are isolated by owner', async () => {
  const first = await registerUser({ email: 'first@example.com' });
  const second = await registerUser({ email: 'second@example.com' });

  const firstLead = await createLead(first.token, { name: 'First Lead' }).expect(201);
  await createLead(second.token, { name: 'Second Lead', email: 'second@example.com' }).expect(201);

  const list = await request(app)
    .get('/api/leads')
    .set('Authorization', `Bearer ${first.token}`)
    .expect(200);

  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.data[0].name, 'First Lead');

  await request(app)
    .get(`/api/leads/${firstLead.body.data.id}`)
    .set('Authorization', `Bearer ${second.token}`)
    .expect(404);

  await request(app)
    .patch(`/api/leads/${firstLead.body.data.id}`)
    .set('Authorization', `Bearer ${second.token}`)
    .send({ status: 'Lost' })
    .expect(404);

  await request(app)
    .delete(`/api/leads/${firstLead.body.data.id}`)
    .set('Authorization', `Bearer ${second.token}`)
    .expect(404);
});

test('search, status filters, sorting, pagination, and stats work together', async () => {
  const { token } = await registerUser();

  await createLead(token, { name: 'Alpha Corp', company: 'Alpha', email: 'alpha@example.com', status: 'New' }).expect(201);
  await createLead(token, { name: 'Beta Labs', company: 'Beta', email: 'beta@example.com', status: 'Contacted' }).expect(201);
  await createLead(token, { name: 'Gamma Works', company: 'Gamma', email: 'gamma@example.com', status: 'Qualified' }).expect(201);

  const search = await request(app)
    .get('/api/leads?search=alp')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(search.body.pagination.total, 1);
  assert.equal(search.body.data[0].name, 'Alpha Corp');

  const statusFilter = await request(app)
    .get('/api/leads?status=Contacted')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(statusFilter.body.pagination.total, 1);
  assert.equal(statusFilter.body.data[0].status, 'Contacted');

  const invalidFilter = await request(app)
    .get('/api/leads?status=Unknown')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);

  assert.match(invalidFilter.body.message, /invalid status/i);

  const sorted = await request(app)
    .get('/api/leads?sort=name&order=asc')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.deepEqual(
    sorted.body.data.map((lead) => lead.name),
    ['Alpha Corp', 'Beta Labs', 'Gamma Works'],
  );

  const pageTwo = await request(app)
    .get('/api/leads?limit=2&page=2')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(pageTwo.body.data.length, 1);
  assert.equal(pageTwo.body.pagination.total, 3);
  assert.equal(pageTwo.body.pagination.totalPages, 2);

  const stats = await request(app)
    .get('/api/leads/stats')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(stats.body.total, 3);
  assert.deepEqual(stats.body.byStatus, {
    New: 1,
    Contacted: 1,
    Qualified: 1,
    Lost: 0,
  });
});
