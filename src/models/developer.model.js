const mongoose = require('mongoose');

const developerSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experience: { type: Number, required: true },
  skills: [{ type: String }],
  portfolio: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const Developer = mongoose.model('Developer', developerSchema);

module.exports = Developer;
