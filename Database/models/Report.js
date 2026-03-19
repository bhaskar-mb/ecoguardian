
import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  message: String,
  actor: String,
  actionTaken: String
});

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, required: true },
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  timestamp: { type: Date, default: Date.now },
  imageUrl: String,
  status: { type: String, default: 'pending' },
  reporterId: String,
  assignedAuthorityId: String,
  aiInsights: String,
  timeline: [timelineEventSchema],
  resolutionDetails: String,
  resolvedImageUrl: String,
  resolvedTimestamp: Date
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Report', reportSchema);
