// services/project.service.js
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
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const project = await Project.create(projectBody);

  return project.populate('student', 'id name username profilePicture');
};

/**
 * Query for projects with filtering and pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Array>}
 */
const queryProjects = async (filter = {}, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1, ...restOptions } = options;

  const paginateOptions = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
    populate: {
      path: 'student',
      select: 'name username profilePicture',
    },
    ...restOptions,
  };

  return Project.paginate(filter, paginateOptions);
};

/**
 * Get a project by id with student details
 * @param {ObjectId} projectId
 * @returns {Promise<Project>}
 */
const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('student', 'id name username profilePicture email')
    .populate('assignedDeveloper', 'id name username profilePicture portfolio');

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * Get project ownership info for verification
 * @param {ObjectId} projectId
 * @returns {Promise<Project>}
 */
const getProjectOwnershipInfo = async (projectId) => {
  const project = await Project.findById(projectId).select('_id student').lean();

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * Query for featured projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
const getFeaturedProjects = async (filter = {}, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1, ...restOptions } = options;

  const paginateOptions = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
    populate: {
      path: 'student',
      select: 'name username profilePicture',
    },
    ...restOptions,
  };

  return Project.paginate({ isFeatured: true, status: 'open', ...filter }, paginateOptions);
};

/**
 * Update project by id
 * @param {ObjectId} projectId
 * @param {Object} updateBody
 * @returns {Promise<Project>}
 */
const updateProjectById = async (projectId, updateBody) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Don't allow updating these fields
  const restrictedFields = ['student', 'proposalCount', 'viewCount'];
  restrictedFields.forEach((field) => {
    // eslint-disable-next-line no-param-reassign
    delete updateBody[field];
  });

  Object.assign(project, updateBody);
  await project.save();

  return project.populate('student', 'id name username profilePicture');
};

/**
 * Delete a project by id
 * @param {ObjectId} projectId
 * @returns {Promise<void>}
 */
const deleteProjectById = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * Get projects by student
 * @param {ObjectId} studentId
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
const getProjectsByStudentId = async (studentId, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1, ...restOptions } = options;

  const paginateOptions = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
    ...restOptions,
  };

  return Project.paginate({ student: studentId }, paginateOptions);
};

/**
 * Assign developer to project
 * @param {ObjectId} projectId
 * @param {ObjectId} developerId
 * @returns {Promise<Project>}
 */
const assignDeveloper = async (projectId, developerId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      assignedDeveloper: developerId,
      status: 'in_progress',
    },
    { new: true, runValidators: true }
  ).populate('assignedDeveloper', 'id name username profilePicture');

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * Update project status
 * @param {ObjectId} projectId
 * @param {string} status - 'open', 'in_progress', 'completed', 'cancelled'
 * @returns {Promise<Project>}
 */
const updateProjectStatus = async (projectId, status) => {
  const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const project = await Project.findByIdAndUpdate(projectId, { status }, { new: true, runValidators: true }).populate(
    'student',
    'id name username profilePicture'
  );

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  return project;
};

/**
 * Increment project view count
 * @param {ObjectId} projectId
 * @returns {Promise<void>}
 */
const incrementViewCount = async (projectId) => {
  await Project.findByIdAndUpdate(projectId, { $inc: { viewCount: 1 } }, { new: true });
};

/**
 * Search projects by title, skills, or category
 * @param {string} searchTerm
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
const searchProjects = async (searchTerm, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1, ...restOptions } = options;

  const paginateOptions = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
    populate: {
      path: 'student',
      select: 'name username profilePicture',
    },
    ...restOptions,
  };

  const searchFilter = {
    status: 'open',
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { skillsRequired: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
    ],
  };

  return Project.paginate(searchFilter, paginateOptions);
};

/**
 * Get projects by category
 * @param {string} category
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
const getProjectsByCategory = async (category, options = {}) => {
  const { sortBy = 'createdAt:desc', limit = 10, page = 1, ...restOptions } = options;

  const paginateOptions = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
    populate: {
      path: 'student',
      select: 'name username profilePicture',
    },
    ...restOptions,
  };

  return Project.paginate({ category, status: 'open' }, paginateOptions);
};

module.exports = {
  createProject,
  queryProjects,
  getProjectById,
  getProjectOwnershipInfo,
  getFeaturedProjects,
  updateProjectById,
  deleteProjectById,
  getProjectsByStudentId,
  assignDeveloper,
  updateProjectStatus,
  incrementViewCount,
  searchProjects,
  getProjectsByCategory,
};
