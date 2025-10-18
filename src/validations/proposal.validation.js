const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProposal = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      coverLetter: Joi.string().required().min(20).max(2000).trim(),
      proposedBudget: Joi.number().required().min(0),
      proposedDeadline: Joi.date().required().greater('now').messages({
        'date.greater': 'Proposed deadline must be in the future',
      }),
      estimatedDuration: Joi.string().required().valid('1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'),
      relevantExperience: Joi.string().max(1000).trim(),
      attachments: Joi.array()
        .max(10)
        .items(
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
    proposalId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().required().valid('accepted', 'rejected', 'withdrawn').messages({
        'any.only': 'Status must be accepted, rejected, or withdrawn',
      }),
      /* biome-ignore lint/suspicious/noThenProperty: Joi conditionally requires `then` */
      rejectionReason: Joi.string().max(500).when('status', {
        is: 'rejected',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    })
    .required(),
};

const getProposals = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'withdrawn'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getProposal = {
  params: Joi.object().keys({
    proposalId: Joi.string().custom(objectId).required(),
  }),
};

const withdrawProposal = {
  params: Joi.object().keys({
    proposalId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createProposal,
  updateProposal,
  getProposals,
  getProposal,
  withdrawProposal,
};
