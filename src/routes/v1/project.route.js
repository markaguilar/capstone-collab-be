const express = require('express');

// middleware
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const verifyProjectOwnership = require('../../middlewares/verifyProjectOwnership');

// validation
const { projectValidation } = require('../../validations');

// controller
const projectController = require('../../controllers/project.controller');
const proposalController = require('../../controllers/proposal.controller');

const router = express.Router();

// Create a project
router.post('/', auth('manageProjects'), validate(projectValidation.createProject), projectController.createProject);

// Get all projects
router.get('/', validate(projectValidation.getProjects), projectController.getProjects);

// Get my projects
router.get('/my-projects', auth('getProjects'), validate(projectValidation.getMyProjects), projectController.getMyProjects);

// Get a single project with proposals - Requires ownership
router.get(
  '/:projectId',
  auth('getProjects'),
  validate(projectValidation.getProject),
  verifyProjectOwnership,
  projectController.getProject
);

// View proposals for project - Only owner
router.get('/:projectId/proposals', auth('getProjects'), verifyProjectOwnership, proposalController.getProjectProposals);

// Update project - Requires ownership
router.patch(
  '/:projectId',
  auth('manageProjects'),
  validate(projectValidation.updateProject),
  verifyProjectOwnership,
  projectController.updateProject
);

// Delete project - Requires ownership
router.delete('/:projectId', auth('manageProjects'), verifyProjectOwnership, projectController.deleteProject);

module.exports = router;
