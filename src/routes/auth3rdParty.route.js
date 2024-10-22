import {Router} from "express"
import passport from "passport";


const router=Router();


router.use(passport.initialize());
router.use(passport.session());


//goole authentication route 
router.route("/google").get(passport.authenticate("google",{ scope: ['profile', 'email']}));
//google callback route
router.route("/google/callback").get(passport.authenticate("google",{ failureRedirect: "/login" }));
//github authentication route
router.route("/github").get(passport.authenticate("github",{ scope: ['profile', 'email']}));
//github callback route
router.route("/github/callback").get(passport.authenticate("github",{ failureRedirect: "/login" }));


export default router