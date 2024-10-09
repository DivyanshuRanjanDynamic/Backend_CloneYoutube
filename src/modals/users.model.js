import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new mongoose.Schema(
    {
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        username:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        avtar:
        {
            type:String,
            required:true,
        },
        coverImage:
        {
            type:String,
            required:true,
        },
        password:
        {
            type:String,
            required:true,
        },
        refreshToken:
        {
            type:String,
            required:true,
        }
    },
    {timestamps:true}
)
  
// before saving the user data hash the password using bcript .use "pre" keyword to make changes on user ingormation before saving it on the databases.
userSchema.pre('save', async function(next){
    if(!this.isModified("password") ) return next()
    this.password=await bcrypt.hash(this.password,10)
    next()
})
//now we will sucessfully able to hash the password whenver we make update on it 
//compare the hased password with real password 
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
    }



    //generate AccessToken 
userSchema.methods.generateAccessToken(function()
{
    const token=jwt.sign({
                           id:this._id,
                           email:this.email,
                           username:this.username
                         },
                         process.env.ACCESS_TOKEN,
                         {
                            expiredIn:ACCESS_TOKEN_EXPIRED
                         })

   return token ;
})

    //generate RefressToken 

    userSchema.methods.generateRefressToken(function()
    {
        const token=jwt.sign({
                               id:this._id,
                             },
                             process.env.REFRESS_TOKEN,
                             {
                                expiredIn:REFRESS_TOKEN_EXPIRED
                             })
    
       return token ;
    })

export const USER=mongoose.model("USER",userSchema)