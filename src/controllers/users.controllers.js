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
import {transporter} from "../utils/mailer.util.js";



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
try {
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
                    username:username.toLowerCase(),
                    verificationToken
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
    
        await createdUser.save({validationBeforeSave:false})
    
        //send verification email
        const verificationLink =`http://localhost:${process.env.PORT}/api/v1/users/verify/${verificationToken}`;
    
        await transporter.sendMail(
            {
                from:process.env.MY_EMAIL,
                to:user.email,
                subject: "Verify your email",
                text: `Please verify your email by clicking on this link ${verificationLink}`
            })
        //return res
        //send a success message to the user
         return res.status(201).json(
            new ApiResponse(200,createdUser,"User Register Sucessfully. Please check your email to verify your account.")
         )
} catch (error) {
    //if there is an error in the code, we will return the error message to the user
    return res.status(500).json(new ApiError(500,"Something Went wrong in the internal Server "))
}
    }
 )

 //Email verification
 const verifyEmailToken=asyncHandler(async(req,res)=>
{
    try {
        const user=await User.findById({verificationToken:req.params.token}).some("-password -refreshToken  -verificationToken")  //here i use params because we use the verificationToken in the router itself
        if(!user)
        {
            throw new ApiError(400,"Invalid Token")
        }
        //update the user schema 
        user.isVerified=true;
        user.verificationToken=null;
        await user.save({validationBeforeSave:false})
        return res.status(200).json(201,"'Email verified successfully",user)
    } 
    catch (error) {
        return res.status(500).json(new ApiError(500,"Something Went wrong in verifying the email"))
    }
})

//forget password 
const forgetPassword=asyncHandler(async(req,res)=>
{
 try {
         const {email}=req.body
         const user=await User.findOne({email}).select("-password -refreshToken  -verificationToken")
         if(!user)
         {
           throw new ApiError(400,"Invalid Email")
         }
         //geterate the token using generateAccessTokenAndRefreshToken 
         const {accessToken,refreshToken}=generateAccessAndRefressToken(user._id)
         //update the user schema
         user.refreshToken=refreshToken
         await user.save({validationBeforeSave:false})
   
         //send the email to the user
         const resetLink=`http:/localhost:${process.env.PORT}/api/v1/users/resetPassword`;
         await transporter.sendMail(
           {
               from:process.env.MY_EMAIL,
               to:email,
               subject:"Reset your password",
               text:`Please click  on this link to reset your password,Link is -> ${ resetLink}`
           }
         )
         const option={
            httpOnly:true
            ,secure:true
         }
         return res.status(200).cookie("refreshToken",refreshToken,option).json( new ApiResponse(200,"Pssword Reset Email Sent Sucessfully",{refreshToken}))
 }
  catch (error) {
    return res.status(500).json(new ApiError(500,"Something Went wrong in sending the email"))
    
 }

})
//reset password or change password

const resetPassword=asyncHandler(async(req,res)=>
    {
    try {
        const {previousPassword,newPassword,confirmPassword}=req.body
        if(!previousPassword)
        {
            throw new ApiError(400,"Please fill all fields")
        }
          const user =await User.findById(req.user._id).some("-password - refreshToken")
          const isPasswordCorrect=user.comparePassword(previousPassword)
          if(!isPasswordCorrect)
          {
            throw new ApiError(400,"Unauthorized user")
          }
          if(!newPassword||!confirmPassword)
          {
            throw new ApiError(400,"Please fill both fields ")
          }
          if(newPassword!==confirmPassword)
          {
            throw new ApiError(400,"Passwords do not match")
          }
        //update in database 
        user.password=newPassword
         await user.save({validationBeforeSave:false})
        
        res.status(200).json(
            new ApiResponse(200,"Password Updated Successfully",user)
        )
    } catch (error) {
        throw new ApiError(500,error.message)
    }
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
     return res.status(200).cookie("accessToken","",option).cookie("refreshToken","",option).json(new ApiResponse(200, {}, "User logged Out"))
    
     

})
//refresh  access token  so that by using refress token only  we will login and perform different actions 

const refreshAccessToken=asyncHandler(async(req,res)=>
{  
         //get the  password as token from user
   
     const getrefressTokenByuser=req.cookies.refreshToken || req.body.refreshToken
 
     if (!getrefressTokenByuser) {
         throw new ApiError(401, "unauthorized request")
     }
 
        //decode that refresh token and extact payload from it 
 
        const decode=jwt.verify(getrefressTokenByuser,process.env.REFRESS_TOKEN)
 
       //using that payload find the user from the database
         const user=await User.findById(decode?._id)
         if(!user){
           throw  new ApiError(401,"Invalid Refress Token")
         }
 
         const {accessToken,refreshToken}=await generateAccessAndRefressToken(user._id)
 
            if(user?.refreshToken !== getrefressTokenByuser){
            throw  new ApiError(401,"Invalid Refresh Token")
            }
       const option={
         httpOnly:true,
         secure:true
      }
 
      return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
             new ApiResponse(200,"Your AccessToken refressed Now!!",{
                 accessToken:accessToken,
                 refreshToken:refreshToken
             })
      )
   } 
)


// getCurrentUser

const  getCurrentUser=asyncHandler(async(req,res)=>
{
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized request")
    }
    return res.status(200).json(new ApiResponse(200, "User found Sucessfully", user))

})

//update the avtar file

const updateUserAvatar=asyncHandler(async(req,res)=>
{
    const userNewAvtar=req.file?.path
   if(!userNewAvtar){
    throw new ApiError(400,"Please upload a Valid image")
     }

    // upload the new avatar on cloudinary
    const newAvatar=uploadOnCloudinary(userNewAvtar)
 if(!newAvatar.url)
 {
    throw new ApiError(500,"Failed to upload the image")
 }
     const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avtar:userNewAvtar.url
            }
        },
        {
            new:true
        }
     ).select("-password")
     if(!user)
     {
        throw new ApiError(404,"User Not Found")
     }
     
     return res.status(200).json(
        new ApiResponse(200,"User Avtar Updated Successfully",user)
     )
})


//update the covarImage file 

    
    const updateUserCoverImage=asyncHandler(async(req,res)=>
    {
        const userNewCoverImage=req.file?.path
       if(!userNewCoverImage){
        throw new ApiError(400,"Please upload a Valid CoverImage")
         }
    
        // upload the new avatar on cloudinary
        const newCoverImage=uploadOnCloudinary(userNewCoverImage)
     if(!newCoverImage.url)
     {
        throw new ApiError(500,"Failed to upload the cover image")
     }
         const user=await User.findByIdAndUpdate(req.user._id,
            {
                $set:{
                   coverImage:newCoverImage.url
                }
            },
            {
                new:true
            }
         ).select("-password")
         if(!user)
         {
            throw new ApiError(404,"User Not Found")
         }
         
         return res.status(200).json(
            new ApiResponse(200,"User Cover Image  Updated Successfully",user)
         )
    })

//update user profile
 const updateProfile=asyncHandler(async(req,res)=>
    {
        const {newUsername,newFullName}=req.body
        if(!(newUsername||newFullName))
        {
            throw new ApiError(400,"Update the field")
        }
        const user=await User.findById(req.user._id).select("-password - refreshToken")
        if(!user)
        {
            throw new ApiError(400,"User not found ")
        }
         user.username=newUsername
         user.fullName=newFullName
         user.save({validationBeforeSave:false})
    
         return res.status(200).json(new ApiResponse(201,user,"Your profile Updatrd  sucessfully !!"))
    })

//delete user account

const deleteAccount=asyncHandler(async(req,res)=>
{
   try {
     const {password}=req.body
     if(!password)
     {
         throw new ApiError(400,"Please enter your password")
     }
     const user=await User.findById(req.user._id)
     if(!user)
     {
         throw new ApiError(400,"Unothorized User")
     }
     const isMatch=user.comparePassword(password)
     if(!isMatch)
     {
         throw new ApiError(400,"Please enter a valid password")
     }
     await User.findByIdAndDelete(req.user._id);
     
     return res.status(200).json(new ApiResponse(200,"Account deleted successfully"))
   } 
   catch (error) {
    throw new ApiError(500,error.message)
   }
})



//
//dns part :required valid registered domain  name 
//google vision :biling process required on google vision 

export {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,resetPassword,
    updateProfile,deleteAccount,verifyEmailToken,forgetPassword
}






//forgot password
//auth through google and github 
//learn 2fA
//send email to user for verification
//claude part
// Email sending 