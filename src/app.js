import express from "express";
const app =express();
import cors from "cors";
import cookieParser from "cookie-parser";
import ratelimit from "express-rate-limit"
import helmet from "helmet"
import compression from "compression";
import session from "express-session"
import  passport from "passport";



app.use(cors({
    origin : "* ", //for the production level this is not a good practice 
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE"],
    headers : [" Content-Type","Authorization"]
}))
//some middlewares that is needed to setup production level code 

//Ensures that the server can handle JSON payloads properly and also prevents excessively large bodies from being processed, which could be used in a denial-of-service (DoS) attack.
app.use(express.json({limit : "10kb"}))
//It helps parse incoming form data  forms into a usable JavaScript object.
app.use( express.urlencoded({extended:true,limit:"16kb"}))
//When a request is made for a static file (like /css/styles.css), Express will look inside the public folder for the file (e.g., public/css/styles.css) and serve it if it exists even connection is lost from the client side .
app.use(express.static("public"));
// the cookieParser() middleware allows the server to read cookies from the client side (by parsing them) so that we can access and use them in our server-side logic. 
app.use(cookieParser())
//helmet 
app.use(helmet());
//compression 
app.use(compression());
//rateLimit 
app.use(ratelimit)

//Setup Session 
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave: false,//saved the session even if it was unmodified 
        saveUninitialized:false ,//for the session that is unintialized to be saved 
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        }

   }
))

app.use(passport.initialize());
app.use(passport.session());


// importing all routers

import userRouter from "./routes/users.route.js"

app.use("/api/v1/users",limiter, userRouter)  //middleware is use to connect the routers
app.use("/api/v1/auth",limiter,authRouter)  //middleware is use to connect the routers




export {app}
