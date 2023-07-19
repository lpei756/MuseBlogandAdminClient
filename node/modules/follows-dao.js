const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');

async function getFollowsById(User_ID) {
    const db = await dbPromise;
    const follows = await db.all(SQL`
        SELECT User.* 
        FROM User 
        JOIN Subscription ON User.User_ID = Subscription.Author_ID
        WHERE Subscription.Subscriber_ID = ${User_ID}`);
    return follows;
}

module.exports = {
    getFollowsById
};