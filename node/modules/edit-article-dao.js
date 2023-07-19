const SQL = require('sql-template-strings');
const dbPromise = require('./database.js');

async function getArticleById(Article_ID) {
    const db = await dbPromise;
    const article = await db.get(SQL`SELECT * FROM Article WHERE Article_ID = ${Article_ID}`);
    return article;
}

async function editArticle(article) {
    const db = await dbPromise;

    await db.run(`
        UPDATE Article 
        SET Title = ?, Content = ?, Image = ?, Likes_Count = ?, User_ID = ?
        WHERE Article_ID = ?`,
        article.Title, article.Content, article.Image, article.Likes_Count, article.User_ID, article.Article_ID);
}

module.exports = {
    getArticleById,
    editArticle
};



  
