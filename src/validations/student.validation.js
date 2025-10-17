const Joi = require('joi');

const updateStudent = {
  body: Joi.object()
    .keys({
      // Common fields (optional, for flexibility)
      email: Joi.string().email(),
      name: Joi.string().min(2).max(50),
      username: Joi.string()
        .required()
        .pattern(/^[a-zA-Z0-9_-]{3,16}$/)
        .message('Username must be 3-16 characters and can only contain letters, numbers, underscores and hyphens'),

      profileImage: Joi.string().uri(),
      bio: Joi.string().max(500),

      university: Joi.string().max(100),
      major: Joi.string().max(100),
      semester: Joi.number().integer().min(1).max(8),
      cgpa: Joi.number().min(0).max(4),
      projects: Joi.array().items(Joi.string()),
    })
    .min(1),
};

module.exports = { updateStudent };
