const productModel = require('../model/prod.model');
const fs = require('fs');
const path = require('path');

class productController{
    async addProduct(req,res){
        try{
            const photo = req.file?.filename;
            const {name, price, category, description} = req.body;
            if(!name || !price || !category, !description || !photo){
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
            const products = await productModel.aggregate([
                {
                    $match:{
                        isDeleted:false
                    }
                },
                {
                    $lookup:{
                        from:'cats',
                        localField:'category',
                        foreignField:'_id',
                        as:'category'
                    }
                },
                {
                    $unwind:{
                        path:'$category'
                    }
                },
                {
                    $project:{
                        name:1,
                        price:1,
                        photo:1,
                        description:1,
                        category:{
                            name:'$category.name',
                            _id:'$category._id'
                        }
                    }
                }
            ]);
            if(!products){
                return res.status(404).json({message:'No products found'});
            }else{
            return res.status(200).json({message:'Products fetched successfully', data:products});
            }
        }catch(err){
            throw err;
        }
    }
    async getProductById(req,res){
        try{
            const {id} = req.params;
            const product = await productModel.findOne({ _id: id, isDeleted: false });
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