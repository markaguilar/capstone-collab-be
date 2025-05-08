const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const projectSchema = mongoose.Schema(
  {
    student: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    budget: { type: Number },
    deadline: { type: Date },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
  },
  {
    timestamps: true,
  }
);

projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

/*
 * @typedef Project
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
