const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function getLikerByArticleID(Article_ID){
    const db = await dbPromise;
    const result = await db.all(SQL`
    SELECT User_ID FROM Article_Like WHERE Article_ID = ${Article_ID}
    `);
    // console.log("likeDao的getLikerByArticleID函数的结果是： ", result);
    return result;
}

async function updateLikeCountAndLiker(Article_ID, User_ID){
    const db = await dbPromise;
    await db.run(SQL`
    UPDATE Article SET Likes_Count = Likes_Count + 1 WHERE Article_ID = ${Article_ID}
    `);
    await db.run(SQL`
    INSERT INTO Article_Like (Article_ID, User_ID) VALUES (${Article_ID}, ${User_ID})
    `);
}

async function getLikeCount(Article_ID){
    const db = await dbPromise;
    const result = await db.get(SQL`
    SELECT Likes_Count FROM Article WHERE Article_ID = ${Article_ID}
    `);
    return result;
}

async function removeLikeCountAndLiker(Article_ID, User_ID){
    const db = await dbPromise;
    await db.run(SQL`
    UPDATE Article SET Likes_Count = Likes_Count - 1 WHERE Article_ID = ${Article_ID}
    `);
    await db.run(SQL`
    DELETE FROM Article_Like WHERE Article_ID = ${Article_ID} AND User_ID = ${User_ID}
    `);
}
//clear all the like from users 清除用户的所有like（删除用户时用）
async function deleteAllLikesForOneUser(userId) {
    const db = await dbPromise;
    await db.run(SQL`
    DELETE FROM Article_Like WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${userId});
    `);
    await db.run(SQL`DELETE FROM Article_Like WHERE User_ID = ${userId}`);
    }
//clear all the like from article 清除文章的所有like（删除文章时用）
async function deleteAllLikesForOneArticle(articleId) {
    console.log("准备删除文章的所有like");
    const db = await dbPromise;
    await db.run(SQL`
    DELETE FROM Article_Like WHERE Article_ID = ${articleId}`);
}

// Export functions.
module.exports = {
    updateLikeCountAndLiker,
    getLikerByArticleID,
    getLikeCount,
    removeLikeCountAndLiker,
    deleteAllLikesForOneUser,
    deleteAllLikesForOneArticle
  };
  