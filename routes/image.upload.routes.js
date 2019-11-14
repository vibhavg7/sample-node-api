var express = require('express');
var router = express.Router();
var uploadImage = require("../services/file-upload");
const singleUpload = uploadImage.single('image');
var productsController = require("../controllers/products.controller");
// var categoryController = require("../controllers/category.controller");
// var storesController = require("../controllers/stores.controller");

router.post('/products/:productId',function(req, res, next) {
        singleUpload(req, res, function (err) {
        if (err) {            
            return res.status(422).send({ errors: [{ title: 'File Upload Error',key1:process.env.SECRET_ACCESS_KEY,key3:process.env, detail: err.message }] });
        }
        productsController.updateProductImages(req.params.productId, req.file.location, req, res);
    })  
});








// app.post('/products/:productId', (req, res) => {
//     singleUpload(req, res, function (err) {
//         if (err) {            
//             return res.status(422).send({ errors: [{ title: 'File Upload Error',key:process.env.secretAccessKey,key2:process.env.accessKeyId,key3:process.env.region, detail: err.message }] });
//         }
//         productsController.updateProductImages(req.params.productId, req.file.location, req, res);
//     })
// });



module.exports = router;