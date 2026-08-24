const express = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/eventController');
const { validateObjectId } = require('../validators/common');
const { eventValidator, updateEventValidator } = require('../validators/contentValidators');

const router = express.Router();

router.route('/').get(controller.listEvents).post(auth, admin, upload.single('image'), eventValidator, controller.createEvent);
router.get('/:eventId', validateObjectId('eventId'), controller.getEvent);
router.patch('/:eventId', auth, admin, validateObjectId('eventId'), upload.single('image'), updateEventValidator, controller.updateEvent);
router.delete('/:eventId', auth, admin, validateObjectId('eventId'), controller.deleteEvent);
router.post('/:eventId/join', auth, validateObjectId('eventId'), controller.joinEvent);

module.exports = router;
