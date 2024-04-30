import mysql from 'mysql';
import dotenv from 'dotenv';
import passport from "passport";
import bcrypt from "bcrypt";
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

export async function getQueryUserByID(data) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        let account_id = parseInt(data);
        if (isNaN(account_id)) {
            return error;
        }

        const response = await qb.select('*')
            .where({ account_id: account_id})
            .get('account');

        return response;
        
    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function getUserByID(data) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        
        let queryResult;
        let account_id = parseInt(data);
        if (isNaN(account_id)) {
            //If it's not interger, get out!
            reject("Request Aborted");
        }

        let errorStatus = 0;
        let errorStorage;

        connection.query('SELECT * FROM `account` WHERE account_id = ' + account_id, function (error, results, fields) {
            if (error) {
                errorStatus = 1;
                errorStorage = error;
                //If the error is undefined then, Ill consider it as clear for now!
            }

            queryResult = results;
            
            connection.end();

            if (errorStatus > 0) {
                resolve(queryResult);
            } else {
                if (errorStorage == null) {
                    resolve(queryResult);
                } else {
                    reject("Unable To Find");
                }
            }

        });
    });
}

export async function getQueryUserByEmail(data) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        let account_email = mysql_real_escape_string(data);

        const response = await qb.select('*')
            .where({ account_email: account_email })
            .get('account');

        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function getUserByEmail(data) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DBCONFIG);
        let queryResult;
        let account_email = mysql_real_escape_string(data);

        let errorStatus = 0;
        let errorStorage;

        connection.query('SELECT * FROM `account` WHERE account_email = "' + account_email + '"', function (error, results, fields) {
            if (error) {
                errorStatus = 1;
                errorStorage = error;
                //If the error is undefined then, Ill consider it as clear for now!
            }
            queryResult = results;

            connection.end();

            if (errorStatus > 0) {
                resolve(queryResult);
            } else {
                if (errorStorage == null) {
                    resolve(queryResult);
                } else {
                    reject("Unable To Find");
                }
            }
        });
    });
}

export async function createQueryUser(data) {
    const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');
    const qb = await pool.get_connection();
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        let account_id = null; //AutoIncrement
        let account_name = mysql_real_escape_string(data.name);

        let account_email = mysql_real_escape_string(data.email);
        let account_password = hashedPassword;

        let account_name_sanitized = account_name.replace(/(&.+;)/igm, "");

        const accountData = {
            account_name: account_name_sanitized,
            account_email: account_email,
            account_password: account_password,
        };

        const response = await qb.returning('id').insert('account', accountData);

        if (response == null){
            return error;
        }

        return response;

    } catch (error) {
        return error;
    } finally {
        qb.release();
    }
}

export function createUser(data) {
    return new Promise((resolve, reject) => {
            //Get Password
            bcrypt.hash(data.password, 10).then((result)=> {
                resolve(result);
            }).catch((error)=>{
                //console.log(error);
                reject("Insertion Failure");
            });
            
        }).then((result)=> {
            return new Promise((resolve, reject) => {
                const connection = mysql.createConnection(DBCONFIG);
                //Expect Data to be a JSON File!
                let hashedPassword = result;

                let account_id = null; //AutoIncrement
                let account_name = mysql_real_escape_string(data.name);

                let account_email = mysql_real_escape_string(data.email);
                let account_password = hashedPassword;

                let account_name_sanitized = account_name.replace(/(&.+;)/igm, "");

                let errorStatus = 0;
                let errorStorage;
                
                connection.query('INSERT INTO `account`(`account_name`, `account_email`, `account_password`) VALUES ("' + account_name_sanitized + '", "' + account_email + '", "' + account_password + '")', function (error, results, fields) {
                    if (error) {
                        errorStatus = 1;
                        errorStorage = error;
                        //If the error is undefined then, Ill consider it as clear for now!
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
        });
}

