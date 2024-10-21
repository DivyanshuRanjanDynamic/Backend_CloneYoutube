import speakeasy from "speakeasy"
import {ApiError} from "../utils/apiError.js"
import {User} from "../modals/users.model.js";
import {asyncHandler}  from "../utils/asyncHandler.js"
import session from "express-session";

 // Middleware to ensure the user has completed 2FA
//verify 
  const verify2FA=asyncHandler(
    async(req,_,next)=>
    {
         const token =req.cookies?.accessToken  || req.headers("Authorization").replace("Bearer ","")
         const secret =req.session.twoFactorSecret;// Retrieve the secret from the session
         if(!token)
         {
            throw new ApiError(400,"Access token is missing")
         }
         const user =await User.findOne({accessToken:token})
            
         if(!user || !user.twoFactorSecret)
            {
                throw new ApiError(400,"UnothorizedToken or 2FAsecret not Set ")
            }

            //verify 
         if(user.istwoFactorEnabled)
         {
            const verified=speakeasy.topt.verify(
                {
                    secret:secret,
                    encoding:"base32",
                    token:token,
                }
            );
            if(!verified)
            {
                throw new ApiError(401,"Invalid 2FA token")
            }

            
    // Mark the session as fully authenticated
    req.session.isFullyAuthenticated = true;
         }


         next();
    })

export { verify2FA}
    