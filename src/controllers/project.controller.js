const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { projectService, proposalService } = require('../services');
const pick = require('../utils/pick');

/**
 * Create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject({
    student: req.user.id,
    ...req.body,
  });

  res.status(httpStatus.CREATED).send(project);
});

/**
 * Get all projects with optional filtering and pagination
 * Query params: title, category, status, minBudget, maxBudget, sortBy, limit, page
 */
const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'category', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const projects = await projectService.queryProjects(filter, options);

  res.send(projects);
});

/**
 * Get authenticated user's own projects
 * Query params: status, sortBy, limit, page
 */
const getMyProjects = catchAsync(async (req, res) => {
  const filter = {
    student: req.user.id,
    ...pick(req.query, ['status']),
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const projects = await projectService.queryProjects(filter, options);

  res.send(projects);
});

/**
 * Get single project details with proposals
 * verifyProjectOwnership middleware checks ownership but only fetches _id and student
 * We need to fetch the full project data here
 */
const getProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  // Fetch full project data with all details
  // verifyProjectOwnership already checked that the user owns this project
  const project = await projectService.getProjectById(projectId);

  // Fetch proposals for this project
  const proposals = await proposalService.getProposalsByProjectId(projectId);

  res.send({
    project,
    proposals,
  });
});

/**
 * Update project details
 * Require ownership verification via verifyProjectOwnership middleware
 */
const updateProject = catchAsync(async (req, res) => {
  // req.project already exists, just update it
  const updatedProject = await projectService.updateProjectById(req.params.projectId, req.body);
  res.send(updatedProject);
});

/**
 * Delete a project
 * Requires ownership verification via verifyProjectOwnership middleware
 */
const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProjectById(req.params.projectId);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProject,
  updateProject,
  deleteProject,
};
