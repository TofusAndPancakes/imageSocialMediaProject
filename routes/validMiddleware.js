import { body, validationResult, } from "express-validator";
import flash from "connect-flash";

//Changes all symbols to html symbols just in-case, a Regex filter is added to the Controller!
export const registrationValidation = [
    [
        body("email").notEmpty().withMessage("Email must not be empty").isEmail().withMessage("Email must be email type").isString().normalizeEmail(),
        body("name").notEmpty().withMessage("Name must not be empty").isString().trim().escape(),
        body("password").notEmpty().withMessage("Password must not be empty")
    ]
];

export const postValidation = [
    [
        body("caption").notEmpty().withMessage("Caption must not be empty").isString().escape(),
    ] 
];

export const idValidation = [
    [
        body("id").isInt(),
    ]
]

export const isValid = (request, response, next) => {
    const validationError = validationResult(request).isEmpty();
    const validationContent = validationResult(request).array();

    if (!validationError) {
        //Error Exists
        for (let i = 0; i < validationContent.length; i++) {
            request.flash("info", validationContent[i].msg);
        }
        
        response.redirect("/register");
    } else {
        next();
    }

}

export const isValidPost = (request, response, next) => {
    const validationError = validationResult(request).isEmpty();
    const validationContent = validationResult(request).array();

    if (!validationError) {
        //Error Exists
        for(let i = 0; i < validationContent.length; i++){
            request.flash("info", validationContent[i].msg);
        }
        
        response.redirect("/post/create");
    } else {
        next();
    }
}

export const isValidPostUpdate = (request, response, next) => {
    const validationError = validationResult(request).isEmpty();
    const validationContent = validationResult(request).array();

    if (!validationError) {
        //Error Exists
        for (let i = 0; i < validationContent.length; i++) {
            request.flash("info", "In the post you are editing, " +validationContent[i].msg);
        }

        response.redirect("/");
    } else {
        next();
    }
}