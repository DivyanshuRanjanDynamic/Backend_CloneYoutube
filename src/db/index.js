import mongoose from "mongoose";
import {DBNAME} from "../constants.js";

const dBconnect=async()=>
{
    try{
        const connectInstance= await mongoose.connect(`${process.env.DB_URI}/${DBNAME}`)
        console.log(`Connected to MongoDB !! DB HOST:${connectInstance.connection.host}}`);
    }
    catch(error){
        console.log(`Error connecting to MongoDB${error}`);
        // throw error OR
        process.exit(1);
    }
}

export default dBconnect