const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const { projectService, proposalService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject({ student: req.user.id, ...req.body });

  res.status(httpStatus.CREATED).send(project);
});

const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['student', 'title']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await projectService.queryProjects(filter, options);

  res.send(result);
});

const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  const proposal = await proposalService.getProposalsByProjectId(req.params.projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  res.send(project, proposal);
});

module.exports = {
  createProject,
  getProjects,
  getProject,
};
