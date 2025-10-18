const express = require('express');
const proposalController = require('../../controllers/proposal.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const verifyProjectOwnership = require('../../middlewares/verifyProjectOwnership');
const { proposalValidation } = require('../../validations');

const router = express.Router();

// Developer applies for a project
router.post(
  '/:projectId',
  auth('manageProposals'),
  validate(proposalValidation.createProposal),
  proposalController.createProposal
);

// Get developer's own proposals
router.get(
  '/my-proposals',
  auth('manageProposals'),
  validate(proposalValidation.getProposals),
  proposalController.getMyProposals
);

// Get proposals for a project (student only)
router
  .route('/project/:projectId')
  .get(
    auth('getProjects'),
    verifyProjectOwnership,
    validate(proposalValidation.getProposals),
    proposalController.getProjectProposals
  );

// Get a single proposal
router
  .route('/:proposalId')
  .get(auth('getProposals'), validate(proposalValidation.getProposal), proposalController.getProposal);

// Accept proposal (student)
router.route('/:proposalId/accept').patch(auth('manageProjects'), proposalController.acceptProposal);

// Reject proposal (student)
router
  .route('/:proposalId/reject')
  .patch(auth('manageProjects'), validate(proposalValidation.updateProposal), proposalController.rejectProposal);

// Withdraw proposal (developer)
router
  .route('/:proposalId/withdraw')
  .patch(auth('manageProposals'), validate(proposalValidation.withdrawProposal), proposalController.withdrawProposal);

module.exports = router;
