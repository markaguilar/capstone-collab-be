const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProject = {
  body: Joi.object()
    .keys({
      title: Joi.string().required().min(5).max(200).trim(),
      description: Joi.string().required().min(20).max(5000).trim(),
      skillsRequired: Joi.array().items(Joi.string().min(2).max(50).trim()).required().min(1),
      category: Joi.string().valid('web', 'mobile', 'desktop', 'ai', 'data', 'other').required(),
      budget: Joi.number().required().min(0),
      currency: Joi.string().valid('USD', 'EUR', 'PHP', 'INR', 'GBP').default('USD'),
      deadline: Joi.date().required().greater('now').messages({
        'date.base': 'Deadline must be a valid date',
        'date.greater': 'Deadline must be in the future',
      }),
      duration: Joi.string().valid('1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months').required(),
      isPublic: Joi.boolean().default(true),
      maxDevelopers: Joi.number().integer().min(1).default(1),
      tags: Joi.array().items(Joi.string().max(30).trim()),
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

const updateProject = {
  body: Joi.object()
    .keys({
      title: Joi.string().min(5).max(200).trim(),
      description: Joi.string().min(20).max(5000).trim(),
      skillsRequired: Joi.array().items(Joi.string().min(2).max(50).trim()).min(1),
      category: Joi.string().valid('web', 'mobile', 'desktop', 'ai', 'data', 'other'),
      budget: Joi.number().min(0),
      currency: Joi.string().valid('USD', 'EUR', 'PHP', 'INR', 'GBP'),
      deadline: Joi.date().greater('now').messages({
        'date.greater': 'Deadline must be in the future',
      }),
      duration: Joi.string().valid('1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'),
      status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled'),
      isPublic: Joi.boolean(),
      maxDevelopers: Joi.number().integer().min(1),
      tags: Joi.array().items(Joi.string().max(30).trim()),
      attachments: Joi.array()
        .max(10)
        .items(
          Joi.object().keys({
            fileName: Joi.string().required(),
            fileUrl: Joi.string().uri().required(),
          })
        ),
    })
    .min(1), // At least one field must be provided
};

const getProjects = {
  query: Joi.object().keys({
    title: Joi.string().trim(),
    category: Joi.string().valid('web', 'mobile', 'desktop', 'ai', 'data', 'other'),
    status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled'),
    minBudget: Joi.number().min(0),
    maxBudget: Joi.number()
      .min(0)
      .when('minBudget', {
        is: Joi.number().min(0),
        then: Joi.number().min(Joi.ref('minBudget')),
      }),
    skillsRequired: Joi.array().items(Joi.string()),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getMyProjects = {
  query: Joi.object().keys({
    status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1),
  }),
};

const getProject = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId).required(),
  }),
};

const deleteProject = {
  params: Joi.object().keys({
    projectId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createProject,
  updateProject,
  getProjects,
  getMyProjects,
  getProject,
  deleteProject,
};
