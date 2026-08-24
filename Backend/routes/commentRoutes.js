const express = require('express');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const controller = require('../controllers/commentController');
const { validateObjectId } = require('../validators/common');
const { commentValidator, commentVisibilityValidator, updateCommentValidator } = require('../validators/contentValidators');

const router = express.Router();

router.route('/').get(controller.listComments).post(auth, commentValidator, controller.createComment);
router.get('/admin', auth, admin, controller.listAllComments);
router.patch('/:commentId', auth, admin, validateObjectId('commentId'), updateCommentValidator, controller.updateComment);
router.patch('/:commentId/visibility', auth, validateObjectId('commentId'), commentVisibilityValidator, controller.setCommentVisibility);
router.delete('/:commentId', auth, validateObjectId('commentId'), controller.deleteComment);

module.exports = router;
