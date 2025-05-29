const ReviewModel = require('../model/review.model');
const mongoose = require('mongoose');

class ReviewController {
    async addReview(req, res) {
        try {
            const {  user,product, rating, comment } = req.body;
            const review = await ReviewModel.create({
                user,
                product,
                rating,
                comment
            });
            if (!user || !product || !rating || !comment) {
                return res.status(400).json({ message: 'Please fill all the fields' });
            }
            res.status(201).json({ message: 'Review added successfully', data: review });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error adding review' });
        }
    }
    async getReviews(req, res) {
        try {
            const { productId } = req.params;
            const reviews = await ReviewModel.aggregate([
                {
                    $match: { product: new mongoose.Types.ObjectId(productId) }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                },
                {
                    $project: {
                        _id: 1,
                        rating: 1,
                        comment: 1,
                        createdAt: 1,
                        userName: '$userDetails.name',
                        userPhoto: '$userDetails.photo'
                    }
                }
            ])
            res.status(200).json(reviews);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching reviews' });
        }
    }
}

module.exports = new ReviewController();