import mongoose from "mongoose";
import bcrypt from "bcrypt";
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
            index:true
        },
        avatar:
        {
            type:String,
            required:true,
        },
        coverImage:
        {
            type:String,
           
        },
        password:
        {
            type:String,
            required:[true,'Password is required'],
        },
         refreshToken
       :
        {
            type:String,
        },
        verificationToken:{
           type:String 
        },
        isVerified:
        {
            type:Boolean,
            default:false
        },
        twoFactorSecret:
        {
            type:String
        },
        istwoFactorEnabled:
        {
            type:Boolean,
            default :false
        },
        role:
         {
             type: String,
             enum: ['user', 'admin'],
              default: 'user'
       },
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
    userSchema.methods.generateAccessToken = function(){
        const token = jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
        return token
    }
    //generate RefressToken 
    userSchema.methods.generateRefreshToken = function(){
        const token = jwt.sign(
            {
                _id: this._id,
                
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
        return token
    }
    
   
export const User=mongoose.model("User",userSchema)