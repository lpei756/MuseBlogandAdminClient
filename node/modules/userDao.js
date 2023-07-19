const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

// DAO Method for retrieving user profile data
async function getUserProfile(userID) {
  try {
    // Get a database connection
    const db = await dbPromise;

    // Fetch user profile data from the database
    const user = await db.get(SQL`SELECT * FROM User WHERE User_ID = ${userID}`);
    if (!user) throw new Error('User not found.');

    // Fetch user's articles with comment count, author's username from the database
    const articles = await db.all(SQL`
      SELECT 
      Article.*, 
      COUNT(Comment.Comment_ID) AS Comments_Count,
      User.Username
      FROM Article
      LEFT JOIN Comment ON Article.Article_ID = Comment.Article_ID
      JOIN User ON Article.User_ID = User.User_ID
      WHERE Article.User_ID = ${userID}
      GROUP BY Article.Article_ID, User.Username
      LIMIT 15
    `);

    // Prepare the user profile data to be passed to the template
    const userProfile = {
      user,
      articles
    };

    return userProfile;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    throw error;
  }
}

// async function getUserProfile(userID) {
//   // Get a database connection
//   const db = await dbPromise;

//   // Fetch user profile data from the database
//   const user = await db.get(SQL`SELECT * FROM User WHERE User_ID = ${userID}`);
//   if (!user) throw new Error('User not found.');
 
//   console.log('User: ', user);

//   // Fetch user's articles with comment count, author's username from the database
//   const articles = await db.all(SQL`
//     SELECT 
//     Article.*, 
//     COUNT(Comment.Comment_ID) AS Comments_Count,
//     User.Username
//     FROM Article
//     LEFT JOIN Comment ON Article.Article_ID = Comment.Article_ID
//     JOIN User ON Article.User_ID = User.User_ID
//     WHERE Article.User_ID = ${userID}
//     GROUP BY Article.Article_ID, User.Username
//     LIMIT 15
//   `);
//   console.log('Articles: ', articles);

//   // Prepare the user profile data to be passed to the template
//   const userProfile = {
//     user,
//     articles
//   };

//   return userProfile;
// }

async function getNotifications(userID) {
  try {
    const db = await dbPromise;
    const notifications = await db.all(`SELECT * FROM Notification WHERE Receiver_ID = ? ORDER BY Timestamp DESC LIMIT 15`, [userID]);
    if (!notifications) throw new Error('Notifications not found.');
    
    console.log('Notifications: ', notifications);
    return notifications;
  } catch (error) {
    console.error('Error: ', error);
    throw error;
  }
}

async function getTotalCommentsAndAuthorByArticleID(Article_ID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT Article.Article_ID, User.Real_Name AS Author_Name, COUNT(Comment.Comment_ID) AS Total_Comments 
    FROM Article
    LEFT JOIN Comment ON Article.Article_ID = Comment.Article_ID
    JOIN User ON Article.User_ID = User.User_ID
    WHERE Article.Article_ID = ${Article_ID}
    GROUP BY Article.Article_ID, User.Real_Name;
  `);
  if (!result) throw new Error('Data not found.');

  return result;
}

// DAO Method for updating the user profile
async function updateUserProfile(userID, userProfileData) {
  try {
    const { username, description, password, birthdate, idname, icon } = userProfileData;

    // Get a database connection
    const db = await dbPromise;

    // Update the user profile in the database
    if (password) {
      // Update password and avatar only if it's not empty
      await db.run(
        SQL`UPDATE User SET Username = ${username}, Brief_Description = ${description}, Password = ${password}, Date_Of_Birth = ${birthdate}, Real_Name = ${idname}, Avatar = ${icon} WHERE User_ID = ${userID}`
      );
    } else {
      // Update profile without changing the password
      await db.run(
        SQL`UPDATE User SET Username = ${username}, Brief_Description = ${description}, Date_Of_Birth = ${birthdate}, Real_Name = ${idname}, Avatar = ${icon} WHERE User_ID = ${userID}`
      );
    }

    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}



// Export functions.
module.exports = {
    getUserProfile,
    getNotifications,
    getTotalCommentsAndAuthorByArticleID,
    updateUserProfile
};
