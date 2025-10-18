const httpStatus = require('http-status');
const { projectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to verify that the authenticated user owns the project
 * specified by the projectId parameter in the request.
 *
 * Prerequisites:
 * - User must be authenticated (via auth middleware)
 * - projectId must be present in req.params
 *
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} - 404 if a project not found, 403 if user doesn't own the project
 */
const verifyProjectOwnership = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  // Validate projectId exists
  if (!projectId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project ID is required');
  }

  // Get a project with only necessary fields for ownership check
  const project = await projectService.getProjectOwnershipInfo(projectId);

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Compare ObjectIds - convert both to strings for safe comparison
  const projectOwnerId = project.student.toString();
  if (projectOwnerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access this project');
  }

  // Attach a project to request for use in a controller
  req.project = project;
  next();
});

module.exports = verifyProjectOwnership;
