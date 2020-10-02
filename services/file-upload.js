const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')


aws.config.update({  
  secretAccessKey: process.env.secretAccessKey,
  accessKeyId: process.env.accessKeyId,
  region: process.env.region
});

const s3 = new aws.S3();

const fileFilter = (req,file,cb) =>{
    if((file.mimetype === 'image/jpeg') ||(file.mimetype === 'image/png')){
        cb(null,true);
    }
    else {
        cb(new Error("Invalid mime type, only jpeg and png allowed"),false);
    }
}
 
const uploadImage = multer({
  fileFilter :fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: 'images-upload-grostep',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'TESTING_META_DETA!'});
    },
    key: function (req, file, cb) {
      cb(null, new Date().toISOString() + '-' + file.originalname)
    }
  })
})

module.exports = uploadImage;
