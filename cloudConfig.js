const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// .config is to link backend with cloudinary 

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME ,
    api_key: process.env.CLOUD_API_KEY ,
    api_secret: process.env.CLOUD_API_SECRET ,
});

const cloudstorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ResumePro',
    allowerdformats: ["png" , "jpeg" , "jpg" , "svg" ] // supports promises as well
  },
});

module.exports = {
    cloudinary,
    cloudstorage,
};