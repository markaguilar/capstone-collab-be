const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const { projectService, proposalService, userService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject({ student: req.user.id, ...req.body });

  res.status(httpStatus.CREATED).send(project);
});

const getProjects = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const filter = { student: user.id, ...pick(req.query, ['title']) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await projectService.queryProjects(filter, options);

  res.send(result);
});

const getProject = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const project = await projectService.getProjectById(req.params.projectId);
  const proposal = await proposalService.getProposalsByProjectId(req.params.projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  if (project.student.toString() !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  res.send({ project, proposals: proposal });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
};
