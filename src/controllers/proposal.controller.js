const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { proposalService } = require('../services');
const pick = require('../utils/pick');

const createProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.createProposal({ developer: req.user.id, ...req.body });

  res.status(httpStatus.CREATED).send(proposal);
});

const getProposals = catchAsync(async (req, res) => {
  const filter = { developer: req.user.id, ...pick(req.query, ['status']) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const result = await proposalService.queryProposals(filter, options);

  res.send(result);
});

const getProposal = catchAsync(async (req, res) => {
  const proposal = await proposalService.getProposalById(req.params.id);
  if (!proposal) {
    res.status(httpStatus.NOT_FOUND).send('Proposal not found');
  }
  res.send(proposal);
});

module.exports = {
  createProposal,
  getProposals,
  getProposal,
};
