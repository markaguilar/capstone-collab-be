const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const proposalSchema = mongoose.Schema(
  {
    // References
    project: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Project',
      required: true,
    },
    developer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },

    // Proposal content
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    proposedBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    proposedDeadline: {
      type: Date,
      required: true,
      validate: {
        validator(v) {
          return v > new Date();
        },
        message: 'Proposed deadline must be in the future',
      },
    },
    estimatedDuration: {
      type: String,
      enum: ['1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'],
      required: true,
    },

    // Relevance
    relevantExperience: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },

    // Interaction tracking
    viewedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    viewedAt: Date,

    // Prevent duplicates - one proposal per developer per project
    uniqueProposal: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique index: one developer can only propose once per project
proposalSchema.pre('save', function (next) {
  if (this.isNew) {
    this.uniqueProposal = `${this.project}_${this.developer}`;
  }
  next();
});

// Indexes
proposalSchema.index({ project: 1, status: 1 });
proposalSchema.index({ developer: 1, status: 1 });
proposalSchema.index({ createdAt: -1 });

// Plugins
proposalSchema.plugin(toJSON);
proposalSchema.plugin(paginate);

/**
 * @typedef Proposal
 * @property {ObjectId} project - Project being applied for
 * @property {ObjectId} developer - Developer submitting proposal
 * @property {string} coverLetter - Developer's proposal message
 * @property {number} proposedBudget - Bid amount
 * @property {Date} proposedDeadline - Developer's deadline
 * @property {string} estimatedDuration - Estimated duration
 * @property {string} relevantExperience - Developer's relevant experience
 * @property {string} status - Proposal status (pending, accepted, rejected, withdrawn)
 * @property {[{fileName, fileUrl, uploadedAt}]} attachments - Portfolio/work samples
 */
const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
