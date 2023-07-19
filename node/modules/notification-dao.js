const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createNotificationWhenLike(sender, article) {
  const db = await dbPromise;
  const result = await db.run(`INSERT INTO Notification (Content, Is_Read, Sender_ID, Receiver_ID, NotificationType) VALUES ('${sender.Username} liked your article ${article.Title}', FALSE, ${sender.User_ID}, ${article.User_ID}, 'Like')`);

//   const result = await db.run(SQL`
//   INSERT INTO Notification (Content, Is_Read, Sender_ID, Receiver_ID, NotificationType) VALUES 
//   ("${sender.Username} liked your article ${article.Title}", FALSE, ${sender.User_ID}, ${article.User_ID}, "Like")
// `);
}

async function createNotificationWhenComment(sender, article) {
  const db = await dbPromise;

  const result = await db.run(`
  INSERT INTO Notification (Content, Is_Read,  Sender_ID, Receiver_ID, NotificationType, Article_ID) VALUES 
  ('${sender.Username} left a comment in your article ${article.Title}', FALSE, ${sender.User_ID}, ${article.User_ID}, 'Comment', ${article.Article_ID})
    `);
  
}

async function createNotificationWhenReply(sender, Receiver_ID, article) {
  const db = await dbPromise;

  const result = await db.run(`
  INSERT INTO Notification (Content, Is_Read,  Sender_ID, Receiver_ID, NotificationType, Article_ID) VALUES 
  ('${sender.Username} replied you in article ${article.Title}', FALSE, ${sender.User_ID}, ${Receiver_ID}, 'Reply', ${article.Article_ID})
    `);
  
}

async function getAllNotificationByUserID(User_ID) {
  const db = await dbPromise;

  const result = await db.all(SQL`
  SELECT * FROM Notification WHERE Receiver_ID = ${User_ID} ORDER BY Timestamp DESC`);
  return result;
}

async function retrieveNotificationByID(Notification_ID) {
  const db = await dbPromise;
  console.log("通知的id: ", Notification_ID);
  const result = await db.get(SQL`
  SELECT * FROM Notification WHERE Notification_ID = ${Notification_ID}`);
  console.log("通知的result: ", result);
  return result;

}
async function updateNotificationIsRead(Notification_ID) {
  const db = await dbPromise;

  const result = await db.run(SQL`
  UPDATE Notification SET Is_Read = TRUE WHERE Notification_ID = ${Notification_ID}`);
  return result;

}
//when delete account, delete all the notification删除用户时，删除该用户的所有通知
async function deleteUsersAllNotification(userId) {
  const db = await dbPromise;
  await db.run(SQL`
  delete from Notification where Sender_ID = ${userId} OR Receiver_ID = ${userId};
  `);
  await db.run(SQL`
  DELETE FROM Notification WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${userId});
  `);
}

//delete one notification from the user 删除当前用户的一个通知项
async function deleteOneNotification(Notification_ID) {
  const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Notification WHERE Notification_ID = ${Notification_ID};
  `);
}



// Export functions.
module.exports = {
  createNotificationWhenLike,
  createNotificationWhenComment,
  createNotificationWhenReply,
  getAllNotificationByUserID,
  retrieveNotificationByID,
  updateNotificationIsRead,
  deleteUsersAllNotification,
  deleteOneNotification

};
