import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Lead from './models/Lead.js';
import { connectDB, disconnectDB } from './config/db.js';

const demoLeads = [
  { name: 'Aarav Mehta', email: 'aarav@northstar.io', phone: '+91 98100 24518', company: 'Northstar Labs', source: 'Website', status: 'New' },
  { name: 'Sofia Ramirez', email: 'sofia@brightpath.co', phone: '+1 415 555 0182', company: 'BrightPath', source: 'LinkedIn', status: 'Contacted' },
  { name: 'Daniel Okafor', email: 'daniel@vertexhq.com', phone: '+44 20 7946 0821', company: 'Vertex HQ', source: 'Referral', status: 'Qualified' },
  { name: 'Priya Nair', email: 'priya@orbitstack.dev', phone: '+91 99870 41120', company: 'OrbitStack', source: 'Event', status: 'New' },
  { name: 'Lucas Weber', email: 'lucas@fleetline.de', phone: '+49 30 5557 2140', company: 'Fleetline', source: 'Email Campaign', status: 'Lost' },
  { name: 'Emma Thompson', email: 'emma@clearwater.ai', phone: '+1 646 555 0147', company: 'Clearwater AI', source: 'Website', status: 'Contacted' },
  { name: 'Rohan Kapoor', email: 'rohan@bluepeak.in', phone: '+91 98202 77341', company: 'BluePeak', source: 'Cold Call', status: 'Qualified' },
  { name: 'Isabella Rossi', email: 'isabella@novacraft.it', phone: '+39 02 555 0193', company: 'NovaCraft', source: 'Referral', status: 'New' },
  { name: 'Noah Williams', email: 'noah@summitgrid.com', phone: '+1 312 555 0169', company: 'Summit Grid', source: 'LinkedIn', status: 'Contacted' },
  { name: 'Ananya Sharma', email: 'ananya@meridianworks.in', phone: '+91 98990 33285', company: 'Meridian Works', source: 'Website', status: 'Qualified' },
  { name: 'Mateo Silva', email: 'mateo@cargolane.br', phone: '+55 11 5555 0174', company: 'CargoLane', source: 'Event', status: 'Lost' },
  { name: 'Grace Chen', email: 'grace@lumoscloud.sg', phone: '+65 6555 0128', company: 'Lumos Cloud', source: 'Email Campaign', status: 'New' },
  { name: 'Ethan Brooks', email: 'ethan@anchorpoint.us', phone: '+1 206 555 0136', company: 'Anchor Point', source: 'Cold Call', status: 'Contacted' },
  { name: 'Zara Ali', email: 'zara@kineticflow.ae', phone: '+971 4 555 0188', company: 'Kinetic Flow', source: 'Referral', status: 'New' },
];

async function seed() {
  await connectDB();

  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const user = await User.findOneAndUpdate(
    { email: 'demo@leadmanager.dev' },
    { name: 'Demo User', email: 'demo@leadmanager.dev', passwordHash },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Lead.deleteMany({ owner: user._id });
  await Lead.insertMany(demoLeads.map((lead) => ({ ...lead, owner: user._id })));

  console.log('Seed complete.');
  console.log('Email: demo@leadmanager.dev');
  console.log('Password: Demo@1234');

  await disconnectDB();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
