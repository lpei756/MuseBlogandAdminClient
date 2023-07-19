const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createComment(comment) {
  const db = await dbPromise;

  const result = await db.run(SQL`
  INSERT INTO Comment (Comment_Text, Article_ID, User_ID, Parent_Comment_ID) 
  VALUES (${comment.Comment_Text}, ${comment.Article_ID}, ${comment.User_ID}, ${comment.Parent_Comment_ID})      
  `);

  comment.Comment_ID = result.lastID;
}

async function getAllCommentById(Article_ID) {
  const db = await dbPromise;
  const result = await db.all(SQL`
  SELECT * FROM Comment WHERE Article_ID = ${Article_ID} ORDER BY Comment_Time DESC
  `);
  return result;
}

async function getTotalCommentCount(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT COUNT(*) FROM Comment WHERE Article_ID = ${Article_ID}
  `);
  return result;
}

async function getCommentorNameByCommentID(Comment_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT Username 
  FROM User 
  WHERE User_ID = (SELECT User_ID FROM Comment WHERE Comment_ID = ${Comment_ID})
  `);
  return result;
}

async function getCommentorAvatarByCommentID(Comment_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT Avatar 
  FROM User 
  WHERE User_ID = (SELECT User_ID FROM Comment WHERE Comment_ID = ${Comment_ID})
  `);
  return result;
}

async function getParentUsernameByCommentID(Comment_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT Username 
  FROM User 
  WHERE User_ID = (SELECT Parent_Comment_ID FROM Comment WHERE Comment_ID = ${Comment_ID})
  `);
  return result;
}

// async function updateComment(testData) {
//   const db = await dbPromise;

//   return await db.run(SQL`
//         update test
//         set stuff = ${testData.stuff}
//         where id = ${testData.id}`);
// }

// async function deleteComment(id) {
//   const db = await dbPromise;

//   return await db.run(SQL`
//         delete from test
//         where id = ${id}`);
// }

// Export functions.
module.exports = {
  getTotalCommentCount,
  getAllCommentById,
  getCommentorNameByCommentID,
  getParentUsernameByCommentID,
  getCommentorAvatarByCommentID,
  createComment,
};
