import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";

import { getUserByID, getUserByEmail } from "../model/getUsers.js"

const customFields = {
    usernameField: "email",
    passwordField: "password"
}

const authenticateUser = (username, password, done) => {
    //Make a Post Request and return a Json
    getUserByEmail(username).then((result) => {
        let user = result[0];
        if (user == null) {
            return done(null, false, { message: "No email matched" });
        }

        try {
            if (bcrypt.compare(password, user.account_password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: "Password incorrect" })
            }
        } catch (error) {
            return done(error);
        }
        
    }).catch((error) => {
        return done(error);
    });

    
}

export const strategyExport = new LocalStrategy(customFields, authenticateUser);

passport.use(strategyExport);

passport.serializeUser((user, done) => done(null, user.account_id));

passport.deserializeUser((user, done) => {
    getUserByID(user).then((result) => {
        let user = result[0];
        done(null, user);
    }).catch((error) => done(error));
});
