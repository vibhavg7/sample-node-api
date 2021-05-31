const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { v4: uuidv4 } = require('uuid');

aws.config.update({
  secretAccessKey: process.env.secretAccessKey,
  accessKeyId: process.env.accessKeyId,
  region: process.env.region
});

const s3 = new aws.S3();
const isAllowedMimetype = (mime) => ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/x-ms-bmp', 'image/webp'].includes(mime.toString());


const fileFilter = (req, file, cb) => {
  const fileMime = file.mimetype;
  if (isAllowedMimetype(fileMime)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid mime type, only jpeg and png allowed"),false);
  }
  // if((file.mimetype === 'image/jpeg') ||(file.mimetype === 'image/png')){
  //     cb(null,true);
  // }
  // else {
  //     cb(new Error("Invalid mime type, only jpeg and png allowed"),false);
  // }
}

const getUniqFileName = (originalname) => {
  const name = uuidv4();
  const ext = originalname.split('.').pop();
  return `${name}.${ext}`;
}

const uploadImage = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    // metadata: function (req, file, cb) {
    //   cb(null, {fieldName: 'TESTING_META_DETA!'});
    // },
    key: function (req, file, cb) {
      const fileName = getUniqFileName(file.originalname);
      file.newName = fileName;
      cb(null, fileName);
    }
  })
})


module.exports = uploadImage;
