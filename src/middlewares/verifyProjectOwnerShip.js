const httpStatus = require('http-status');
const { projectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const verifyProjectOwnership = catchAsync(async (req, res, next) => {
  const project = await projectService.getProjectById(req.params.projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  if (project.student.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  req.project = project;
  next();
});

module.exports = verifyProjectOwnership;
