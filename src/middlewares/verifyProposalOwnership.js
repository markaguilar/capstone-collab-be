const httpStatus = require('http-status');
const { isValidObjectId } = require('mongoose');
const { proposalService, projectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to verify proposal ownership based on user role
 * - For STUDENTS: Verify they own the PROJECT (to accept/reject proposals)
 * - For DEVELOPERS: Verify they own the PROPOSAL (to withdraw)
 *
 * Prerequisites:
 * - User must be authenticated (via auth middleware)
 * - proposalId must be present in req.params
 *
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyProposalOwnership = catchAsync(async (req, res, next) => {
  const { proposalId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Validate proposalId exists
  if (!proposalId || !isValidObjectId(proposalId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid proposal ID');
  }

  // Get proposal
  const proposal = await proposalService.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
  }

  // Student: Verify they own the PROJECT to accept/reject proposals
  if (userRole === 'student') {
    const ownerId =
      proposal.project.student && proposal.project.student._id
        ? proposal.project.student._id.toString()
        : proposal.project.student.toString();
    if (ownerId !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to modify this proposal');
    }
  }
  // Developer: Verify they own the PROPOSAL to withdraw
  else if (userRole === 'developer') {
    if (proposal.developer.toString() !== userId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to modify this proposal');
    }
  }
  // Other roles cannot modify proposals
  else {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action');
  }

  // Attach proposal to request for use in controller
  req.proposal = proposal;
  next();
});

/**
 * Middleware to verify user is the project owner (for accepting/rejecting proposals)
 */
const verifyProjectOwnerForProposal = catchAsync(async (req, res, next) => {
  const { proposalId } = req.params;
  const userId = req.user.id;

  if (!proposalId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal ID is required');
  }

  const proposal = await proposalService.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
  }

  const project = await projectService.getProjectOwnershipInfo(proposal.project._id);

  if (project.student.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only project owner can accept or reject proposals');
  }

  req.proposal = proposal;
  next();
});

/**
 * Middleware to verify user is the proposal author (for withdrawing)
 */
const verifyProposalAuthor = catchAsync(async (req, res, next) => {
  const { proposalId } = req.params;
  const userId = req.user.id;

  if (!proposalId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Proposal ID is required');
  }

  const proposal = await proposalService.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Proposal not found');
  }

  if (proposal.developer.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only proposal author can withdraw their proposal');
  }

  req.proposal = proposal;
  next();
});

module.exports = {
  verifyProposalOwnership,
  verifyProjectOwnerForProposal,
  verifyProposalAuthor,
};
