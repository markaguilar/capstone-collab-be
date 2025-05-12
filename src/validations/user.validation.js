const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    username: Joi.string().required(),
    role: Joi.string().required().valid('developer', 'student'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateMe = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      // TODO: Enable password updates after implementing proper password change flow with current password verification
      // password: Joi.string().custom(password),
      name: Joi.string(),
      username: Joi.string()
        .required()
        .pattern(/^[a-zA-Z0-9_-]{3,16}$/)
        .message('Username must be 3-16 characters and can only contain letters, numbers, underscores and hyphens'),
    })
    .min(1),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateMe,
  updateUser,
  deleteUser,
};
