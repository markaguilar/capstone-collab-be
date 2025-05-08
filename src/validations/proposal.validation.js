const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProposal = {
  body: Joi.object().keys({
    project: Joi.string().custom(objectId),
    message: Joi.string().required(),
    status: Joi.string(),
  }),
};

const getProposals = {
  query: Joi.object().keys({
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getProposal = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProposal,
  getProposals,
  getProposal,
};
