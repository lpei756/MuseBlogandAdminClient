const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function getAllArticlesByPublishTime() {
  const db = await dbPromise;
  const results = await db.all(SQL`
    SELECT * FROM Article ORDER BY Date DESC
    `);
  return results;
}

async function getAllArticlesByAuthorName() {
  const db = await dbPromise;
  const results = await db.all(SQL`
  SELECT Article.*, User.Username
  FROM Article
  JOIN User ON Article.User_ID = User.User_ID
  ORDER BY User.Username ASC;
    `);
  return results;
}

async function getAllArticlesByTitle() {
  const db = await dbPromise;
  const results = await db.all(SQL`
    SELECT * FROM Article ORDER BY Title ASC
    `);
  return results;
}

async function getMyArticles(num, userId) {
  const db = await dbPromise;
  const allArticles = await db.all(SQL`
    SELECT * FROM Article WHERE User_ID = ${userId} ORDER BY Date DESC
    `);
  let results = [];
  for (let i = 0; i < num; i++) {
    if(allArticles[i] != null){results.push(allArticles[i]);
    }
  }
  return results;
}

async function createArticle(article) {
  const db = await dbPromise;

  const result = await db.run(SQL`
        INSERT INTO Article (Title, Content, Image, Date, Likes_Count, User_ID)
        VALUES (${article.Title}, ${article.Content}, ${article.Image}),${article.Date},${article.username}`);

  // Get the auto-generated ID value, and assign it back to the user object.
  user.id = result.lastID;
}

async function getArticleByArticleID(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT * FROM Article WHERE Article_ID = ${Article_ID}
    `);
  return result;
}

async function getAuthorByArticleID(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT* FROM User 
    WHERE User_ID = (SELECT User_ID FROM Article WHERE Article_ID = ${Article_ID})
    `);
  return result;
}

// async function getLikerByArticleID(Article_ID) {
  
//   const db = await dbPromise;
//   const result = await db.all(SQL`
//     SELECT * FROM User 
//     WHERE User_ID = (SELECT User_ID FROM Article_Like WHERE Article_ID = ${Article_ID})
//     `);
//   return result;
// }

async function getAuthorNameByArticleID(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT Username 
    FROM User 
    WHERE User_ID = (SELECT User_ID FROM Article WHERE Article_ID = ${Article_ID})
    `);
  return result;
}

async function getAuthorAvatarByArticleID(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT Avatar 
    FROM User 
    WHERE User_ID = (SELECT User_ID FROM Article WHERE Article_ID = ${Article_ID})
    `);
  return result;
}

// Export functions.
module.exports = {
  createArticle,
  getArticleByArticleID,
  getAuthorNameByArticleID,
  getAuthorAvatarByArticleID,
  getAllArticlesByPublishTime,
  getAllArticlesByAuthorName,
  getAllArticlesByTitle,
  getMyArticles,
  getAuthorByArticleID
  // getLikerByArticleID,
};
