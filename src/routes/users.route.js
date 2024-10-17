import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAccessToken,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage } from "../controllers/users.controllers.js"
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
//get current user
router.route("/").get(verifyJWT,getCurrentUser)
//update user avatar
router.route("/updateUserAvatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
//update user cover Image
router.route("/updateUserCoverImage").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)


// upload.field is a middleware
//upload.field is used to upload images ,files etc to local server using multer


// router.route("/login").get()

export default router
