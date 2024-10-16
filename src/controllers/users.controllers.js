import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import validator from "validator" // it is used to validate that our email is of correct formate along with the domain name
 import dns from "dns" // Verify the Email Domain Using DNS Lookup
import {z} from "zod";//for the schemas of password ,email,etc...
import zxcvbn from "zxcvbn";// provide the score between 0 to 4 to the passwords according to its strengh .if score is =>3 ,it is cosider as strong password 
import crypto from "crypto";//this is for sggesting and generating  a strong password 
 import { User } from "../modals/users.model.js";
import { ImageAnnotatorClient } from '@google-cloud/vision';//Import the Google Cloud Vision client library
 import  {uploadOnCloudinary} from "../utils/cloudinary.js"
import bcrypt from "bcrypt";


 const client = new ImageAnnotatorClient({
    keyFilename:process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

   //generate the Access and refresh  token 
   const generateAccessAndRefressToken=async(userId)=>
{
    try {
        const user= await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
    
        //save the refresh token  on the database
        user.refreshToken=refreshToken
        await user.save()
    
        return { accessToken,refreshToken}
    } catch (error) {
        throw new ApiError("Something went wrong while generating refress and Access Token ", 500)
    }
} 


const registerUser= asyncHandler(  async ( req, res )=>
{
 // get user details from frontend 
 const {username,fullName,email,password}=req.body 

 //validate the users information -like empty check
  if([username,fullName,email,password].some((field)=> field ?.trim() === ""))
  {
    throw new ApiError(400,"All fields are required")
  }
// //validate the users information - like email is on the correct formate  and verify the email domain using DNS lookup
//    // Validate email format
 if (!validator.isEmail(email)) {
    throw new ApiError(200, "Format of your email is incorrect");
}

//  async function validateEmail(email) {
//     // Validate email format
//      if (!validator.isEmail(email)) {
//          throw new ApiError(200, "Format of your email is incorrect");
//  }

//      // Extract domain from email
//      const domain = email.split("@")[1];

//      try {
//         //  Use await to resolve the MX records
//          const addresses =  dns.resolveMx(domain);

//        //   Check if addresses are found
//          if (addresses.length === 0) {
//              throw new ApiError(400, "Domain not found");
//          }
//      } catch (err) {
//          throw new ApiError(400, "Domain name is invalid");
//      }
//  }
 
//  if(!(await validateEmail(email)))
//  {
//    throw new ApiError(400,"Wrong Email")
//  }
//  else{
//     //email and its domain name is good .
//     return new ApiResponse(200,"Email is valid",email)
//  }

//to ensure that the password given by user is strong or not ,if not then  suggest them/him a strong password 


     //Function to generate a cryptographically secure strong password
const generateStrongPassword= ( (length = 10)=>
{
    const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const randomBytes= Array.from(crypto.randomBytes(length)); //randomBytes in Node.js returns a Buffer, which is a type of array-like object that contains raw binary data. A Buffer contains binary data, and each element is a byte (0-255).we can easily convert the buffer to a regular array if needed for processing by using  this Array.from(randomBytes); where randomBytes returns " Buffer"
 //randomBytes in Node.js returns a Buffer, which is a type of array-like object that contains raw binary data. A Buffer contains binary data, and each element is a byte (0-255).we can easily convert the buffer to a regular array if needed for processing by using  this Array.from(randomBytes); where randomBytes returns " Buffer"
  //randomBytes in Node.js returns a Buffer, which is a type of array-like object that contains raw binary data. A Buffer contains binary data, and each element is a byte (0-255).we can easily convert the buffer to a regular array if needed for processing by using  this Array.from(randomBytes); where randomBytes returns " Buffer"
    const passwordArray=[];

    //map each byte to a character from the "chars" string 
    for(let i=0;i<length;i++)
    {
        const randomIndex=randomBytes[i] % chars.length;
        passwordArray.push(chars[randomIndex])
    }
    return passwordArray.join(''); //return the password as a string 
})

     // zod schema for strong password 
    // const passwordSchema=z.string()
    // .min(6,"Passsword must be atleast 6 Character long")
    // .regex(/[A-Z]/,"Passsword must have  atleast one upperCase Letter")
    // .regex(/[a-z]/,"Passsword must have atleast one lowerCase Letter")
    // .regex(/[@!#$%^&*(),.?":{}|<>~]/,'Passsword must have atleast one symbol')
    // .regex(/[0-9]/,'Passsword must have atleast one number')

     //check password strength using zxcvbn
 const isPasswordstrong=(async (password) =>
    {
          const result= zxcvbn(password);
          return result.score >= 3;
    }
    )

    // const validation = passwordSchema.safeParse(password);

    // if (!validation.success) {
    //     throw new ApiError(400,"Password is not provided according to instruction!!!");
    //     // res.status(400).json("Password is not provided according to instruction!!!");
    //   } 

    //check the password is strong enough 
    const checkPasswordStrength= await isPasswordstrong(password) ;

    if(!checkPasswordStrength)
    {
        const suggestedPassword =  generateStrongPassword();
        return res.status(400).json(new ApiResponse(400, "Password is weak!",suggestedPassword.toString()));
        }


//check if the user is already exists :via userName and email
 const existingUser = await User.findOne(
    { 
    $or: [{ username }, { email }] 
    }
)
if (existingUser) {
    throw new ApiError(409, "User already exist");
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
//      //for avtar  and coverImage check
//  const [avatar1] = await client.safeSearchDetection(avatarLocalPath);
//      const safeSearchOfAvatar = avatar1.safeSearchAnnotation;

//   const [coverImage1] = await client.safeSearchDetection(coverImageLocalPath);
//       const safeSearchOfCoverImage = coverImage1.safeSearchAnnotation;

//      if (safeSearchOfAvatar.adult>=3  || safeSearchOfAvatar.racy>=3 ||safeSearchOfCoverImage.adult>=3 || safeSearchOfCoverImage.racy>=3)
//      {
//          throw new ApiError(400,"You uploaded an inappropriate avtar or CoverImage ")
//      }
        //uploading to cloudinary
        const avatar= await uploadOnCloudinary(avatarLocalPath);
         const coverImage= await uploadOnCloudinary(coverImageLocalPath);
      //  here again we check for avatar, that it is uploaded  by user or not ,after uploading it to the cloudinary,because it is a required and it is a  compulsary field
         if(!avatar){
          throw new ApiError(400, "Avatar is required");
         }

//create user object and upload the entry on the database
         const user= await User.create(
            {
                fullName,
                email,
                password: password ,
                avatar: avatar.url,
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

//login

const loginUser = asyncHandler(async(req,res)=>
{
    //get the information of user -> username or email and password 
    const {username, email, password} = req.body;
//check on the database
    if(!(username || email)){
        throw new ApiError(400, "Please enter either username or email")
    }
 //check in  the database that a user present in the database or not with username or email
const user =await User.findOne({
    $or: [{username}, {email}],//$or is one of the keyword provided by the mongoDb
})
if(!user){
    throw new ApiError(401, "Invalid username or email")
}
 //password check

const isPasswordValid= await user.comparePassword(password)
if(!isPasswordValid){
    throw new ApiError(401, "Invalid password")
}

 //generate the Access and refresh  token 
const {refreshToken,accessToken}= await generateAccessAndRefressToken(user._id);

const userLoggedIn=await User.findById(user._id).select("-password -refreshToken");
    //send cookies===== Remember always send refressToken and access token via cookies that are provided by cookieParser

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken",accessToken,option).cookie("refressToken",refreshToken,option).json(
        new ApiResponse(
            200,
          {
            userLoggedIn,
            accessToken,
            refreshToken
          }  ,
            "User Login Sucessfully")
    )

})






export {
    registerUser,
    loginUser,
    logoutUser,
}


//logout

const logoutUser=asyncHandler(async (req,res)=>
{
   //here the most important problem is that we donot have the access of user who was logged in and we will solve that problem by adding middleware in the loggedout route 
     await User.findByIdAndUpdate(req.user._id,
        {
           $unset:
           {
            refreshToken:1  //this will the token from the field 
           }
        },
        {
           new:true
        }
     )

     const option={
        httpOnly:true,
        secure:true
     }
     return res.status(200).cookie("accessToken","",option).cookie("refreshToken","",option).json
     {
    200,
    "you loggedOut Sucessfully",
    {}
     }

})

//dns part :required valid registered domain  name 
//google vision :biling process required on google vision 







//refresh  access token  so that by using refress token only  we will login and perform different actions 
//forgot password
//reset password
//update user profile
//update user password
//delete user account

