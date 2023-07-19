const express = require("express");
const router = express.Router();
const { addUserToLocals } = require("../middleware/auth-middleware.js");
const { v4: uuid } = require("uuid");
const bcrypt = require('bcrypt');

const Handlebars = require('handlebars');

const marieUserDao = require("../modules/marie-userDao.js");
const sarahNotificationDao = require("../modules/sarah-notifications-dao.js");
const articleDao = require("../modules/article-dao.js");
const likeDao = require("../modules/like-dao.js");
const commentDao = require("../modules/comment-dao.js");
const userDao = require("../modules/users-dao.js");
const notificationDao = require("../modules/notification-dao.js");
const analyticsDao = require("../modules/analyticsDao.js");

// Route handler for Profile Page

router.get("/profile/:id", addUserToLocals, async function(req, res) {
   
    const userID = req.params.id;
    // if(res.locals.user){
    // //get notification unread number渲染出未读通知数量
    // const allNotifications = await notificationDao.getAllNotificationByUserID(res.locals.user.User_ID);
    // res.locals.unReadComment = allNotifications.length;
    // }
     // 获得三个提醒项
     if(res.locals.user){
        const notifications = await sarahNotificationDao.getThreeNotifications(res.locals.user.User_ID);  
        for (let i = 0; i < notifications.length; i++) {
        notifications[i].userInformation =
            await sarahNotificationDao.getSenderByNotificationID(notifications[i].Notification_ID);
            
        }
        res.locals.notifications = notifications;
        
         //获得所有未读通知数量
         const unreadNotificationsCount = await sarahNotificationDao.getUnreadNotificationCountByUserID(res.locals.user.User_ID);
         res.locals.unreadNotificationsCount = unreadNotificationsCount;
         //判断是否有未读通知
         if(unreadNotificationsCount.count > 0){
           console.log("有未读通知");
           res.locals.hasUnreadNotifications = true;
           }
    }

    try {
        // Get user profile data from the database
        const userProfile = await marieUserDao.getUserProfile(userID);
        
        if(res.locals.user){
            if(res.locals.user.User_ID == userID){
                res.locals.isAuthorPage = true;
                // This variable is used to control whether to show buttons and Real_name or not
            }else{
                res.locals.isAuthorPage = false;
            }
        }else{
            res.locals.isAuthorPage = false;
        }
        // Get the articles associated with the user
        // const articles = await marieUserDao.getUserArticles(userID);

        // Render the profile page template
        //获得follows和followers
        const followsCount = await marieUserDao.getFollowsCount(userID);
        const subcriberCount = await marieUserDao.getSubcriberCount(userID);
        res.locals.followsCount = followsCount;
        res.locals.subcriberCount = subcriberCount;
        //添加页码系统
    
        const page = parseInt(req.params.page);
        const startIndex = (page - 1) * 15;
        const endIndex = startIndex + 15;

  
        res.render('profile', { 
        userProfile: userProfile.user,
        articles: userProfile.articles, // Pass the articles to the template
        
    });
       
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error in /profile/:id route:', error);
        res.status(500).send('Internal Server Error');
    }

    
});

//Check 有没有关注过这个人
router.get("/checkIsFollowing/:authorID", addUserToLocals, async function(req, res) {
    console.log("进入checkIsFollowing");
    if(res.locals.user){
        const authorID = req.params.authorID;
        console.log("authorID: ", authorID);
        const User_ID = res.locals.user.User_ID;
        console.log("userID: ", User_ID);
        const isFollowing = await marieUserDao.checkIsFollowing(User_ID, authorID);
        const message = {
            isFollowing: isFollowing
        }
        res.json(message);
    }else{
        res.json({isFollowing: false});
    }
    
});

  //新内容，删除用户路由
router.get("/delete-account/:User_ID", addUserToLocals, async function (req, res) {
    console.log("进入删除用户路由");
    if(!res.locals.user) {
        res.redirect("/home/visitor/1/publishTime");
    }
    const userId = req.params.User_ID;
    if(res.locals.user.User_ID == userId) {
        //删除用户的所有点赞，通知, 关注, 评论，文章
        await likeDao.deleteAllLikesForOneUser(userId);
        console.log("删除用户的所有点赞成功");
        await notificationDao.deleteUsersAllNotification(userId);
        console.log("删除用户的所有通知成功");
        await marieUserDao.deleteAllSubscriptionsForOneUser(userId);
        console.log("删除用户的所有关注成功");
        await commentDao.removeUsersAllComments(userId);
        console.log("删除用户的所有评论成功");
        await articleDao.deleteAllArticlesForOneUser(userId);
        console.log("删除用户的所有文章成功");
        //最后删除该用户
        await userDao.deleteUser(userId);
        console.log("删除用户成功");
        //同时清除用户登录信息，变回未登录游客状态，也就是主页游客第一页
        res.clearCookie("authToken");
        res.locals.user = null;
        res.redirect("/home/visitor/1/publishTime");
    }else{
        res.redirect("/home/visitor/1/publishTime");
    }
//     -- DELETE FROM Article_Like WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = 2);
// -- DELETE FROM Article_Like WHERE User_ID = 2;
// -- delete from Notification where Sender_ID = 2 OR Receiver_ID = 2;
// -- DELETE FROM Notification WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = 2);
// -- DELETE FROM Subscription WHERE Subscriber_ID = 2 OR Author_ID = 2;
// -- DELETE FROM Comment WHERE Parent_Comment_ID IN (SELECT Comment_ID FROM Comment WHERE User_ID = 2);
// -- DELETE FROM Comment WHERE Article_ID IN (SELECT Article_ID FROM Article WHERE User_ID = 2);
// -- DELETE FROM Comment WHERE User_ID = 2;
// -- DELETE FROM Article WHERE User_ID = 2;
// -- DELETE FROM User WHERE User_ID = 2;
});

router.delete("/api/delete-account/:User_ID", addUserToLocals, async function (req, res) {
    console.log("进入删除用户路由");
    if(!res.locals.user) {
        return res.status(401).send("please login first");
    }
    const userId = req.params.User_ID;
    if(res.locals.user.User_ID != userId || res.locals.user.Is_Admin) {
        return res.status(401).send("Unauthorized");
    }
    try{
       
            //删除用户的所有点赞，通知, 关注, 评论，文章
            await likeDao.deleteAllLikesForOneUser(userId);
            console.log("删除用户的所有点赞成功");
            await notificationDao.deleteUsersAllNotification(userId);
            console.log("删除用户的所有通知成功");
            await marieUserDao.deleteAllSubscriptionsForOneUser(userId);
            console.log("删除用户的所有关注成功");
            await commentDao.removeUsersAllComments(userId);
            console.log("删除用户的所有评论成功");
            await articleDao.deleteAllArticlesForOneUser(userId);
            console.log("删除用户的所有文章成功");
            //最后删除该用户
            await userDao.deleteUser(userId);
            console.log("删除用户成功");
            //同时清除用户登录信息，变回未登录游客状态，也就是主页游客第一页
            res.clearCookie("authToken");
            res.locals.user = null;
            return res.status(204).send("delete user successfully");
    }catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});



// Route handler for following function when clicking follow button at the visitor's my mage
router.post('/follow/:User_ID', addUserToLocals, async (req, res) => {
    console.log("进入follow的路由");

    // const followerId = req.user.id; // Assumes have access to the currently logged-in user's ID
    const Subscriber_ID = res.locals.user.User_ID; 
    const authorID = req.params.User_ID;

    try {
        await marieUserDao.followUser(Subscriber_ID, authorID);
        console.log("follow成功,成功写入数据库");
        res.sendStatus(200); 
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route handler for unfollowing function when clicking follow button at the visitor's my mage
router.post('/unfollow/:userId', addUserToLocals, async (req, res) => {
    console.log("entering //unfollow/:userId...");
    
    // const followerId = req.user.id; // Assumes have access to the currently logged-in user's ID
    const Subscriber_ID = res.locals.user.User_ID;
    const { userId } = req.params;

    try {
        await marieUserDao.unfollowUser(Subscriber_ID, userId);
        console.log("unfollow成功,成功移除数据库");
        res.sendStatus(200); 
    } catch (error) {
        res.status(500).send(error);
    }
});






// Route handler for rendering the edit account page
router.get("/edit-account/:User_ID", addUserToLocals, async function(req, res) {
    console.log("entering /edit-account...");
    res.locals.title = "Edit Account";
  
    try {
      // Retrieve the user profile data
      const userID = req.params.User_ID; 
      const userProfile = await marieUserDao.getUserProfile(userID);
  
      // Render the edit account page template and pass the user profile data
      res.render('edit_account', {
        userProfile: userProfile.user
      });
    } catch (error) {
      console.error('Error in /edit-account route:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Route handler for rendering the edit account page
  router.post("/edit_account/:User_ID", async function (req, res) {
    console.log("entering post /edit_account...");
    console.log("req.body: ", req.body);
    const userID = req.params.User_ID;
    const saltRounds = 10;
    
    try {
        let user = await userDao.retrieveUserById(userID);
        let userUsernameArray = await userDao.retrieveAllUsername();
        console.log("userUsernameArray: ", userUsernameArray);
        console.log("username we input: ", req.body.username);
        console.log("user's avatar: ", user.Avatar);
        let updatedUser = {User_ID: userID};
        let isUpdated = false;
        let isUsernameTaken = false;
    
        if (req.body.username && user.Username !== req.body.username && req.body.username.length >= 3 && req.body.username.length <= 10) {
            updatedUser.Username = req.body.username;
            isUpdated = true;
        }
    
        if (req.body.Brief_Description && user.Brief_Description !== req.body.Brief_Description && req.body.Brief_Description.length >= 1 && req.body.Brief_Description.length <= 30) {
            updatedUser.Brief_Description = req.body.Brief_Description;
            isUpdated = true;
        }

        if (req.body.password && req.body.password.length >= 5 && req.body.password === req.body.repassword) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            updatedUser.Password = hashedPassword;
            isUpdated = true;
        } else if (req.body.password !== req.body.repassword) {
            throw new Error('The passwords entered twice are inconsistent');
        }

        if (req.body.birthdate && user.Date_Of_Birth !== req.body.birthdate) {
            updatedUser.Date_Of_Birth = req.body.birthdate;
            isUpdated = true;
        }

        if (req.body.idname && user.Real_Name !== req.body.idname) {
            updatedUser.Real_Name = req.body.idname;
            isUpdated = true;
        }

        if (req.body.icon && (user.Avatar !== req.body.icon)) {
            updatedUser.Avatar = req.body.icon;
            isUpdated = true;
        }else{
            console.log("No changes made to the avatar");
            console.log("user.Avatar2: ", user.Avatar);
            updatedUser.Avatar = user.Avatar;
            isUpdated = true;
        }

        if(!userUsernameArray.some(obj => obj.Username === req.body.username) || req.body.username == user.Username){
            updatedUser.Avatar = req.body.icon;
            isUsernameTaken = false;
            isUpdated = true;
            console.log("Username is not taken");
        }else{
            console.log("Username is already taken!");
            isUsernameTaken = true;
            isUpdated = false;
        }
        

        // Only run the update if there are changes
        if (isUpdated || !isUsernameTaken) {
            console.log("updatedUser后期: ", updatedUser);
            if(updatedUser.Avatar == ""){
                console.log("updatedUser.Avatar是空: ", updatedUser.Avatar);
                updatedUser.Avatar = user.Avatar;
            }
            console.log("updatedUser.Avatar大后期: ", updatedUser.Avatar);
            await userDao.updateUser(updatedUser);
            res.setToastMessage("User was successfully updated");
            res.redirect("/profile/" + userID);
        } else if(isUsernameTaken) {
            res.setToastMessage("The Username has been taken");
            res.redirect(`/edit-account/${userID}?`);
        } else {
            res.setToastMessage("No changes made");
            res.redirect("/profile/" + userID);
        }
        
    } catch (err) {
        console.error(err);
        res.setToastMessage(err.message);
        res.render("edit_account", { toastMessage: err.message });
    }
  });



  //新内容，删除文章路由
router.get("/delete-article/:Article_Id", addUserToLocals,  async function (req, res) {
    console.log("进入删除文章路由");
    const articleId = req.params.Article_Id;
    const article = await articleDao.getArticleByArticleID(articleId);
    const authorID = article.User_ID;
    const User_ID = res.locals.user.User_ID;
    if(User_ID == authorID) {
        //在删除文章之前，先删除评论，点赞，如果天乐更新了数据库加了通知和文章的联系，那也需要删除通知
        await likeDao.deleteAllLikesForOneArticle(articleId);
        console.log("删除文章所有点赞");
        await commentDao.removeArticlesAllComments(articleId);
        console.log("删除文章所有评论");
        await commentDao.removeArticlesAllNotifications(articleId);
        console.log("删除文章所有通知");
        await articleDao.deleteArticle(articleId);
        console.log("删除文章");
        res.redirect("/profile/" + User_ID);
    }else{
        res.setToastMessage("You can only delete your own article");
        res.redirect("/profile/" + User_ID);
    }
});

// Register the helper
Handlebars.registerHelper('addOne', function(number) {
    return number + 1;
});

// Route handler for analytics dashboard 
router.get("/analytics", addUserToLocals, async (req, res) => {
    console.log("entering /analytics...");
    if(res.locals.user){
        try {
            const userId = res.locals.user.User_ID; // replace with actual user id
            const followersCount = await analyticsDao.getFollowersCount(userId);
            const commentsCount = await analyticsDao.getCommentsCount(userId);
            console.log("commentsCount: ", commentsCount);
            
            const likesCount = await analyticsDao.getLikesCount(userId);
            const topArticles = await analyticsDao.getTopArticles(userId);
            const histogramData = await analyticsDao.getCommentsPerDay(userId);

            res.locals.title = "Analytics Dashboard";
            res.render('analytics', {
                totalFollowers: followersCount,
                totalComments: commentsCount,
                totalLikes: likesCount,
                articles: topArticles,
                histogramData: histogramData
            });        
            
        } catch (error) {
            console.error(`Error occurred: ${error}`);
            res.status(500).send('Internal server error');
        }
    }else{
        res.redirect("/");
    }
});



// Get Top Three Articles
router.get('/api/top-articles', addUserToLocals, async (req, res) => {
console.log("entering /api/top-articles...");
if(res.locals.user){
    const user_id = res.locals.user.User_ID; //only for testing
    try {
        const topArticles = await analyticsDao.getTopArticles(user_id);
        res.json(topArticles);
    } catch (error) {
        console.error('Error in /api/top-articles endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve top articles' });
    }
}else{
    res.redirect("/");
}
});


// Route handler for rendering the edit account page
// router.get("/edit-account", async function(req, res) {
//     console.log("entering /edit-account...");
//     res.locals.title = "Edit Account";
  
//     try {
//       // Retrieve the user profile data
//       const userID = 1; // Testing with the actual user ID
//       const userProfile = await userDao.getUserProfile(userID);
  
//       // Render the edit account page template and pass the user profile data
//       res.render('edit_account', {
//         userProfile: userProfile.user
//       });
//     } catch (error) {
//       console.error('Error in /edit-account route:', error);
//       res.status(500).send('Internal Server Error');
//     }
//   });

// router.post("/edit_account", async function (req, res) {
//     console.log("entering /edit_account...");
//     res.locals.title = "Edit Account";

//     try {
//       // Retrieve the form data
//       const userProfileData = {
//         username: req.body.username,
//         description: req.body.Brief_Description,
//         password: req.body.password,
//         birthdate: req.body.birthdate,
//         idname: req.body.idname,
//         icon: req.body.icon,
//       };
  
//       // Update the user profile
//       await userDao.updateUserProfile(1, userProfileData); // Assuming the user ID is 1 for testing purposes
//       console.log('User Profile Data:', userProfileData);
  
//       res.setToastMessage("User profile updated successfully");
//       res.redirect("/profile");
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       res.setToastMessage("Failed to update user profile");
//       res.redirect("/profile");
//     }
//   });

// router.post("/edit_account", async function(req, res) {
//     const userID = 1; // test with the actual user ID

//     // Retrieve the updated user profile data from the form
//     const updatedProfile = {
//         id: userID,
//         username: req.body.username,
//         description: req.body.description,
//         confirmpassword: req.body.confirmpassword,
//         password: req.body.password,
//         birthdate: req.body.birthdate,
//         idname: req.body.idname,
//         icon: req.body.icon
//     };

//     // Update the user profile in the database
//     try {
//         await userDao.updateUserProfile(updatedProfile);
//         res.setToastMessage("User profile updated successfully!");
//         res.redirect("/profile");
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



// Route handler for histogram
router.get('/comments-per-day', addUserToLocals, async (req, res) => {
    console.log("entering /comments-per-day...");
    if(res.locals.user){
        const userId = res.locals.user.User_ID; // User ID for testing only
        const rows = await analyticsDao.getCommentsPerDay(userId);

        const labels = rows.map(row => row.Day);
        const data = rows.map(row => row.Count);

        res.json({ labels, data });
    }else{
        res.redirect("/");
    }
});


  module.exports = router;