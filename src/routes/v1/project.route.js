const express = require('express');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { projectValidation } = require('../../validations');
const verifyProjectOwnership = require('../../middlewares/verifyProjectOwnerShip');

const router = express.Router();

router
  .route('/')
  .post(auth('manageProjects'), validate(projectValidation.createProject), projectController.createProject)
  .get(auth('getProjects'), validate(projectValidation.getProjects), projectController.getProjects);

router
  .route('/:projectId')
  .get(auth('getProjects'), validate(projectValidation.getProject), verifyProjectOwnership, projectController.getProject);

module.exports = router;
