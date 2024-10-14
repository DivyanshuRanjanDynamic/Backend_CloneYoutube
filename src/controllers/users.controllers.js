import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import validator from "validator" // it is used to validate that our email is of correct formate along with the domain name
// import dns from "dns" // Verify the Email Domain Using DNS Lookup
import {z} from "zod";//for the schemas of password ,email,etc...
import zxcvbn from "zxcvbn";// provide the score between 0 to 4 to the passwords according to its strengh .if score is =>3 ,it is cosider as strong password 
import crypto from "crypto";//this is for sggesting and generating  a strong password 
 import { User } from "../modals/users.model.js";
//  import { ImageAnnotatorClient } from '@google-cloud/vision';//Import the Google Cloud Vision client library
 import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import { console } from "inspector";


// const client =new ImageAnnotatorClient();

const registerUser= asyncHandler(  async ( req, res )=>
{
 // get user details from frontend 
 const {username,fullName,email,password}=req.body 

 //validate the users information -like empty check
  if([username,fullName,email,password].some((field)=> field ?.trim() === ""))
  {
    throw new ApiError(400,"All fields are required")
  }
//validate the users information - like email is on the correct formate  and verify the email domain using DNS lookup
   // Validate email format
   if (!validator.isEmail(email)) {
    throw new ApiError(200, "Format of your email is incorrect");
}

// async function validateEmail(email) {
//     // Validate email format
//     if (!validator.isEmail(email)) {
//         throw new ApiError(200, "Format of your email is incorrect");
//     }

//     // Extract domain from email
//     const domain = email.split("@")[1];

//     try {
//         // Use await to resolve the MX records
//         const addresses = dns.resolveMx(domain);

//         // Check if addresses are found
//         if (addresses.length === 0) {
//             throw new ApiError(400, "Domain not found");
//         }
//     } catch (err) {
//         throw new ApiError(400, "Domain name is invalid");
//     }
// }
 
// if(!validateEmail(email))
//  {
//    new ApiError(400,"Wrong Email")
//  }

//to ensure that the password given by user is strong or not ,if not then  suggest them/him a strong password 


     //Function to generate a cryptographically secure strong password
const generateStrongPassword=(length=10)=>
{
    const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const randomBytes=crypto.randomBytes(length)  //randomBytes in Node.js returns a Buffer, which is a type of array-like object that contains raw binary data. A Buffer contains binary data, and each element is a byte (0-255).we can easily convert the buffer to a regular array if needed for processing by using  this Array.from(randomBytes); where randomBytes returns " Buffer"
    const passwordArray=[];

    //map each byte to a character from the "chars" string 
    for(let i=0;i<length;i++)
    {
        const randomIndex=randomBytes[i] % chars.length;
        passwordArray.push(chars[randomIndex])
    }
    return passwordArray.join(''); //return the password as a string 
}

     // zod schema for strong password 
     const passwordSchema=z.string()
     .min(6,"Passsword must be atleast 6 Character long")
     .regex(/[A-Z]/,"Passsword must have  atleast one upperCase Letter")
     .regex(/[a-z]/,"Passsword must have atleast one lowerCase Letter")
     .regex(/[@!#$%^&*(),.?":{}|<>~]/,'Passsword must have atleast one symbol')
     .regex(/[0-9]/,'Passsword must have atleast one number')

     //check password strength using zxcvbn
 const isPasswordstrong=( async(password) =>
    {
          const result= zxcvbn(password);
          return result.score >= 3;
    }
    )

    const validation =passwordSchema.safeParse(password);

    if(!validation.success)
    {
        throw new ApiError(400,"Password is not provide according to instruction provided!!!")
    }
     
    //check the password is strong enough 
    if(!isPasswordstrong(password))
    {
        const suggestedPassword =  generateStrongPassword();
        return  new AsyncResponse("Password is weak!",405,suggestedPassword)
    }

//check if the user is already exists :via userName and email
 const existingUser = await User.findOne(
    { 
    $or: [{ username }, { email },{fullName}] 
    }
)
if(existingUser)
    {
        new ApiError(409, "User with email or username already exists");
    }

 //check for images ,check for avtar ,image is not related to promote any kind of pornography\


//  console.log(req.files); same as req.body there is req.files which is added because of multer middleware...middleware are nothing but providing extra features or funtionality 


let avatarLocalPath;

if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
{
    avatarLocalPath=req.files.avatar[0].path;
}

if(!avatarLocalPath){
    new ApiError(400, "Avatar file  is required");
}

//  const coverImageLocalPath=req.files?coverImage[0]?.path;
let coverImageLocalPath;
 if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
 {
     coverImageLocalPath=req.files.coverImage[0].path
 }
//before uploading to cloudinary  check the coverPhoto and avtar is not contaning an inappropriate content  by using google vision api 
     //for avtar  and coverImage check
// const [avatar1] = await client.safeSearchDetection(avatarLocalPath);
//     const safeSearchOfAvatar = avatar1.safeSearchAnnotation;

//  const [coverImage1] = await client.safeSearchDetection(coverImageLocalPath);
//      const safeSearchOfCoverImage = coverImage1.safeSearchAnnotation;

//     if (safeSearchOfAvatar.adult>=3  || safeSearchOfAvatar.racy>=3 ||safeSearchOfCoverImage.adult>=3 || safeSearchOfCoverImage.racy>=3)
//     {
//         throw new ApiError(400,"You uploaded an inappropriate avtar or CoverImage ")
//     }
    // else{
        //uploading to cloudinary
        const avatar= await uploadOnCloudinary(avatarLocalPath);
         const coverImage= await uploadOnCloudinary(coverImageLocalPath);
      //  here again we check for avatar, that it is uploaded  by user or not ,after uploading it to the cloudinary,because it is a required and it is a  compulsary field
         if(!avatar){
         new ApiError(400, "Avatar is required");
         }
         console.log(avatar);

//create user object and upload the entry on the database
         const user= await User.create(
            {
                fullName,
                email,
                password,
                avatar: avatar ?.url || (new ApiError(400,"it is a required field")),
                coverImage: coverImage?.url || "",
                username:username.toLowerCase()
            }
         )
//remove the password and refresh token from the response
const createdUser= await User.findById(user._id).select(
    "-password -refreshToken")
    //"select" fuction is used to not allow to show some specific information of user 
       //check for user creation   
    if(!createdUser){
        throw new ApiError(500, "User creation failed")
    }
    //return res
    //send a success message to the user
     return res.status(201).json(
        new ApiResponse(200,createdUser,"User Register Sucessfully")
     )
    }
 )

export {registerUser}