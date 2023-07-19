const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createNotification(testData) {
  const db = await dbPromise;

  const result = await db.run(SQL`
        insert into test (stuff) values(${testData.stuff})`);

  testData.id = result.lastID;
}

async function getThreeNotifications(User_ID) {
  const db = await dbPromise;
  const allNotifications = await db.all(SQL`
        select * from Notification WHERE Receiver_ID = ${User_ID} ORDER BY Timestamp DESC`);
  let threeNotifications = [];
  for (let i = 0; i < allNotifications.length && i < 3; i++) {
    threeNotifications.push(allNotifications[i]);
  }
  
  return threeNotifications;
}

async function getSenderByNotificationID(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT* FROM User 
    WHERE User_ID = (SELECT Sender_ID FROM Notification WHERE Notification_ID = ${id})
    `);
  return result;
}

async function retrieveNotificationById(id) {
  const db = await dbPromise;

  const testData = await db.get(SQL`
        select * from test
        where id = ${id}`);

  return testData;
}

async function updateNotification(testData) {
  const db = await dbPromise;

  return await db.run(SQL`
        update test
        set stuff = ${testData.stuff}
        where id = ${testData.id}`);
}

async function deleteNotification(id) {
  const db = await dbPromise;

  return await db.run(SQL`
        delete from test
        where id = ${id}`);
}
async function getReceiverByNotificationID(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT * FROM User 
    WHERE User_ID = (SELECT Receiver_ID FROM Notification WHERE Notification_ID = ${id})
    `);
  return result;
}

async function getUnreadNotificationCountByUserID(User_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT COUNT(*) AS count FROM Notification 
    WHERE Receiver_ID = ${User_ID} AND IS_Read = 0
    `);
    console.log("Unread Notification Count: ", result);
  return result;
}

// Export functions.
module.exports = {
  createNotification,
  retrieveNotificationById,
  updateNotification,
  deleteNotification,
  getThreeNotifications,
  getSenderByNotificationID,
  getReceiverByNotificationID,
  getUnreadNotificationCountByUserID
};
