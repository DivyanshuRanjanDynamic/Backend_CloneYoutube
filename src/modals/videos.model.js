import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const videosSchemas= new mongoose.Schema(
    {
        videoFile:
        {
            type:String,
            required:true
        },
        thumbnail :
        {
            type:String,
            required:true
        },
        owner:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"USER"
        },
        title:
        {
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        description:
        {
            type:String,
            required:true,
            trim:true,
        },
        duration:
        {
            type:Number,
            required:true,
        },
        views:
        {
            type:Number,
            default:0
        },
        isPublished:
        {
            type:Boolean,
        }
    },
    {timestamps:true }
)
videosSchemas.plugin(aggregatePaginate)

export const Video=mongoose.model("Video",videosSchemas)