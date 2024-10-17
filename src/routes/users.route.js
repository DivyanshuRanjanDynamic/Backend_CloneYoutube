import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAccessToken } from "../controllers/users.controllers.js"
import { upload } from "../middleware/multer.middleware.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router= Router()


//register
router.route("/register").post(upload.fields([
    {
       name:"avatar",
       maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)
 

//login
router.route("/login").post(loginUser)
//logout 
router.route("/logout").post(verifyJWT,logoutUser)
//refressing the access token by using the refresh token so that user dont have to login  again and  again due to like some post or upload something 
router.route("/refreshAccessToken").post(refreshAccessToken)

// upload.field is a middleware
//upload.field is used to upload images ,files etc to local server using multer


// router.route("/login").get()

export default router
