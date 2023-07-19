const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createComment(comment) {
  const db = await dbPromise;
  // const currentDate = new Date();
  // const options = { hour12: true };
  // const formattedDate = currentDate.toLocaleString('en-US', options);
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

  const result = await db.run(SQL`
  INSERT INTO Comment (Comment_Text, Comment_Time, Article_ID, User_ID, Parent_Comment_ID) 
  VALUES (${comment.Comment_Text},${formattedDate}, ${comment.Article_ID}, ${comment.User_ID}, ${comment.Parent_Comment_ID})      
  `);

  comment.Comment_ID = result.lastID;
}

async function removeChildCommentByParentID(Comment_ID){
 
  await removeComment(Comment_ID);
  await removeCommentByCommentID(Comment_ID);
}

async function removeCommentByCommentID(Comment_ID){
  const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Comment WHERE Comment_ID = ${Comment_ID}
  `);
}

async function removeComment(Parent_Comment_ID){
  const db = await dbPromise;
  const subComments = await db.all(SQL`
  SELECT Comment_ID FROM Comment WHERE Parent_Comment_ID = ${Parent_Comment_ID}
  `);
  if(subComments.length != 0){
    for (const comment of subComments) {
      await removeChildCommentByParentID(comment.Comment_ID);
    }
  }else{
    await removeCommentByCommentID(Parent_Comment_ID);
  }

  

    
}
//=======================================================

async function getAllCommentById(Article_ID) {
  const db = await dbPromise;
  const result = await db.all(SQL`
  SELECT 
    c.Comment_ID,
    c.Comment_Text,
    c.Comment_Time,
    c.Parent_Comment_ID,
    c.Article_ID,
    c.User_ID,
    u.Username AS Commenter_Username,
    u.Avatar AS Commenter_Avatar,
    p.Comment_ID AS Parent_Comment_ID,
    p.User_ID AS Parent_Comment_User_ID,
    pu.Username AS Parent_Comment_Username
FROM 
    Comment AS c
    INNER JOIN User AS u ON c.User_ID = u.User_ID
    LEFT JOIN Comment AS p ON c.Parent_Comment_ID = p.Comment_ID
    LEFT JOIN User AS pu ON p.User_ID = pu.User_ID
WHERE
    c.Article_ID = ${Article_ID}
ORDER BY
    c.Comment_Time DESC
  `);
  return result;
}
async function getTotalCommentCount(Article_ID){
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT COUNT(*) FROM Comment WHERE Article_ID = ${Article_ID}
  `);
  return result;
}

async function getChildCommentsByParentCommentID(Parent_Comment_ID){
  const db = await dbPromise;
  const result = await db.all(SQL`
    SELECT Comment_ID FROM Comment WHERE Parent_Comment_ID = ${Parent_Comment_ID}
  `);
  return result;
}

async function getUserIDByCommentID(Comment_ID){
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT User_ID FROM Comment WHERE Comment_ID = ${Comment_ID}
  `);
  return result;
}
//delete all comments from the user 删除用户时，删除用户的所有评论
async function removeUsersAllComments(userId) {
  const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Comment WHERE Parent_Comment_ID IN (SELECT Comment_ID FROM Comment WHERE User_ID = ${userId});
  `);
  await db.run(SQL`
  DELETE FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${userId});

  `);
  await db.run(SQL`
  DELETE FROM Comment WHERE User_ID = ${userId}
  `);
  }
//delete all comments from the article 删除文章时，删除文章的所有评论
  async function removeArticlesAllComments(articleId) {
  const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Comment WHERE Article_ID = ${articleId}
  `);
}
//delete all notification from the article 删除文章时，删除发表文章的发出的所有notification
async function removeArticlesAllNotifications(articleId) {
  const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Notification WHERE Article_ID = ${articleId}
  `);
}

//=======================================================

// Export functions.
module.exports = {
  getTotalCommentCount,
  getAllCommentById,
  createComment,
  getChildCommentsByParentCommentID,
  removeCommentByCommentID,
  removeChildCommentByParentID,
  removeComment,
  getUserIDByCommentID,
  removeUsersAllComments,
  removeArticlesAllComments,
  removeArticlesAllNotifications



};
