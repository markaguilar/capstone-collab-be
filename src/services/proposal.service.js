const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Proposal, Project } = require('../models');
const ApiError = require('../utils/ApiError');
const { PROJECT_STATUS } = require('../constant/projectStatus');
const parseSort = require('../utils/ParseSort');

/**
 * Create a proposal
 * @param {ObjectId} developerId
 * @param {ObjectId} projectId
 * @param {Object} proposalBody
 * @returns {Promise<Proposal>}
 */
const createProposal = async (developerId, projectId, proposalBody) => {
  // Check if a project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  if (project.status !== PROJECT_STATUS.OPEN) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project is not open for proposals');
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

  await proposal.populate('developer', 'id name profilePicture portfolio skills');

  return proposal;
};

/**
 * Get proposals for a project with pagination
 * @param {ObjectId} projectId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Array>}
 */
const getProposalsByProjectId = async (projectId, filter = {}, options = {}) => {
  const { sortBy = '-createdAt', limit = 10, page = 1 } = options;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const proposals = await Proposal.find({ project: projectId, ...filter })
    .populate('developer', 'id name profilePicture portfolio skills hourlyRate')
    .sort(parseSort(sortBy))
    .limit(parseInt(limit, 10))
    .skip(skip)
    .lean();

  return proposals;
};

/**
 * Get proposal by id
 * @param {ObjectId} proposalId
 * @returns {Promise<Proposal>}
 */
const getProposalById = async (proposalId) => {
  const proposal = await Proposal.findById(proposalId)
    .populate('developer', 'id name email profilePicture skills experience bio')
    .populate('project', 'id title description budget deadline status student');

  if (!proposal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
  }

  return proposal;
};

/**
 * Accept a proposal with atomic transaction
 * Prevents race conditions where multiple accepts can succeed simultaneously
 *
 * Atomic operations:
 * 1. Update proposal status to 'accepted' (only if currently 'pending')
 * 2. Assign a developer to a project (only if not already assigned)
 * 3. Reject all other pending proposals for this project
 *
 * @param {ObjectId} proposalId
 * @param {ObjectId} studentId
 * @returns {Promise<Proposal>}
 */
const acceptProposal = async (proposalId, studentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Fetch proposal within transaction
    const proposal = await Proposal.findById(proposalId).session(session);

    if (!proposal) {
      await session.abortTransaction();
      throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
    }

    // Step 2: A verified student owns the project
    const project = await Project.findById(proposal.project).session(session);

    if (!project) {
      await session.abortTransaction();
      throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
    }

    if (project.student.toString() !== studentId) {
      await session.abortTransaction();
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not own this project');
    }

    // Step 3: Atomically update proposal status (only if pending)
    // This prevents multiple accepts succeeding in parallel
    const updatedProposal = await Proposal.findOneAndUpdate(
      {
        _id: proposalId,
        status: 'pending', // Only accept if still pending
      },
      {
        $set: { status: 'accepted' },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedProposal) {
      await session.abortTransaction();
      throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal is not in pending status or has already been processed');
    }

    // Step 4: Atomically assign developer to project (only if not already assigned)
    // Prevents multiple proposals from assigning different developers
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: proposal.project,
        $or: [{ assignedDeveloper: null }, { assignedDeveloper: { $exists: false } }],
      },
      {
        $set: {
          assignedDeveloper: proposal.developer,
          status: 'in_progress',
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedProject) {
      await session.abortTransaction();
      throw new ApiError(httpStatus.CONFLICT, 'Project has already been assigned to another developer');
    }

    // Step 5: Reject all other pending proposals for this project
    const rejectionReason = 'Project was assigned to another developer';
    await Proposal.updateMany(
      {
        project: proposal.project,
        _id: { $ne: proposalId },
        status: 'pending',
      },
      {
        $set: {
          status: 'rejected',
          rejectionReason,
        },
      },
      { session }
    );

    // Step 6: Commit transaction
    await session.commitTransaction();

    // Fetch and return an updated proposal
    return updatedProposal.populate('developer', 'id name email profilePicture').execPopulate();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reject proposal
 * @param {ObjectId} proposalId
 * @param {ObjectId} studentId
 * @param {string} rejectionReason
 * @returns {Promise<Proposal>}
 */
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

/**
 * Withdraw proposal
 * @param {ObjectId} proposalId
 * @param {ObjectId} developerId
 * @returns {Promise<Proposal>}
 */
const withdrawProposal = async (proposalId, developerId) => {
  const proposal = await getProposalById(proposalId);

  // Verify the developer owns the proposal
  const devId =
    proposal.developer && proposal.developer._id ? proposal.developer._id.toString() : proposal.developer.toString();
  if (devId !== developerId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not own this proposal');
  }

  if (proposal.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only pending proposals can be withdrawn');
  }

  proposal.status = 'withdrawn';
  await proposal.save();

  return proposal;
};

/**
 * Get developer's proposals with pagination
 * @param {ObjectId} developerId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Array>}
 */
const getDeveloperProposals = async (developerId, filter = {}, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1 } = options;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const proposals = await Proposal.find({ developer: developerId, ...filter })
    .populate('project', 'id title budget deadline status')
    .sort(parseSort(sortBy))
    .limit(parseInt(limit, 10))
    .skip(skip)
    .lean();

  return proposals;
};

/**
 * Get proposal count for a project
 * @param {ObjectId} projectId
 * @param {string} status - Optional status filter
 * @returns {Promise<number>}
 */
const getProposalCount = async (projectId, status = null) => {
  const filter = { project: projectId };
  if (status) {
    filter.status = status;
  }

  return Proposal.countDocuments(filter);
};

module.exports = {
  createProposal,
  getProposalsByProjectId,
  getProposalById,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  getDeveloperProposals,
  getProposalCount,
};
