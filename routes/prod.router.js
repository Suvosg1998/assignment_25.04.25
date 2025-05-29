const router = require('express').Router();
const productController = require('../controller/prod.controller');
const auth = require('../middleware/auth')(); // Initialize auth middleware
const upload = require('../helper/fileUpload'); // Middleware for handling file uploads
const fileUpload = new upload({
    folderName: "uploads", supportedFiles: ["image/png", "image/jpg", "image/jpeg"], fieldSize: 1024 * 1024 * 5
});

// Admin-only routes
router.post('/add', productController.addProduct);
// router.post('/add', auth.authenticate, auth.authorize(['admin']), fileUpload.upload().single('photo'), productController.addProduct);
router.put('/edit/:id', auth.authenticate, auth.authorize(['admin']), fileUpload.upload().single('photo'), productController.editProduct);
router.delete('/delete/:id', auth.authenticate, auth.authorize(['admin']), productController.deleteProduct);

// User and Admin routes
//router.get('/all', auth.authenticate, auth.authorize(['admin', 'user']), productController.getAllProducts);
router.get('/all', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;