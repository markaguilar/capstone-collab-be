const express = require('express');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { projectValidation } = require('../../validations');
const verifyProjectOwnership = require('../../middlewares/verifyProjectOwnership');

const router = express.Router();

router
  .route('/')
  .post(auth('manageProjects'), validate(projectValidation.createProject), projectController.createProject)
  .get(validate(projectValidation.getProjects), projectController.getProjects);

router
  .route('/my-projects')
  .get(auth('getProjects'), validate(projectValidation.getMyProjects), projectController.getMyProjects);

router
  .route('/:projectId')
  .get(auth('getProjects'), validate(projectValidation.getProject), verifyProjectOwnership, projectController.getProject);

module.exports = router;
