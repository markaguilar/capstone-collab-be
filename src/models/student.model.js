const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  major: {
    type: String,
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
