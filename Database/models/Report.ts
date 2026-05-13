
import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  message: String,
  actor: String,
  actionTaken: String
});

const reportSchema = new mongoose.Schema({
  reportNumber: { type: Number, default: 0 },
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
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

reportSchema.pre('save', async function() {
  if (this.isNew || !this.reportNumber) {
    try {
      const ReportModel = mongoose.model('Report');
      const lastReport = await ReportModel.findOne({}, {}, { sort: { 'reportNumber': -1 } });
      const nextNum = (lastReport && lastReport.reportNumber) ? lastReport.reportNumber + 1 : 1;
      this.reportNumber = nextNum;
    } catch (err) {
      console.error('Error in pre-save reportNumber generation:', err);
      // If it fails, we still want to save, maybe with 0 or a fallback
      if (!this.reportNumber) this.reportNumber = 1;
    }
  }
});

export default mongoose.model('Report', reportSchema);
