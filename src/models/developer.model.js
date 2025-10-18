const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    experience: { type: Number, required: true, min: 0 },
    skills: { type: [String], default: [] },
    portfolio: { type: String },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    applicationStatus: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }], default: [] },
  },
  { timestamps: true }
);

developerSchema.index({ userId: 1 }, { unique: true });

const Developer = mongoose.model('Developer', developerSchema);

module.exports = Developer;
