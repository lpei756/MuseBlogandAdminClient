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


// async function getNotifications(userID) {
//   try {
//     const db = await dbPromise;
//     const notifications = await db.all(`SELECT * FROM Notification WHERE Receiver_ID = ? ORDER BY Timestamp DESC LIMIT 15`, [userID]);
//     if (!notifications) throw new Error('Notifications not found.');
    
//     console.log('Notifications: ', notifications);
//     return notifications;
//   } catch (error) {
//     console.error('Error: ', error);
//     throw error;
//   }
// }

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
async function updateUserProfile(userID, userProfileData, user) {
  try {
    const originalAvatar = user.Avatar;
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
    if(icon == false){
      await db.run(
        SQL`UPDATE User SET Avatar = ${originalAvatar} WHERE User_ID = ${userID}`
      );
    }

    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}


// DAO Method for following a user
async function checkIsFollowing(User_ID, authorID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
    SELECT * FROM Subscription WHERE Subscriber_ID = ${User_ID} AND Author_ID = ${authorID}
  `);
  if (!result) {
    return false;
  } else {
    return true;
  }
}


async function followUser(followerId, userId) {
  try {
    // console.log("Follower ID: ", followerId);
    // console.log("User ID: ", userId);
    const db = await dbPromise;

    //check if subscription already exists
    const checkQuery = SQL`
    SELECT * FROM Subscription 
    WHERE Subscriber_ID = ${followerId} AND Author_ID = ${userId}
    `;
    console.log("Check Query: ", checkQuery);
    const existingSubscription = await db.get (checkQuery);

    //Only process if the subsription does not exist
    if (!existingSubscription) {

    // Insert into Subscription table
    const followQuery = SQL`
    INSERT INTO Subscription (Subscriber_ID, Author_ID) 
    VALUES (${followerId}, ${userId})
    `;
    const followResult = await db.run(followQuery);
    
    console.log(`Subscription created successfully. InsertId: ${followResult.lastID}`);

    // Insert into Notification table
    // const uniqueNotificationId = Date.now(); 
      //get the followerUsername by followerId
    const follower = await db.get(SQL`
    SELECT * FROM User WHERE User_ID = ${followerId}
    `);

    const notificationQuery = `
    INSERT INTO Notification (Content, Timestamp, Is_Read, Sender_ID, Receiver_ID, NotificationType, Article_ID) 
    VALUES ('User ${follower.Username} has started following you', CURRENT_TIMESTAMP, 0, ${followerId}, ${userId}, 'Follow', NULL)
    `;
    await db.run(notificationQuery);
    console.log(`Notification created successfully!`);
  } else {
    console.log ("User is already followed");
    }
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
}

// DAO Method for unfollowing a user
async function unfollowUser(followerId, userId) {
  try {
    const db = await dbPromise;
    console.log("删除Follower ID: ", followerId);
    console.log("删除User ID: ", userId);
    // Delete from Subscription table
    const unfollowQuery = SQL`
    DELETE FROM Subscription 
    WHERE Subscriber_ID = ${followerId} 
    AND Author_ID = ${userId}`;
    const unfollowResult = await db.run(unfollowQuery);
    console.log("Unfollow Result: ", unfollowResult);
    if(unfollowResult.changes > 0){
    console.log(`User unfollowed successfully. Changes made: ${unfollowResult.changes}`);
    } else {
    console.log("Unfollow operation did not change anything! ")
    }
   } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
}

//get the count of the profile owner's follows 获得当前用户（非本人）的关注的人的数量
async function getFollowsCount(userID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT COUNT(*) FROM Subscription WHERE Subscriber_ID = ${userID}
  `);
  return result;
}
//get the count of the profile owner's subscribers获得当前用户（非本人）的粉丝的数量
async function getSubcriberCount(userID) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT COUNT(*) FROM Subscription WHERE Author_ID = ${userID}
  `);
  return result;
}

async function deleteAllSubscriptionsForOneUser(userId) {
const db = await dbPromise;
  await db.run(SQL`
  DELETE FROM Subscription
  WHERE Subscriber_ID = ${userId} OR Author_ID = ${userId};
  `);
  }

// Export functions.
module.exports = {
    getUserProfile,
    getTotalCommentsAndAuthorByArticleID,
    updateUserProfile,
    followUser,
    unfollowUser,
    getFollowsCount,
    getSubcriberCount,
    deleteAllSubscriptionsForOneUser,
    checkIsFollowing
};
