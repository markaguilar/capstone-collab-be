const httpStatus = require('http-status');
const { projectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to verify that the authenticated user owns the project
 * specified by the projectId parameter in the request.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} - 404 if project not found, 403 if user doesn't own the project
 */
const verifyProjectOwnership = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  if (!req.params.projectId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project ID is required');
  }

  const project = await projectService.getProjectOwnershipInfo(req.params.projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  if (project.student.toString() !== req.user.id) {
    // Convert ObjectId to string for comparison with user ID
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied: User does not own this project');
  }

  req.project = project;
  next();
});

module.exports = verifyProjectOwnership;
