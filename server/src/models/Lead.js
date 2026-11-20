import mongoose from 'mongoose';
import { LEAD_SOURCES, LEAD_STATUSES } from '../utils/constants.js';

const leadSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters.'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required.'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters.'],
    },
    company: {
      type: String,
      required: [true, 'Company is required.'],
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters.'],
    },
    source: {
      type: String,
      required: [true, 'Source is required.'],
      enum: {
        values: LEAD_SOURCES,
        message: 'Invalid lead source.',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required.'],
      enum: {
        values: LEAD_STATUSES,
        message: 'Invalid lead status.',
      },
      default: 'New',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

leadSchema.index({ owner: 1, status: 1, createdAt: -1 });
leadSchema.index({ owner: 1, name: 1 });
leadSchema.index({ owner: 1, email: 1 });

export default mongoose.model('Lead', leadSchema);
