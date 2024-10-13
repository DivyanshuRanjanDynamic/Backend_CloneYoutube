import {Router} from "express"
import { registerUser } from "../controllers/users.controllers.js"
import { upload } from "../middleware/multer.middleware.js"

const router= Router()

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


// upload.field is a middleware
//upload.field is used to upload images ,files etc to local server using multer


// router.route("/login").get()

export default router
