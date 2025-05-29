const productModel = require('../model/prod.model');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


class productController{
    async addProduct(req,res){
        try{
            const photo = req.file?.filename;
            const {name, price, category, description} = req.body;
            if(!name || !price || !category, !description ){
                if(photo){
                    fs.unlinkSync(path.join(__dirname, '../uploads', photo));
                }
                return res.status(400).json({message:'Please fill all the fields'});
            }
            const product = await productModel.create({
                name,
                price,
                category,
                description,
                photo
            });
            return res.status(200).json({message:'Product added successfully',product});
        }catch(err){
            throw err;
        }
    }
    async getAllProducts(req,res){
        try{
            let options = { page : 1, limit : 10}
            const products =  productModel.aggregate([
                {
                    $match:{
                        isDeleted:false
                    }
                },
                {
                    $lookup:{
                        from:'cats',
                        let:{categoryId:'$category'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$_id','$$categoryId']
                                    }
                                }
                            },
                            {
                                $project:{
                                    name:1,
                                    _id:1
                                }
                            }
                        ],
                        as:'category'
                    }
                },
                {
                    $unwind: {
                        path: '$category'
                    }
                }
            ]);


            let aggregatePaginateData = await productModel.aggregatePaginate(products, options);

            console.log(aggregatePaginateData, "aggregatePaginateDataaggregatePaginateDataaggregatePaginateData");
            

            if(!aggregatePaginateData){
                return res.status(404).json({message:'No products found'});
            }else{
            return res.status(200).json({message:'Products fetched successfully',total: aggregatePaginateData.total, page:aggregatePaginateData.page,limit:aggregatePaginateData.limit,totalPages:aggregatePaginateData.pages,data:aggregatePaginateData.docs,});
            }
        }catch(err){
            throw err;
        }
    }
    // Get product by ID
    async getProductById(req,res){
        try{
            const {id} = req.params;
            const product = await productModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'cats',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: {
                        path: '$category'
                    }
                }
                ,
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'product',
                        as: 'reviews'
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        photo: 1,
                        description: 1,
                        category: {
                            name: '$category.name',
                            _id: '$category._id'
                        },
                        avgReview: {
                            $avg: '$reviews.rating'
                        },
                        totalReviews: {
                            $size: '$reviews'
                        },
                        reviewStats: {
                        oneStar: {
                            $size:{
                                    $filter: {
                                        input: '$reviews',
                                        as: 'review',
                                        cond: { $eq: ['$$review.rating', 1] }
                                    }
                                }
                        },
                        twoStar: {
                            $size:{
                                    $filter: {
                                        input: '$reviews',
                                        as: 'review',
                                        cond: { $eq: ['$$review.rating', 2] }
                                    }
                                }
                            },
                            threeStar: {
                                $size:{
                                    $filter: {
                                        input: '$reviews',
                                        as: 'review',
                                        cond: { $eq: ['$$review.rating', 3] }
                                    }
                                }
                            },
                            fourStar: {
                                $size:{
                                    $filter: {
                                        input: '$reviews',
                                        as: 'review',
                                        cond: { $eq: ['$$review.rating', 4] }
                                    }
                                }
                            },
                            fiveStar: {
                                $size:{
                                    $filter: {
                                        input: '$reviews',
                                        as: 'review',
                                        cond: { $eq: ['$$review.rating', 5] }
                                    }
                                }
                            }
                        }

                     }
                    }
            ]);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            return res.status(200).json({ message: 'Product fetched successfully', product });
        }catch(err){
            throw err;
        }
    }
    async editProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, price, category, description } = req.body;
            const photo = req.file?.filename;

            const product = await productModel.findOne({ _id: id, isDeleted: false });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // If a new photo is uploaded, delete the old one
            if (photo && product.photo) {
                fs.unlinkSync(path.join(__dirname, '../uploads', product.photo));
            }

            // Update the product
            const updatedProduct = await productModel.findByIdAndUpdate(
                id,
                {
                    name,
                    price,
                    category,
                    description,
                    photo: photo || product.photo
                },
                { new: true }
            );

            return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } catch (err) {
            throw err;
        }
    }

    // Soft delete product
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await productModel.findOne({ _id: id, isDeleted: false });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Mark the product as deleted
            await productModel.findByIdAndUpdate(id, { isDeleted: true });

            return res.status(200).json({ message: 'Product deleted successfully' });
        } catch (err) {
            throw err;
        }
    }
}
module.exports = new productController();