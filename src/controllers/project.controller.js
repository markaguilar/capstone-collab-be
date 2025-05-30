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
  const filter = pick(req.query, ['title']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', '-createdAt']);

  const projects = await projectService.getFeaturedProjects(filter, options);

  res.send(projects);
});

const getMyProjects = catchAsync(async (req, res) => {
  const filter = { student: req.user.id, ...pick(req.query, ['title']) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const projects = await projectService.queryProjects(filter, options);

  res.send(projects);
});

const getProject = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const project = await projectService.getProjectById(req.project._id);
  const proposals = await proposalService.getProposalsByProjectId(req.params.projectId);

  res.send({ project, proposal: proposals });
});

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProject,
};
