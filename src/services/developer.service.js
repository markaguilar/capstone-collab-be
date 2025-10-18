const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Developer } = require('../models');
const ApiError = require('../utils/ApiError');

const getDeveloperByUserId = async (userId) => {
  return Developer.findById(userId);
};

const updateDeveloperProfile = async (userId, updateBody) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid userId');
  }

  const developer = await Developer.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: updateBody },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      context: 'query',
    }
  );

  if (!developer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found');
  }

  return developer;
};

const getDeveloperProfile = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid userId');
  }

  const developer = await Developer.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (!developer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found');
  }

  return developer;
};

module.exports = { getDeveloperByUserId, updateDeveloperProfile, getDeveloperProfile };
