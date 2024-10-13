import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import validator from "validator" // it is used to validate that our email is of correct formate along with the domain name
import dns from "dns" // Verify the Email Domain Using DNS Lookup
import {z} from "zod";//for the schemas of password ,email,etc...
import zxcvbn from "zxcvbn";// provide the score between 0 to 4 to the passwords according to its strengh .if score is =>3 ,it is cosider as strong password 
import crypto from "crypto";//this is for sggesting and generating  a strong password 
 import { AsyncResponse } from "../utils/asyncResponse.js";
 import { User } from "../modals/users.model.js";
 


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
if(!validator.isEmail(req.body.email))
{
       throw new ApiError(200,"Formate of your email is incorrect")
}

 await dns.resolveMx(req.body.email.split("@")[1],  (err,address)=>
{
    if(err || address.length ===  0)
    {
         throw new ApiError(402,"Domain name is invalid") 
    }
})
//to ensure that the password given by user is strong or suggest them a strong password 


     //Function to generate a cryptographically secure strong password
const generateStrongPassword=(length=10)=>
{
    const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const randomBytes=crypto.randomBytes(length)  //randomBytes in Node.js returns a Buffer, which is a type of array-like object that contains raw binary data. A Buffer contains binary data, and each element is a byte (0-255).we can easily convert the buffer to a regular array if needed for processing by  this Array.from(randomBytes); where randomBytes returns " Buffer"
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
          const result= await zxcvbn(password);
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
        const suggestedPassword = generateStrongPassword();
        return  new AsyncResponse("Password is weak!",405,suggestedPassword)
        
    }

//check if the user is already exists :via userName and email
 const existingUser = await User.findOne({ $or: [{ userName }, { email }] });

if(existingUser)
    {
        throw new ApiError(409, "User with email or username already exists");
    }

 //check for images ,check for avtar ,image is not related to promote any kind of pornography



  

   
    //upload them on cloudinary 
    //create user object and upload the entry on the database
    //remove the password and refresh token from the response 
    //check for user creation 
    //return res
    //send a success message to the user
})

export {registerUser}