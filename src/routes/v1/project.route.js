const express = require('express');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { projectValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(auth('manageProjects'), validate(projectValidation.createProject), projectController.createProject)
  .get(validate(projectValidation.getProjects), projectController.getProjects);

router.route('/:projectId').get(auth('getProjects'), validate(projectValidation.getProject), projectController.getProject);

module.exports = router;
