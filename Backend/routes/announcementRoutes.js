const express = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/announcementController');
const { validateObjectId } = require('../validators/common');
const { announcementValidator, updateAnnouncementValidator } = require('../validators/contentValidators');

const router = express.Router();

router.route('/').get(controller.listAnnouncements).post(auth, admin, upload.single('image'), announcementValidator, controller.createAnnouncement);
router.get('/:announcementId', validateObjectId('announcementId'), controller.getAnnouncement);
router.patch('/:announcementId', auth, admin, validateObjectId('announcementId'), upload.single('image'), updateAnnouncementValidator, controller.updateAnnouncement);
router.delete('/:announcementId', auth, admin, validateObjectId('announcementId'), controller.deleteAnnouncement);

module.exports = router;
