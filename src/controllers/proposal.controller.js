const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { proposalService } = require('../services');
const pick = require('../utils/pick');

const createProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.createProposal(req.user.id, req.params.projectId, req.body);

  res.status(httpStatus.CREATED).send(proposal);
});

const getProjectProposals = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const proposals = await proposalService.getProposalsByProjectId(req.params.projectId, filter, options);

  res.send(proposals);
});

const getProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.getProposalById(req.params.proposalId);
  res.send(proposal);
});

const acceptProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.acceptProposal(req.params.proposalId, req.user.id);

  res.send({
    message: 'Proposal accepted. Developer assigned to project.',
    proposal,
  });
});

const rejectProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.rejectProposal(req.params.proposalId, req.user.id, req.body.rejectionReason);

  res.send({
    message: 'Proposal rejected.',
    proposal,
  });
});

const withdrawProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.withdrawProposal(req.params.proposalId, req.user.id);

  res.send({
    message: 'Proposal withdrawn.',
    proposal,
  });
});

const getMyProposals = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const proposals = await proposalService.getDeveloperProposals(req.user.id, filter, options);

  res.send(proposals);
});

module.exports = {
  createProposal,
  getProjectProposals,
  getProposal,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  getMyProposals,
};
