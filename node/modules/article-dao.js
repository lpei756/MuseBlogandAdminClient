const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function getArticleByArticleID(Article_ID){
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT * FROM Article WHERE Article_ID = ${Article_ID}
    `);
    return result;
}


async function getAuthorNameByArticleID(Article_ID){
    console.log("getAuthorNameByArticleID的Article_ID是" + Article_ID);
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT Username 
    FROM User 
    WHERE User_ID = (SELECT User_ID FROM Article WHERE Article_ID = ${Article_ID})
    `);
  
    return result;
    
}
async function getAuthorAvatarByArticleID(Article_ID){
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT Avatar 
    FROM User 
    WHERE User_ID = (SELECT User_ID FROM Article WHERE Article_ID = ${Article_ID})
    `);
    return result;
  }

async function deleteAllArticlesForOneUser(userId) {
    const db = await dbPromise;
    // await db.run(SQL`
    // DELETE FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${userId});
    // `);
    await db.run(SQL`
    DELETE FROM Article WHERE User_ID = ${userId}
    `);
}
//delete all article data from the article 删除文章时，删除文章的所有数据
async function deleteArticle(Article_ID) {
    const db = await dbPromise;
    await db.run(SQL`
    DELETE FROM Article
    WHERE Article_ID = ${Article_ID}
    `);
      }
// Export functions.
module.exports = {
    getArticleByArticleID,
    getAuthorNameByArticleID,
    getAuthorAvatarByArticleID,
    deleteAllArticlesForOneUser,
    deleteArticle
};
  