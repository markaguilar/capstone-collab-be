const express = require('express');
const proposalController = require('../../controllers/proposal.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const verifyProjectOwnership = require('../../middlewares/verifyProjectOwnership');
const { verifyProjectOwnerForProposal, verifyProposalAuthor } = require('../../middlewares/verifyProposalOwnership');
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

// Get proposals for a project (student only - project owner)
router.get(
  '/project/:projectId',
  auth('getProjects'),
  verifyProjectOwnership,
  validate(proposalValidation.getProposals),
  proposalController.getProjectProposals
);

// Get a single proposal
router.get('/:proposalId', auth('getProposals'), validate(proposalValidation.getProposal), proposalController.getProposal);

// Accept proposal (student - must own the project)
router.patch(
  '/:proposalId/accept',
  auth('manageProjects'),
  verifyProjectOwnerForProposal, // ✅ SECURITY FIX
  validate(proposalValidation.updateProposal),
  proposalController.acceptProposal
);

// Reject proposal (student - must own the project)
router.patch(
  '/:proposalId/reject',
  auth('manageProjects'),
  verifyProjectOwnerForProposal, // ✅ SECURITY FIX
  validate(proposalValidation.updateProposal),
  proposalController.rejectProposal
);

// Withdraw proposal (developer - must be proposal author)
router.patch(
  '/:proposalId/withdraw',
  auth('manageProposals'),
  verifyProposalAuthor, // ✅ SECURITY FIX
  validate(proposalValidation.withdrawProposal),
  proposalController.withdrawProposal
);

module.exports = router;
