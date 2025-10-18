/**
 * Project status enum and valid transitions
 * Centralized to prevent duplication and ensure consistency
 */
const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Valid status transitions
 * Prevent illegal state changes (e.g., completed -> open)
 */
const STATUS_TRANSITIONS = {
  [PROJECT_STATUS.OPEN]: [PROJECT_STATUS.IN_PROGRESS, PROJECT_STATUS.CANCELLED],
  [PROJECT_STATUS.IN_PROGRESS]: [PROJECT_STATUS.COMPLETED, PROJECT_STATUS.CANCELLED],
  [PROJECT_STATUS.COMPLETED]: [],
  [PROJECT_STATUS.CANCELLED]: [],
};

module.exports = {
  PROJECT_STATUS,
  STATUS_TRANSITIONS,
};
