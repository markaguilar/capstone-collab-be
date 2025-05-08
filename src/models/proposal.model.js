const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const proposalSchema = mongoose.Schema(
  {
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

proposalSchema.plugin(toJSON);
proposalSchema.plugin(paginate);

/**
 * @typedef Proposal
 */
const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
