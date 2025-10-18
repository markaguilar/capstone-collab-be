const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    experience: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'experience must be an integer' },
    },
    skills: {
      type: [String],
      default: [],
      set: (arr) => {
        // eslint-disable-next-line no-nested-ternary
        const list = Array.isArray(arr) ? arr : arr != null ? [arr] : [];
        return Array.from(new Set(list.map((s) => String(s).trim().toLowerCase()).filter(Boolean)));
      },
    },
    portfolio: { type: String, trim: true, match: [/^https?:\/\/\S+/i, 'portfolio must be a valid URL'] },
    applications: {
      type: [
        {
          application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
          status: {
            type: String,
            enum: ['pending', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
            default: 'pending',
          },
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

developerSchema.index({ userId: 1 }, { unique: true });

const Developer = mongoose.model('Developer', developerSchema);

module.exports = Developer;
