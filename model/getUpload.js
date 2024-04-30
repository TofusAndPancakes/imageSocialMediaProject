import mysql from 'mysql';
import dotenv from 'dotenv';

import sharp from 'sharp';
import * as fs from 'node:fs/promises';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function uploadImage(image, user) {
    return new Promise((resolve, reject) => {
        let imageData = image;
        let currentUserID = user;

        let imageNewName = Date.now() + "_" + user + "_" + image.name;

        //Set Accepted Filetypes
        const acceptedMimeTypes = [
            "image/gif",
            "image/jpeg",
            "image/png",
            "image/svg+xml",
        ];

        if (acceptedMimeTypes.indexOf(image.mimetype) >= 0) {
            const imageDestinationPath =
                __dirname + "/../asset/uploads/" + imageNewName;

            const resizedImagePath =
                __dirname + "/../asset/uploads/processed/" + imageNewName;

            try {
                image.mv(imageDestinationPath).then(() => {
                    return new Promise((resolve, reject) => {
                        sharp(imageDestinationPath).resize(750).toFile(resizedImagePath).then(() => resolve(imageDestinationPath));
                    });
                });
                resolve(imageNewName);
            } catch (error) {
                reject("Upload Failure");
            } 
        } else {
            reject("Wrong File Type");
        }
    });
}

