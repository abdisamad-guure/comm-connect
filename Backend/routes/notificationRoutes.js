const express = require('express');
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/notificationController');
const { validateObjectId } = require('../validators/common');

const router = express.Router();

router.get('/', auth, controller.listNotifications);
router.patch('/read-all', auth, controller.markAllNotificationsRead);
router.patch('/:notificationId/read', auth, validateObjectId('notificationId'), controller.markNotificationRead);

module.exports = router;
