const Joi = require('joi');

const updateDeveloper = {
  body: Joi.object()
    .keys({
      // Common fields (optional, for flexibility)
      email: Joi.string().email(),
      name: Joi.string().min(2).max(50),
      username: Joi.string()
        .pattern(/^[a-zA-Z0-9_-]{3,16}$/)
        .message('Username must be 3-16 characters and can only contain letters, numbers, underscores and hyphens'),
      profilePicture: Joi.string().uri(),
      bio: Joi.string().max(500),

      // Developer-specific fields
      experience: Joi.number().integer().min(0),
      portfolio: Joi.string().uri(),
      skills: Joi.array().items(Joi.string()),
      applications: Joi.array().items(Joi.string().hex().length(24)),
    })
    .min(1),
};

module.exports = { updateDeveloper };
