const express = require('express');
const controller = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { validateObjectId } = require('../validators/common');

const router = express.Router();

router.get('/', auth, admin, controller.listUsers);
router.get('/:userId', validateObjectId('userId'), controller.getPublicProfile);
router.delete('/:userId', auth, admin, validateObjectId('userId'), controller.deleteUser);

module.exports = router;
