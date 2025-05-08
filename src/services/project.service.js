const httpStatus = require('http-status');
const { Project } = require('../models');
const { getUserById } = require('./user.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (projectBody) => {
  const student = await getUserById(projectBody.student);
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
  }
  return Project.create(projectBody);
};

/**
 * Query for projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<void>}
 */
const queryProjects = async (filter, options) => {
  const projects = await Project.paginate(filter, options);
  return projects;
};

/**
 * Get a project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Project.findById(id);
};

/**
 * Get a project by id
 * @param {ObjectId} projectId
 * @returns {Promise<Project>}
 */
const getProjectOwnershipInfo = async (projectId) => {
  return Project.findById(projectId).select('student').lean();
};

/**
 * Query for feature projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {number} [options.createdAt]
 * @returns {Promise<void>}
 */
const getFeaturedProjects = async (filter = {}, options = {}) => {
  const paginateOptions = {
    ...options,
    populate: {
      path: 'student',
      select: 'name username email',
    },
    sortBy: options.sortBy || 'createdAt:desc',
    limit: parseInt(options.limit, 10) || 10,
    page: parseInt(options.page, 10) || 1,
  };

  return Project.paginate({ isFeatured: true, ...filter }, paginateOptions);
};

module.exports = {
  createProject,
  queryProjects,
  getProjectById,
  getProjectOwnershipInfo,
  getFeaturedProjects,
};
