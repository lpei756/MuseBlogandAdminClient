const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

const getFollowersCount = async (user_id) => {
  const db = await dbPromise;
  const result = await db.get (SQL`
  SELECT COUNT(*) as count 
  FROM Subscription 
  WHERE Author_ID = ${user_id}`);
  console.log(result);
  return result.count;

};

const getCommentsCount = async (user_id) => {
  const db = await dbPromise;
  const result = await db.get (SQL`
  SELECT COUNT(*) AS Comment_Count FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${user_id})
`);
  return result.Comment_Count;
 
};


const getLikesCount = async (user_id) => {
  const db = await dbPromise;
  const result = await db.get (SQL`
  SELECT COALESCE(SUM(Likes_Count), 0) as count
  FROM Article
  WHERE User_ID = ${user_id}`);
  console.log(result);

  return result.count; 
};


async function getTopArticles(user_id) {
  const db = await dbPromise;
  try {
    const articles = await db.all(SQL`
      SELECT a.*, COUNT(c.Comment_ID) as Comments_Count, (COUNT(c.Comment_ID) * 2 + a.Likes_Count) AS Popularity
      FROM Article a
      LEFT JOIN Comment c ON a.Article_ID = c.Article_ID
      WHERE a.User_ID = ${user_id}
      GROUP BY a.Article_ID
      ORDER BY Popularity DESC
      LIMIT 3
    `, user_id);

    console.log(articles);
    return articles;
  } catch (error) {
    console.error('Error retrieving top articles:', error);
    throw error;
  }
}

const getCommentsPerDay = async (user_id) => {
  const db = await dbPromise;
  const rows = await db.all(SQL`
    SELECT DATE(Comment_Time) as Day, COUNT(*) as Count
    FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${user_id})
    GROUP BY Day
    ORDER BY Day DESC
    LIMIT 10
  `);
  return rows;
};

// const getCommentsCount = async (user_id) => {
//   const db = await dbPromise;
//   const result = await db.get (SQL`
//   SELECT COUNT(*) AS Comment_Count FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = ${user_id})
// `);
//   return result.Comment_Count;
 
// };
module.exports = {
  getFollowersCount,
  getCommentsCount,
  getLikesCount,
  getTopArticles,
  getCommentsPerDay
};
