import { validationResult } from "express-validator";

export const isAuth = (request, response, next) => {
    if (request.isAuthenticated()){
        next();
    } else {
        //if not...
        response.redirect("/login");
    }
}

export const unAuth = (request, response, next) => {
    if (request.isUnauthenticated()) {
        next();
    } else {
        //if not...
        response.redirect("/login");
    }
}
