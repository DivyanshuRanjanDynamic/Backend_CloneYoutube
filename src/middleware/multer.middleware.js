import multer from "multer";
//multer is used to bring the file/images/videos from user and temporiarly upload to the local sever .so over all uploading a file is a 2 step process

const storage = multer.diskStorage({
    destination: function (req, file, cb)
     {
      cb(null,"./public/test")
    },
    filename: function (req, file, cb)
 {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer(
    {
     storage,
    }
)