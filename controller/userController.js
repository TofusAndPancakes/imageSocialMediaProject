import express from "express";
import { getUserByEmail, createUser, getQueryUserByEmail, createQueryUser } from "../model/getUsers.js";
import passport from "passport";

export const UserController = {
    getLoginController: (request, response) => {
        let currentUserID = null;
        let currentUsername = null;
        if (request.user != null){
            currentUserID = request.user.account_id;
            currentUsername = request.user.account_name;
        }
        response.render("LoginView.ejs", {
            currentUserID: currentUserID,
            currentUsername: currentUsername,
            message: request.flash("info"),
        });
    },

    getLoginVerifyController: async (request, response) => {
        response.redirect("/");
    },

    getRegisterController: (request, response) => {
        let currentUserID = null;
        let currentUsername = null;
        if (request.user != null) {
            currentUserID = request.user.account_id;
            currentUsername = request.user.account_name;
        }
        response.render("RegisterView.ejs", {
            currentUserID: currentUserID,
            currentUsername: currentUsername,
            message: request.flash("info"),
        });
    },

    createUserController: (request, response) => {
        let user = request.body;
        let checkContainer;
        //Check for Existing 
        getQueryUserByEmail(user.email).then((result) => {
            checkContainer = result;
            if (checkContainer.length == 0){
            return new Promise((resolve, reject) => {
                createQueryUser(user).then(() => {
                    response.redirect("/login");
                    resolve();
                }).catch(() => {
                    console.log("Failed");
                    response.redirect("/register");
                    reject();
                });
            });
            } else {
                response.redirect("/register");
            } 
        });
    },

    getLogOut: (request, response) => {
        request.logout(function (err) {
            if (err) {
                return next(err);
            }
            response.redirect("/login");
        });
    }
};
