import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { LEAD_SORT_FIELDS, LEAD_STATUSES } from '../utils/constants.js';

const editableFields = ['name', 'email', 'phone', 'company', 'source', 'status'];

function serializeLead(lead) {
  return {
    id: lead._id.toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickLeadFields(body) {
  return editableFields.reduce((result, field) => {
    if (body[field] !== undefined) {
      result[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
    return result;
  }, {});
}

export const listLeads = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 8, 1), 50);
  const search = String(req.query.search || '').trim().slice(0, 100);
  const status = String(req.query.status || '').trim();
  const sort = LEAD_SORT_FIELDS.includes(req.query.sort) ? req.query.sort : 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  if (status && !LEAD_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid status filter.');
  }

  const filter = { owner: req.user.id };

  if (status) filter.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { company: pattern }, { email: pattern }];
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  res.json({
    data: leads.map(serializeLead),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getLeadStats = asyncHandler(async (req, res) => {
  const grouped = await Lead.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0]));
  grouped.forEach((item) => {
    if (byStatus[item._id] !== undefined) byStatus[item._id] = item.count;
  });

  res.json({
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
  });
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, owner: req.user.id }).lean();

  if (!lead) {
    throw new ApiError(404, 'Lead not found.');
  }

  res.json({ data: serializeLead(lead) });
});

export const createLead = asyncHandler(async (req, res) => {
  const fields = pickLeadFields(req.body);
  const lead = await Lead.create({ ...fields, owner: req.user.id });

  res.status(201).json({ data: serializeLead(lead) });
});

export const updateLead = asyncHandler(async (req, res) => {
  const fields = pickLeadFields(req.body);

  if (!Object.keys(fields).length) {
    throw new ApiError(400, 'Provide at least one field to update.');
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    fields,
    { new: true, runValidators: true },
  ).lean();

  if (!lead) {
    throw new ApiError(404, 'Lead not found.');
  }

  res.json({ data: serializeLead(lead) });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

  if (!lead) {
    throw new ApiError(404, 'Lead not found.');
  }

  res.status(204).send();
});
