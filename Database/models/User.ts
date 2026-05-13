import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin', 'authority'], default: 'user' },
  points: { type: Number, default: 0 },
  reportsCount: { type: Number, default: 0 },
  avatar: String,
  organization: String,
  phone: String,
  sector: String,
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  mfaCode: String,
  mfaExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  tokenVersion: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model('User', userSchema);
