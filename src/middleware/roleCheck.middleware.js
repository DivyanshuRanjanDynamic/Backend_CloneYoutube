 import {ApiError} from "../utils/apiError.js";
 
 const rolecheck=(role)=>(req,res,next)=>
{
    if(!req.user)
    {
        //if the user not authenticated
        throw new ApiError(400,"Unothorized user")
    }
    
    if(req.user.role != role )
    {
        //if the user role do not matches the required role
        throw new ApiError(400,"Unothorized user")
    }
    
    //if the role matches proceed to next next middleware or route
    next()
}

export {rolecheck}