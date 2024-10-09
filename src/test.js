import dotenv from "dotenv";
import dBconnect from "./db/index.js";

  dotenv.config(
    {
        path:"./.env"
    }
  )
  
  
  
dBconnect()  // dB connection is asyncronous function  that returns a promises .so, after creating app.js file and intilizing app variable write the below logic 
  .then(()=>
{
   app.listen(process.env.PORT||8000,()=>
{
    console.log(`Server is running on PORT:${process.env.PORT}`)
})
 app.on("error",(error)=>
{
    console.error("Error occurred while running server",error)
})

})
.catch((error)=>
{
    console.log(error);
})

  
  
  
  /*import mongoose from "mongoose";                In  test.js file mix both express and mongoose code 
  import { DB_NAME} from  "../constants.js"
import express from "express";
const app =express();
// IIFE is used here , there is common practice to initialize the IIFE and make sure that it will work fine by starting IIFE with ;(semi-colon)
;(async ()=>
{
    try{
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
        app.on("errror",(error)=>
        {
                console.log("ERROR",error);
                throw error
        })
        app.listen(process.env.PORT,()=>
        {
            console.log("App listen on Port:",process.env.PORT)
        })
    }

    catch(error){
        console.log("Do not able to Connect to Databases",error);
        throw error
    }
})()
    */
