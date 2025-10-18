const httpStatus = require('http-status');
const { Student } = require('../models');
const ApiError = require('../utils/ApiError');

const getStudentByUserId = async (userId) => {
  return Student.findById(userId);
};

const updateStudentProfile = async (userId, updateData) => {
  return Student.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true, runValidators: true });
};

const getStudentProfile = async (userId) => {
  const student = await Student.findOne({ userId });
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student profile not found');
  }

  return student;
};

module.exports = { getStudentByUserId, updateStudentProfile, getStudentProfile };
