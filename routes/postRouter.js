import express from "express";
import { getPost, getPosts, createPost, updatePost, deletePost } from "../model/getPosts.js";
import { PostController } from "../controller/postController.js";

import { query, validationResult, } from "express-validator";

import passport from "passport";
import { isAuth } from "./authMiddleware.js";
import { isValidPost, isValidPostUpdate, postValidation, idValidation } from "./validMiddleware.js";

const posts = express.Router();
posts.use(express.json());
posts.use(express.urlencoded({ extended: true }));

posts.get("/", PostController.getPostsController);

posts.get("/post/create", isAuth, PostController.getCreatePostController);

posts.post("/post/create", isAuth, postValidation, isValidPost, PostController.createPostController);

posts.get("/post/update/:id", isAuth, PostController.getUpdatePostController);

posts.post("/post/update", isAuth, postValidation, idValidation, isValidPostUpdate, PostController.updatePostController);

posts.post("/post/delete", isAuth, idValidation, isValidPost, PostController.deletePostController);

posts.get("/post/:id", PostController.getPostController);

export default posts;