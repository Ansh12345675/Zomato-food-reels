const express = require('express');
const multer = require('multer');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('video/')) {
      return callback(new Error('Please upload a video file.'));
    }

    return callback(null, true);
  }
});
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Please upload an image file.'));
    }

    return callback(null, true);
  }
});

function uploadVideo(req, res, next) {
  upload.single('video')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Video must be 100 MB or smaller.' });
    }

    return res.status(400).json({ message: error.message || 'Could not process video upload.' });
  });
}

function uploadProfilePhoto(req, res, next) {
  photoUpload.single('photo')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Profile photo must be 5 MB or smaller.' });
    }

    return res.status(400).json({ message: error.message || 'Could not process profile photo.' });
  });
}

router.post('/', authMiddleware.authFoodPartner, uploadVideo, foodController.createFood);
router.get('/partner/me', authMiddleware.authFoodPartner, foodController.getFoodPartnerProfile);
router.patch('/partner/me/photo', authMiddleware.authFoodPartner, uploadProfilePhoto, foodController.updateFoodPartnerPhoto);
router.delete('/:foodId', authMiddleware.authFoodPartner, foodController.deleteFood);
router.get('/partner/:partnerId', foodController.getFoodByPartner);
router.get('/', foodController.getFood);


/*GET /api/food/ [protected] */
router.get("/",
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems
)
router.post('/likes', authMiddleware.authUserMiddleware, foodController.likesFood);
router.post('/save', authMiddleware.authUserMiddleware, foodController.saveFood);
module.exports = router;