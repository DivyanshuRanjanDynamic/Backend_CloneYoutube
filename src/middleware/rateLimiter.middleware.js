import rateLimit from "express-rate-limit"

export const  ratelimiter=rateLimit(
        {
            windowMs : 15 * 60 * 1000, //15 minutes,
            max:(admin)=>
            {
                if(admin){
                    return 500
                }
                return 100
            },
            message:"Too many request!! .Please try again Later" //optional custom message 
        })