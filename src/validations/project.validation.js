const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProject = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    skillsRequired: Joi.array().items(Joi.string()).required(),
    budget: Joi.number().integer(),
    deadline: Joi.date().iso().required(),
    isFeatured: Joi.boolean(),
    status: Joi.string(),
  }),
};

const getProjects = {
  query: Joi.object().keys({
    student: Joi.string().custom(objectId),
    title: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProject = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProject,
  getProjects,
  getProject,
};
