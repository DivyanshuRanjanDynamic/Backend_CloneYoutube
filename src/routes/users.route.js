import {Router} from "express"
import { registerUser } from "../controllers/users.controllers.js"
import { upload }from "../middleware/multer.middleware.js"

const router= Router()

router.route("/register").post(registerUser)


export default router
