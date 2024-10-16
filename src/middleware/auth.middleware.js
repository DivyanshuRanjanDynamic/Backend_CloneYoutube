import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../modals/users.model";

 export const verifyJWT=asyncHandler(async(req, _,next)=>
 {
    try {
    
       const token =req.cookie?.accessToken || req.headers("Authoization").replace("Bearer ","")
   
       if(!token)
       {
           throw new ApiError(401,"Unauthorized")
       }
       const decoded = jwt.verify(token,process.env.ACCESS_TOKEN)  // decode returns "payload " which is the one of the part of JWT (JSON Web Token) .
   
   
   //     A JWT (JSON Web Token) is usually composed of three parts:
   
   // Header: Contains metadata about the token, such as the signing algorithm.
   // Payload: Contains the actual data (claims) encoded into the token, like the user ID, roles, expiration time, etc.
   // Signature: Ensures the integrity of the token and verifies that it hasn't been tampered with.
   
   
       const user =await User.findOne(decoded?._id).select("-password -refresstoken")
       if(!user)
       {
           throw new ApiError(401,"Unauthorized")
       }
       req.user=user
   next()
 } catch (error) {
    throw ApiError(400,"Invalid Access Token ");
 }
 })
