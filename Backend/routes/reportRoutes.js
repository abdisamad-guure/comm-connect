const express = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const controller = require('../controllers/reportController');
const { validateObjectId } = require('../validators/common');
const { reportValidator, reportStatusValidator } = require('../validators/contentValidators');

const router = express.Router();

router.route('/').get(auth, controller.listReports).post(auth, reportValidator, controller.createReport);
router.get('/:reportId', auth, validateObjectId('reportId'), controller.getReport);
router.patch('/:reportId/status', auth, admin, validateObjectId('reportId'), reportStatusValidator, controller.updateReportStatus);

module.exports = router;
