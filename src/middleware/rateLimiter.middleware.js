import rateLimit from "express-rate-limit"

export const  ratelimiter=rateLimit(
        {
            windowMs : 15 * 60 * 1000, //15 minutes,
            max:(admin)=>  // limit admin  IP to 500 requests per windowMs and  for users IP to 100 requests per windowMs. 
            {
                if(admin){
                    return 500
                }
                return 100
            },
            message:"Too many request!! .Please try again Later" //optional custom message 
        })
