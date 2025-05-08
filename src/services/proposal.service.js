const httpStatus = require('http-status');
const { Proposal } = require('../models');
const { getUserById } = require('./user.service');
const ApiError = require('../utils/ApiError');

const createProposal = async (proposalBody) => {
  const developer = await getUserById(proposalBody.developer);
  if (!developer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
  }
  return Proposal.create(proposalBody);
};

const queryProposals = async (filter, options) => {
  const proposal = await Proposal.paginate(filter, options);
  return proposal;
};

const getProposalById = async (id) => {
  return Proposal.findById(id);
};

const getProposalsByProjectId = async (projectId) => {
  return Proposal
    .find({ project: projectId })
    .populate('developer')
    .sort({ createdAt: -1 });
};

module.exports = {
  createProposal,
  queryProposals,
  getProposalById,
  getProposalsByProjectId,
};
