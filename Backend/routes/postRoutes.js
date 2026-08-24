const express = require('express');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/postController');
const { validateObjectId } = require('../validators/common');
const { createPostValidator, updatePostValidator } = require('../validators/contentValidators');

const router = express.Router();

router.route('/').get(controller.listPosts).post(auth, upload.single('image'), createPostValidator, controller.createPost);
router.get('/:postId', validateObjectId('postId'), controller.getPost);
router.patch('/:postId', auth, validateObjectId('postId'), upload.single('image'), updatePostValidator, controller.updatePost);
router.delete('/:postId', auth, validateObjectId('postId'), controller.deletePost);
router.post('/:postId/like', auth, validateObjectId('postId'), controller.toggleLike);

module.exports = router;
