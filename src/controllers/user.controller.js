const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const { userService, studentService } = require('../services');
const { updateDeveloperProfile } = require('../services/developer.service');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const getPublicUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send({
    name: user.name,
    username: user.username,
    email: user.email,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  let roleData = null;

  if (user.role === 'student') {
    roleData = await studentService.getStudentByUserId(user.id);
  }

  res.send({ user, roleData });
});

/* const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
}); */

const updateMe = catchAsync(async (req, res) => {
  // Get user to determine role
  const user = await userService.getUserById(req.user.id);

  // Separate common fields from role-specific fields
  const commonFields = ['name', 'email', 'password', 'profileImage', 'bio', 'skills'];
  const commonUpdates = {};
  const roleUpdates = {};

  Object.keys(req.body).forEach((key) => {
    if (commonFields.includes(key)) {
      commonUpdates[key] = req.body[key];
    } else {
      roleUpdates[key] = req.body[key];
    }
  });

  // Update user model with common fields
  let updatedUser = user;
  if (Object.keys(commonUpdates).length > 0) {
    updatedUser = await userService.updateUserById(req.user.id, commonUpdates);
  }

  // Update role-specific model
  let roleData = null;
  if (Object.keys(roleUpdates).length > 0) {
    if (user.role === 'student') {
      roleData = await studentService.updateStudentProfile(req.user.id, roleUpdates);
    } else if (user.role === 'developer') {
      roleData = await updateDeveloperProfile(req.user.id, roleUpdates);
    }
  }

  res.send({
    user: updatedUser,
    roleData,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send({
    name: user.name,
    username: user.username,
    email: user.email,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getPublicUser,
  getMe,
  updateMe,
  updateUser,
  deleteUser,
};
