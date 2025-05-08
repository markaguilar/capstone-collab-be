const allRoles = {
  student: ['manageProjects', 'getProjects'],
  developer: ['manageProposals', 'getProposals'],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
