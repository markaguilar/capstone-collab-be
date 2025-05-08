const express = require('express');

const auth = require('../../middlewares/auth');
const { userController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth(), userController.getMe);

module.exports = router;
