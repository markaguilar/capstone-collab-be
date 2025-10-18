const httpStatus = require('http-status');
const { Developer } = require('../models');
const ApiError = require('../utils/ApiError');

const getDeveloperByUserId = async (userId) => {
  return Developer.findById({ userId }).lean();
};

const updateDeveloperProfile = async (userId, updateBody) => {
  const developer = await Developer.findByIdAndUpdate(
    { userId },
    { $set: updateBody, $setOnInsert: { userId, experience: 0, skills: [] } },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      runSettersOnQuery: true,
      context: 'query',
    }
  );

  if (!developer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found');
  }

  return developer;
};

const getDeveloperProfile = async (userId) => {
  const developer = await Developer.findOne({ userId }).lean();
  if (!developer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Developer not found');
  }

  return developer;
};

module.exports = { getDeveloperByUserId, updateDeveloperProfile, getDeveloperProfile };
