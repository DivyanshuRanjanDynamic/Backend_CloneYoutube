import { v2 as cloudinary } from 'cloudinary'   
import fs from "fs";
//CLOUDINARY USED to upload the file from local server to cloudinary server
 //Multer is used to upload the file from user to the localserver temporiary
  //as soon as file /photo/video get upload at cloudinary sucessfully ,unlink that file/photo/video from the local server


  //config the cloudinary 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_KEY, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const uploadOnCloudinary= async (localStorageURL)=>
{
    try
    {
        if(!localStorage) return null;
        //upload the file in cloudinary

        const result = await cloudinary.uploader.upload(localStorageURL,
             {
                resource_type: "auto"
             })
             //file has been uploaded sucessfully
           //cosole.log('file has been uploaded sucessfully',result.url)


             //now unlink or delete  the file from the local temporary server
             
            fs.unlinkSync(localStorageURL)

             return result ;
     }
     catch(error)
  {
    fs.unlinkSync(localStorageURL)
    return null;
  }
}


export default uploadOnCloudinary