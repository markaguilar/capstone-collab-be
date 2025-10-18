const httpStatus = require('http-status');
const { Proposal, Project } = require('../models');
const ApiError = require('../utils/ApiError');

const createProposal = async (developerId, projectId, proposalBody) => {
  // Check if a project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Prevent a student from applying to an own project
  if (project.student.toString() === developerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot apply to your own project');
  }

  // Check if a developer already applied
  const existingProposal = await Proposal.findOne({
    project: projectId,
    developer: developerId,
  });

  if (existingProposal) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already submitted a proposal for this project');
  }

  const proposal = await Proposal.create({
    project: projectId,
    developer: developerId,
    ...proposalBody,
  });

  // Increment project proposal count
  await Project.findByIdAndUpdate(projectId, { $inc: { proposalCount: 1 } });

  return proposal.populate('developer', 'name profilePicture portfolio skills');
};

const getProposalsByProjectId = async (projectId, filter = {}, options = {}) => {
  const proposals = await Proposal.find({ project: projectId, ...filter })
    .populate('developer', 'name profilePicture portfolio skills hourlyRate')
    .sort(options.sortBy || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip((options.page - 1) * (options.limit || 10) || 0);

  return proposals;
};

const getProposalById = async (proposalId) => {
  const proposal = await Proposal.findById(proposalId)
    .populate('developer', 'name profilePicture portfolio skills experience bio')
    .populate('project', 'title description budget deadline');

  if (!proposal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
  }

  return proposal;
};

const acceptProposal = async (proposalId, studentId) => {
  const proposal = await getProposalById(proposalId);

  // Verify student owns the project
  if (proposal.project.student.toString() !== studentId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not own this project');
  }

  if (proposal.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal is not pending');
  }

  // Update proposal status
  proposal.status = 'accepted';
  await proposal.save();

  // Update project: assign developer and change status
  await Project.findByIdAndUpdate(proposal.project._id, {
    assignedDeveloper: proposal.developer,
    status: 'in_progress',
  });

  // Reject all other proposals for this project
  await Proposal.updateMany(
    {
      project: proposal.project._id,
      _id: { $ne: proposalId },
      status: 'pending',
    },
    { status: 'rejected', rejectionReason: 'Project was assigned to another developer' }
  );

  return proposal.populate('developer', 'name email profilePicture');
};

const rejectProposal = async (proposalId, studentId, rejectionReason) => {
  const proposal = await getProposalById(proposalId);

  // Verify the student owns the project
  if (proposal.project.student.toString() !== studentId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not own this project');
  }

  if (proposal.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal is not pending');
  }

  proposal.status = 'rejected';
  proposal.rejectionReason = rejectionReason;
  await proposal.save();

  return proposal;
};

const withdrawProposal = async (proposalId, developerId) => {
  const proposal = await getProposalById(proposalId);

  // Verify developer owns the proposal
  if (proposal.developer.toString() !== developerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not own this proposal');
  }

  if (proposal.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only pending proposals can be withdrawn');
  }

  proposal.status = 'withdrawn';
  await proposal.save();

  return proposal;
};

const getDeveloperProposals = async (developerId, filter = {}, options = {}) => {
  const proposals = await Proposal.find({ developer: developerId, ...filter })
    .populate('project', 'title budget deadline status')
    .sort(options.sortBy || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip((options.page - 1) * (options.limit || 10) || 0);

  return proposals;
};

module.exports = {
  createProposal,
  getProposalsByProjectId,
  getProposalById,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  getDeveloperProposals,
};
