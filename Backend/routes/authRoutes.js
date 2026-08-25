const express = require('express');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/authController');
const { registerValidator, loginValidator, profileValidator } = require('../validators/authValidators');




const router = express.Router();

router.post('/register', registerValidator, controller.register);
router.post('/login', loginValidator, controller.login);
router.post('/logout', auth, controller.logout);
router.get('/me', auth, controller.getCurrentUser);
router.patch('/profile', auth, upload.single('profileImage'), profileValidator, controller.updateProfile);

module.exports = router;
