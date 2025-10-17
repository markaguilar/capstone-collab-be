const { userValidation, studentValidation, developerValidation } = require('../validations');
const validate = require('./validate');

const validateByRole = (req, res, next) => {
  const userRole = req.user.role;

  let schema;
  if (userRole === 'student') {
    schema = studentValidation.updateStudent;
  } else if (userRole === 'developer') {
    schema = developerValidation.updateDeveloper;
  } else {
    schema = userValidation.updateUser;
  }

  validate(schema)(req, res, next);
};

module.exports = validateByRole;
