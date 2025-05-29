const router = require('express').Router();
const reviewController = require('../controller/review.controller');


router.post('/add', reviewController.addReview);
router.get('/:productId', reviewController.getReviews);

module.exports = router;
