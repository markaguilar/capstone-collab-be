const Joi = require('joi');

const updateDeveloper = {
  body: Joi.object()
    .keys({
      // Common user fields
      name: Joi.string().min(2).max(50).trim(),
      username: Joi.string()
        .pattern(/^[a-zA-Z0-9_-]{3,16}$/)
        .messages({
          'string.pattern.base':
            'Username must be 3-16 characters and can only contain letters, numbers, underscores and hyphens',
        }),
      profilePicture: Joi.string().uri(),
      bio: Joi.string().max(500).trim(),

      // Developer-specific fields
      experience: Joi.number().integer().min(0).max(60),
      yearsOfExperience: Joi.number().integer().min(0).max(60),
      portfolio: Joi.string().uri(),
      skills: Joi.array().items(Joi.string().min(2).max(50).trim()).unique(),
      hourlyRate: Joi.number().min(0),

      // Not allowed in update
      applications: Joi.forbidden(), // Don't allow manual updates to applications
    })
    .min(1)
    .unknown(false), // Reject unknown fields
};

module.exports = { updateDeveloper };
