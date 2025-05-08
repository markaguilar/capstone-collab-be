const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { proposalValidation } = require('../../validations');
const { proposalController } = require('../../controllers');

const router = express.Router();
router
  .route('/')
  .post(auth('manageProposals'), validate(proposalValidation.createProposal), proposalController.createProposal)
  .get(auth('getProposals'), proposalController.getProposals);

router
  .route('/:proposalId')
  .get(auth('getProposals'), validate(proposalValidation.getProposal), proposalController.getProposal);

module.exports = router;
