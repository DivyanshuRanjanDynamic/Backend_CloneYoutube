 import passport from "passport"
  import { User } from "../modals/users.model.js";
  import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
  
  const router=Router();
  //serialization:the process of saving the users information into the session {typically stored the user ID} ,by converting user object into single value (typically the user ID) .
//deserialization:the process of retrieving the user information from the session and converting it back into a user object
//session: a temporary storage area that allows the server to store information about a user between a request
 



passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

// OAuth strategy configuration for Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {                   // profile:-This object contains the user "profile" information returned by the OAuth provider (e.g., Google or Facebook). It typically includes details like name, email, and profile picture.
                                                                           // done :-This is a callback function provided by "Passport" to indicate when the authentication process is complete.
  try {
    let user = await User.findOne({ oauthId: profile.id });
    if (!user) {
      user = new User({
        oauthId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        isVerified: true
      });
      await user.save({verificationBeforeSave:false});
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

//OAuth strategy configuration for GitHub
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ oauthId: profile.id });
      if (!user) {
        user = new User({
          oauthId: profile.id,
          username: profile.username,
          email: profile.emails[0].value,
          isVerified: true
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  export {router}