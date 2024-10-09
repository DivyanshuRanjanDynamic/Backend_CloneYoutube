import express from "express";
const app =express();
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(cors({
    origin : "* ", //for the production level this is not a good practice 
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE"],
    headers : ["Aothorization"]
}))
//some middlewares that is needed to setup production level code 

//Ensures that the server can handle JSON payloads properly and also prevents excessively large bodies from being processed, which could be used in a denial-of-service (DoS) attack.
app.use(express.json({limit : "10mb"}))
//It helps parse incoming form data  forms into a usable JavaScript object.
app.use( express.urlencoded({extended:true,limit:"16kb"}))
//When a request is made for a static file (like /css/styles.css), Express will look inside the public folder for the file (e.g., public/css/styles.css) and serve it if it exists even connection is lost from the client side .
app.use(express.static("public"));
// the cookieParser() middleware allows the server to read cookies from the client side (by parsing them) so that we can access and use them in our server-side logic. 
app.use(cookieParser())



export {app}