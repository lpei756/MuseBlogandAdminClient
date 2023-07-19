const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');

async function getSubscribersById(User_ID) {
    
    const db = await dbPromise;
    const subscribers = await db.all(SQL`
        SELECT User.* 
        FROM User 
        JOIN Subscription ON User.User_ID = Subscription.Subscriber_ID
        WHERE Subscription.Author_ID = ${User_ID}`);
        console.log(subscribers);  
    return subscribers;
}


module.exports = {
    getSubscribersById
};