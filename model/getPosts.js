import mysql from 'mysql';
import dotenv from 'dotenv';
import passport from "passport";
import QueryBuilder from "node-queryBuilder";

dotenv.config();

const DBCONFIG = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
};

//Credit: https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly
//This is a temporary solution, is best to use PDOs later!
function mysql_real_escape_string(str) {
    if (typeof str != 'string')
        return str;

    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    });
}

export async function getQueryPosts() {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        const response = await qb.select('*')
            .get('post');

        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function getPosts(){
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        var postData;

        let errorStatus = 0;
        let errorStorage;

        connection.query('SELECT * FROM `post`', function (error, results, fields) {
            if (error) {
                errorStatus = 1;
                errorStorage = error;
                //If the error is undefined then, Ill consider it as clear for now!
            }

            postData = results;
            connection.end();

            if (errorStatus > 0) {
                resolve(postData);
            } else {
                if (errorStorage == null) {
                    resolve(postData);
                } else {
                    reject("Request Failure");
                }
            }
        });
    });
}

export async function getQueryPostsLatest() {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        const response = await qb.select('p.post_id, p.post_image, p.post_caption, p.post_account_id, p.post_update_date, a.account_name').from('post p').join('account a','a.account_id=p.post_account_id').order_by('p.post_update_date', 'desc').limit(5).get();
        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function getPostsLatest() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        var postData;

        let errorStatus = 0;
        let errorStorage;

        connection.query('SELECT * FROM `post` LEFT OUTER JOIN `account` ON `post_account_id` = `account_id` ORDER BY post_update_date DESC LIMIT 5', function (error, results, fields) {
            if (error) {
                errorStatus = 1;
                errorStorage = error;
                //If the error is undefined then, Ill consider it as clear for now!
            }

            postData = results;
            connection.end();

            if (errorStatus > 0) {
                resolve(postData);
            } else {
                if (errorStorage == null) {
                    resolve(postData);
                } else {
                    reject("Request Failure");
                }
            }
        });
    });
}

export async function getQueryPost(id) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();

    let post_id = parseInt(id);
    if (isNaN(post_id)) {
        //If it's not interger, get out!
        return error;
    }

    try {
        const response = await qb.select('*').where({ post_id: post_id })
            .get('post');
        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function getPost(id){
    return new Promise((resolve, reject)=> {
        const connection = mysql.createConnection(DBCONFIG);
        var getPost;

        //Mini sanitize, should return NaN
        let post_id = parseInt(id);
        if (isNaN(post_id)){
            //If it's not interger, get out!
            reject("Request Aborted");
        }

        let errorStatus = 0;
        let errorStorage;

        connection.query('SELECT * FROM `post` LEFT OUTER JOIN `account` ON `post_account_id` = `account_id` WHERE post_id =' + post_id, function (error, results, fields) {
            if (error) {
                errorStatus = 1;
                errorStorage = error;
                //If the error is undefined then, Ill consider it as clear for now!
            }

            getPost = results;
            connection.end();

            if (errorStatus > 0) {
                resolve(getPost);
            } else {
                if (errorStorage == null) {
                    resolve(getPost);
                } else {
                    reject("Request Failure");
                }
            }
        });
    });
}

export async function createQueryPost(data, image, user) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        let post_id = null; //AutoIncrement
        let post_caption = mysql_real_escape_string(data.caption);
        let post_caption_sanitized = post_caption.replace(/(&.+;)/igm, "");
        let post_image = image;

        let post_account_id = parseInt(user);
        if (isNaN(post_account_id)) {
            //If it's not interger, get out!
            return error;
        }

        let post_reaction_id = "1";
        let post_upload_date = null; //AutoCreation
        let post_update_date = null; //AutoCreation

        const postData = {
            post_caption: post_caption_sanitized,
            post_account_id: post_account_id,
            post_image: post_image,
            post_reaction_id: post_reaction_id,
        };

        const response = await qb.returning('id').insert('post', postData);

        if (response == null) {
            return error;
        }

        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function createPost(data, image, user) {
    return new Promise((resolve, reject)=> {
        const connection = mysql.createConnection(DBCONFIG);
        //Expect Data to be a JSON File!
        let createPostData = data; //For Debugging
        let createImageData = image;

        let post_id = null; //AutoIncrement
        let post_caption = mysql_real_escape_string(data.caption);
        let post_caption_sanitized = post_caption.replace(/(&.+;)/igm, "");
        let post_image = createImageData;

        let post_account_id = parseInt(user);
        if (isNaN(post_account_id)) {
            //If it's not interger, get out!
            reject("Request Aborted");
        }

        let post_reaction_id = "1";
        let post_upload_date = null; //AutoCreation
        let post_update_date = null; //AutoCreation

        let errorStatus = 0;
        let errorStorage;
        
        connection.query('INSERT INTO `post`(`post_id`, `post_caption`, `post_image`, `post_account_id`, `post_reaction_id`, `post_upload_date`, `post_update_date`) VALUES (' + post_id + ', "' + post_caption_sanitized + '", "' + post_image + '", ' + post_account_id + ', ' + post_reaction_id + ', CURRENT_TIMESTAMP , CURRENT_TIMESTAMP)', function (error, results, fields) {
            if (error) {
                reject(error);
            }
            connection.end();

            if (errorStatus > 0) {
                resolve();
            } else {
                if (errorStorage == null) {
                    resolve();
                } else {
                    reject("Insertion Failure");
                }
            }
        });

    });
}

export async function updateQueryPost(data, image) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        let post_id = parseInt(data.id);
        if (isNaN(post_id)) {
            //If it's not interger, get out!
            return error;
        }

        let post_caption = mysql_real_escape_string(data.caption);
        let post_caption_sanitized = post_caption.replace(/(&.+;)/igm, "");
        let post_image = image;

        const response = await qb.set({
            post_caption: post_caption_sanitized,
            post_image: post_image,
        }).where({ post_id: post_id }).update('post');

        if (response == null) {
            return error;
        }
        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function updatePost(data, image) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        //Expect Data to be a JSON File!
        let updatePostData = data; //For Debugging
        let updatePostDataAfter;

        let post_id = data.id;
        let post_caption = mysql_real_escape_string(data.caption);
        let post_caption_sanitized = post_caption.replace(/(&.+;)/igm, "");
        let post_image = image;

        let errorStatus = 0;
        let errorStorage;

        connection.query('UPDATE `post` SET `post_caption` = "' + post_caption_sanitized + '", `post_image` = "' + post_image + '", `post_update_date` = CURRENT_TIMESTAMP WHERE `post`.`post_id` = ' + post_id, function (error, results, fields) {
            if (error) {
                reject(error);
            }

            connection.end();

            updatePostDataAfter = results;
            if (errorStatus > 0) {
                resolve();
            } else {
                if (errorStorage == null) {
                    resolve();
                } else {
                    reject("Update Failure");
                }
            }
        });

    });
}

export async function deleteQueryPost(id) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        let post_id = parseInt(id);
        if (isNaN(post_id)) {
            //If it's not interger, get out!
            return error;
        }

        const response = await qb.delete('post', {post_id: post_id});

        if (response == null) {
            return error;
        }
        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function deletePost(id) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        
        //Mini sanitize, should return NaN
        let post_id = parseInt(id);
        if (isNaN(post_id)) {
            //If it's not interger, get out!
            reject("Request Aborted");
        }

        let errorStatus = 0;
        let errorStorage;

        connection.query('DELETE FROM `post` WHERE `post`.`post_id` = ' + post_id, function (error, results, fields) {
            if (error) {
                reject(error);
            }

            connection.end();

            if (errorStatus > 0) {
                resolve();
            } else {
                if (errorStorage == null) {
                    resolve();
                } else {
                    reject("Deletion Failure");
                }
            }
        });
    });
}

