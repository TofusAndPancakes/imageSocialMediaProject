import express from "express";
import { UserController } from "../controller/userController.js";

import passport from "passport";
import { strategyExport } from "./passportMiddleware.js";

import { query, validationResult, } from "express-validator";

import { isAuth } from "./authMiddleware.js";
import { isValid, registrationValidation} from "./validMiddleware.js";

const users = express.Router();
users.use(express.json());
users.use(express.urlencoded({ extended: true }));

//Temporary Storage
users.get('/login', UserController.getLoginController);

users.post('/login', passport.authenticate(strategyExport, { failureRedirect: '/login', failureMessage: true }), UserController.getLoginVerifyController);

users.get('/register', UserController.getRegisterController);

users.post('/register', registrationValidation, isValid, UserController.createUserController);

users.get('/logout', UserController.getLogOut);

export default users;