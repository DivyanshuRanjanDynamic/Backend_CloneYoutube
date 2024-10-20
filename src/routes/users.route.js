import {Router} from "express"
import { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
          getCurrentUser,
         updateUserAvatar,
        updateUserCoverImage,
         resetPassword ,
         updateProfile,
       deleteAccount,verifyEmailToken,forgetPassword
    } from "../controllers/users.controllers.js"
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
//for  changing or resetting password
router.route("/resetPassword").patch(verifyJWT,resetPassword)
//updateProfile
router.route("/updateProfile").patch(verifyJWT,updateUserCoverImage,updateUserAvatar, updateProfile)
//delete account
router.route("/deleteAccount").delete(verifyJWT,deleteAccount)
//Email verification
router.route("/verify/:token").get(verifyJWT,verifyEmailToken)
//Forget password
router.route("/forgetPassword").post(forgetPassword)



// upload.field is a middleware
//upload.field is used to upload images ,files etc to local server using multer


// router.route("/login").get()

export default router
