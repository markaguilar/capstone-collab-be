// models/project.model.js
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const projectSchema = mongoose.Schema(
  {
    // Project ownership
    student: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },

    // Basic project info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Project details
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ['web', 'mobile', 'desktop', 'ai', 'data', 'other'],
      default: 'web',
    },

    // Budget and timeline
    budget: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'PHP', 'INR', 'GBP'],
      default: 'USD',
    },
    deadline: {
      type: Date,
      validate: {
        validator(v) {
          return !v || v > new Date();
        },
        message: 'Deadline must be in the future',
      },
    },
    duration: {
      type: String,
      enum: ['1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'],
    },

    // Project status
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Developer assignment
    assignedDeveloper: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      default: null,
    },

    // Project visibility and management
    isPublic: {
      type: Boolean,
      default: true,
    },
    maxDevelopers: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Tracking
    viewCount: {
      type: Number,
      default: 0,
    },
    proposalCount: {
      type: Number,
      default: 0,
    },

    // Additional metadata
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

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
projectSchema.index({ student: 1, status: 1 });
projectSchema.index({ status: 1, isFeatured: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ skillsRequired: 1 });
projectSchema.index({ category: 1 });

// Plugins
projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

/**
 * @typedef Project
 * @property {ObjectId} student - Student who created the project
 * @property {string} title - Project title
 * @property {string} description - Detailed project description
 * @property {[string]} skillsRequired - Array of required skills
 * @property {string} category - Project category
 * @property {number} budget - Project budget
 * @property {string} currency - Budget currency
 * @property {Date} deadline - Project deadline
 * @property {string} duration - Estimated project duration
 * @property {string} status - Project status (open, in_progress, completed, cancelled)
 * @property {ObjectId} assignedDeveloper - Developer assigned to project
 * @property {boolean} isFeatured - Whether project is featured
 * @property {boolean} isPublic - Whether project is visible to all
 * @property {number} maxDevelopers - Maximum developers allowed
 * @property {number} viewCount - Number of times viewed
 * @property {number} proposalCount - Number of proposals received
 * @property {[{fileName, fileUrl, uploadedAt}]} attachments - Project attachments
 * @property {[string]} tags - Project tags for filtering
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
