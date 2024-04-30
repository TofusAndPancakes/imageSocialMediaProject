import express from "express";
import { getPost, getPostsLatest, getPosts, createPost, updatePost, deletePost, getQueryPostsLatest, getQueryPost, createQueryPost, updateQueryPost, deleteQueryPost } from "../model/getPosts.js";
import { uploadImage } from "../model/getUpload.js";

export const PostController = {
    getPostsController: (request, response) => {
        let posts;
        let currentUserID = null;
        let currentUsername = null;
        if (request.user != null) {
            currentUserID = request.user.account_id;
            currentUsername = request.user.account_name;
        }
        //Session is part of your Request Session!
        getQueryPostsLatest().then(result => {
            posts = result;
            response.render("HomeView.ejs", {
                posts,
                currentUserID: currentUserID,
                currentUsername: currentUsername,
                message: request.flash("info"),
            }
            );
        }).catch((error) => {
            console.log(error);
            response.send("Website is Down");
        });
    },

    getPostController: (request, response) => {
        let currentID = request.params.id;
        let post;

        let currentUserID = null;
        let currentUsername = null;
        if (request.user != null) {
            currentUserID = request.user.account_id;
            currentUsername = request.user.account_name;
        }

        getQueryPost(currentID).then(result => {
            post = result;

            if (post.length == 0){
                response.redirect("/");
            } else {
                response.render("PostView.ejs", {
                    post,
                    currentUserID: currentUserID,
                    currentUsername: currentUsername,
                    message: request.flash("info"),
                });
            }
            
        }).catch((error) => {
            console.log(error);
            response.redirect("/");
        });
    },

    getCreatePostController: (request, response) => {
        let currentUserID = request.user.account_id;
        let currentUsername = request.user.account_name;
        response.render("NewPostView.ejs", {
            currentUserID: currentUserID,
            currentUsername: currentUsername,
            message: request.flash("info"),
        });
    },

    createPostController: (request, response) => {
        let data = request.body;
        let image = request.files.image;
        let user = request.user.account_id;
        //After Data is Stored, redirected to home!

        uploadImage(image, user).then((result)=>{
            return new Promise((resolve, reject) => {
                createQueryPost(data, result, user).then(()=> {
                    resolve();
                }).catch((error)=> {
                    reject(error);
                });
            });
            
        }).then(()=> {
            response.redirect("/");
        }).catch((error) => {
            console.log(error);
            response.redirect("/");
        });
    },

    getUpdatePostController: (request, response) => {
        let currentID = request.params.id;
        let user = request.user.account_id;
        let currentUsername = request.user.account_name;
        let post;

        getQueryPost(currentID).then((result) => {
            post = result;
            //Mini Middleware!
            if (post.length == 0) {
                response.redirect("/");
            } else {
                if (post[0].post_account_id != user) {
                    //If not the same!
                    response.redirect("/");
                } else {
                    response.render("UpdatePostView.ejs", {
                        post,
                        currentUserID: user,
                        currentUsername: currentUsername,
                        message: request.flash("info"),
                    });
                }  
            }
                      
        }).catch((error) => {
            console.log(error);
            response.redirect("/");
        });
    },

    updatePostController: (request, response) => {
        let data = request.body;
        let user = request.user.account_id;
        let image = null;

        if (request.files != undefined){
            image = request.files.image;
        }
        
        let post;
        
        getQueryPost(data.id).then((result) => {
            post = result;  
            //Mini Middleware!
            if (post[0].post_account_id != user) {
                //If not the same!
                response.redirect("/");
            } else {
                return new Promise((resolve, reject) => {
                    //If Image field is null, continue, if it's not null, update!
                    if (image === null){
                        updateQueryPost(data, post[0].post_image).then(() => {
                            response.redirect("/");
                            resolve();
                        }).catch((error) => {
                            console.log(error);
                            reject();
                        });
                    } else {
                        uploadImage(image, user).then((result) => {
                            updateQueryPost(data, result);
                            response.redirect("/");
                            resolve();
                        });
                    }

                });
            }
            }).catch((error) => {
                console.log(error);
                response.redirect("/");
        });
    },

    deletePostController: (request, response) => {
        let currentID = request.body.id;
        let user = request.user.account_id;
        let post;

        getQueryPost(currentID).then((result) => {
            post = result;
            //Mini Middleware!
            if (post.length == 0) {
                response.redirect("/");
            } else {
                if (post[0].post_account_id != user) {
                    //If not the same!
                    //Not Allowed!
                    response.redirect("/");
                } else {
                    return new Promise((resolve, reject) => {
                        deleteQueryPost(currentID).then(() => {
                            resolve();
                            response.redirect("/");
                        }).catch((error) => {
                            console.log(error);
                            reject();
                        });
                    });
                }
            }
            
        }).catch((error) => {
            console.log(error);
            response.redirect("/");
        });
    }
}