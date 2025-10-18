const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createProposal = {
  body: Joi.object()
    .keys({
      projectId: objectId.required(),
      coverLetter: Joi.string().required().min(20).max(2000).trim(),
      proposedBudget: Joi.number().required().min(0),
      proposedDeadline: Joi.date().required().greater('now').messages({
        'date.greater': 'Proposed deadline must be in the future',
      }),
      estimatedDuration: Joi.string().required().valid('1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'),
      relevantExperience: Joi.string().max(1000).trim(),
      attachments: Joi.array().items(
        Joi.object().keys({
          fileName: Joi.string().required(),
          fileUrl: Joi.string().uri().required(),
        })
      ),
    })
    .required(),
};

const updateProposal = {
  params: Joi.object().keys({
    proposalId: objectId.required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().required().valid('accepted', 'rejected', 'withdrawn').messages({
        'any.only': 'Status must be accepted, rejected, or withdrawn',
      }),
      rejectionReason: Joi.string().max(500).when('status', {
        is: 'rejected',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    })
    .required(),
};

const getProposals = {
  params: Joi.object().keys({
    projectId: objectId.required(),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'withdrawn'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getProposal = {
  params: Joi.object().keys({
    proposalId: objectId.required(),
  }),
};

const withdrawProposal = {
  params: Joi.object().keys({
    proposalId: objectId.required(),
  }),
};

module.exports = {
  createProposal,
  updateProposal,
  getProposals,
  getProposal,
  withdrawProposal,
};
