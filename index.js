import express from 'express';
import ejs from 'ejs';
import path from 'node:path';

import fileUpload from 'express-fileupload';
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";

import flash from "connect-flash";

import posts from "./routes/postRouter.js"
import users from "./routes/userRouter.js"
import { getPosts } from "./model/getPosts.js";

import dotenv from 'dotenv';

dotenv.config();

import expressMySqlSession from "express-mysql-session";

const app = express();

app.set("view engine", "ejs"); 

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//FileUpload
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

const options = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,                     
};

const MySQLStore = expressMySqlSession(session);
const sessionStore = new MySQLStore(options);

app.use(
    session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use(flash());

//Passport
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

app.use(posts);
app.use(users);

app.use("/", express.static('asset'));

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

