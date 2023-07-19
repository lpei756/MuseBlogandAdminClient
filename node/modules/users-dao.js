const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const crypto = require('crypto');

async function createUser(user) {
    const db = await dbPromise;
    console.log("Creating user: ", user);
    try {
        const result = await db.run(SQL`
            insert into User (
                Username, 
                Password, 
                Real_Name, 
                Date_Of_Birth, 
                Brief_Description, 
                Avatar, 
                Is_Admin, 
                authToken
            ) values(
                ${user.Username}, 
                ${user.Password}, 
                ${user.Real_Name}, 
                ${user.Date_Of_Birth}, 
                ${user.Brief_Description}, 
                ${user.Avatar}, 
                ${user.Is_Admin}, 
                ${user.authToken})`);

        // Get the auto-generated ID value, and assign it back to the user object.
        user.User_ID = result.lastID;
        console.log("Created user with ID: ", result.lastID);
    } catch (err) {
        console.error("Failed to insert user into database:", err);
        throw err;
    }

    // This should return the user with the new User_ID
    return user;
}

async function getUserPassword(Username) {
    const db = await dbPromise;
    try {
        const User = await db.get(SQL`
        SELECT Password 
        FROM User 
        WHERE Username = ${Username}`);

        console.log(`Fetched password for ${Username}: ${User.Password}`);  

        if (User && User.Password) {
            return User.Password;
        } else { 
            return undefined;
        };
    }catch (e) {
        console.error("Error "+e.name+" in function [getUserPassword] in [users-dao]"+e.message);
        return undefined;
    }
}

async function updateUser(user) {
    console.log('Function updateUser started');
    const db = await dbPromise;
    try {
        const result = await db.run(SQL`
            UPDATE User
            SET Username = ${user.Username}, 
            Password = ${user.Password},
            Real_Name = ${user.Real_Name}, 
            Date_Of_Birth = ${user.Date_Of_Birth}, 
            Brief_Description = ${user.Brief_Description},
            Avatar = ${user.Avatar}, 
            Is_Admin = ${user.Is_Admin},
            authToken = ${user.authToken}
            WHERE User_ID = ${user.User_ID}`
        );
        console.log('Function updateUser completed');
        return result;
    } catch (e) {
        console.error("Error "+e.name+" in function [updateUser] in [users-dao]"+e.message);
        return false;
    }
}

async function deleteUser(User_ID) {
    const db = await dbPromise;
    try {
        const result = await db.run(SQL`
            DELETE FROM User
            WHERE User_ID = ${User_ID}
        `);
        console.log('Function deleteUser completed');
        return result;
    } catch (e) {
        console.error("Error "+e.name+" in function [deleteUser] in [users-dao]"+e.message);
        return false;
    }
}

async function retrieveUserByUsername(Username) {
    try {
        const db = await dbPromise;
        const User = await db.get(SQL`
            SELECT * FROM User
            WHERE Username = ${Username}`);
            console.log('Function retrieveUserByUsername completed');
        return User;
    } catch (e) {
        console.error("Error "+e.name+" in function [retrieveUserByUsername] in [users-dao]"+e.message);
        return null;
    }
}

async function retrieveUserWithAuthToken(authToken) {
    const db = await dbPromise;
    console.log('Function retrieveUserWithAuthToken started');
    console.log(`Auth token received: ${authToken}`);
    try {
        const User = await db.get(SQL`
            SELECT * FROM User
            WHERE authToken = ${authToken}`);
            console.log('Function retrieveUserWithAuthToken completed');
            console.log(`User retrieved2: ${JSON.stringify(User)}`);
        return User;
        
    } catch (e) {
        console.error("Error "+e.name+" in function [retrieveUserWithAuthToken] in [users-dao]"+e.message);
        return null;
        
    }
}

function generateauthToken() {
    return crypto.randomBytes(30).toString('hex');
}

async function retrieveUserById(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from User
        where User_ID = ${id}`);

    return user;
}

async function retrieveUserWithCredentials(username, password) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from User
        where Username = ${username} and Password = ${password}`);

    return user;
}

//returns a user Object
async function retrieveUserByUserID(User_ID) {
    const db = await dbPromise;
    try {
        const User = await db.get(SQL`
            select * from User
            where User_ID = ${User_ID}`);
            console.log('Function retrieveUserByUserID completed');
        return User;
    } catch (e) {
        console.error("Error "+e.name+" in function [retrieveUserByUserID] in [users-dao]"+e.message);
        return null;
    }
}

//returns a user JSON with username
async function retrieveUsernameByUserID(User_ID) {
    const db = await dbPromise;
    try {
        const Username = await db.get(SQL`
            select Username from User
            where User_ID = ${User_ID}`);
            console.log('Function retrieveUsernameByUserID completed');
        return Username;
    } catch (e) {
        console.error("Error "+e.name+" in function [retrieveUsernameByUserID] in [users-dao]"+e.message);
        return null;
    }
}

async function retrieveAllUsername() {
    const db = await dbPromise;

    const username = await db.all(SQL`
        select Username from User`);
    return username;
}

async function retrieveAllUsers() {
    const db = await dbPromise;
    try {
        const User = await db.all(SQL`select * from User`);
        console.log('Function retrieveAllUsers completed');
        return User;
    } catch (e) {
        console.error("Error "+e.name+" in function [retrieveAllUsers] in [users-dao]"+e.message);
        return null;
    }
}

async function checkUserAdminStatusByAuthToken(authToken) {
    const db = await dbPromise;
    try {
        const adminstratorStatusObject = await db.get('SELECT Is_Admin FROM User WHERE authToken = ?', [authToken]);
        console.log(`Fetched Is_Admin status for ${authToken}: ${adminstratorStatusObject.Is_Admin}`);
        let isAdmin = adminstratorStatusObject.Is_Admin;
        console.log(`Is_Admin: ${isAdmin}`);
        return isAdmin ? true : false;
    } catch (e) {
        console.error("Error "+e.name+" in function [checkUserAdminStatusByAuthToken] "+e.message);
        return undefined;
    }
}

async function userReport() {
    const db = await dbPromise;
    try {
        return await db.all(SQL`SELECT User.User_ID, Username, Real_Name, Date_Of_Birth, Brief_Description,Avatar, COUNT(Article_ID) AS 'NumberOfArticles' 
        FROM User 
        LEFT JOIN Article 
        ON User.User_ID = Article.User_ID
        GROUP BY User.User_ID;`);
        
    } catch(e) {
        console.error("Error "+e.name+" in function [userReport] in [users-dao]"+e.message);
    }
}

async function getAllUsers() {
    const db = await dbPromise;
    const users = await db.all(SQL`select * from User`);
    return users;
}


// Export functions.
module.exports = {
    createUser,
    getUserPassword,
    updateUser,
    deleteUser,
    retrieveUserByUsername,
    retrieveUserWithAuthToken,
    generateauthToken,
    retrieveUserById,
    retrieveUserWithCredentials,
    retrieveUserByUserID,
    retrieveUsernameByUserID,
    retrieveAllUsername,
    retrieveAllUsers,
    checkUserAdminStatusByAuthToken,
    userReport,
    getAllUsers
};
