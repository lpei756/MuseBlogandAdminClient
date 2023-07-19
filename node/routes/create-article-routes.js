const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();

const articleDao = require("../modules/article-dao.js");
const createArticleDao = require("../modules/create-article-dao.js");
const sarahNotificationDao = require("../modules/sarah-notifications-dao.js");
const notificationDao = require("../modules/notification-dao.js");
// const newArticleNotificationDao = require('../modules/notification-new-article-dao.js');

const { addUserToLocals } = require("../middleware/auth-middleware.js");
const { getFollowersByUserID } = require("../modules/create-article-dao.js");

const upload = require("../middleware/multer-uploader.js"); // 导入 multer 上传中间件
const fs = require("fs");
const path = require("path");


router.get("/create_article", addUserToLocals, async function (req, res) {
  console.log("enter create_article");


   // get at most Three Notifications
   if(res.locals.user){
    const notifications = await sarahNotificationDao.getThreeNotifications(res.locals.user.User_ID);  
    for (let i = 0; i < notifications.length; i++) {
    notifications[i].userInformation =
        await sarahNotificationDao.getSenderByNotificationID(notifications[i].Notification_ID);
    }
      //get unread notifications count
      const unreadNotificationsCount = await sarahNotificationDao.getUnreadNotificationCountByUserID(res.locals.user.User_ID);
      res.locals.unreadNotificationsCount = unreadNotificationsCount;
   //check if there are unread notifications
   if(unreadNotificationsCount.count > 0){
    console.log("has unread notifications");
    res.locals.hasUnreadNotifications = true;
    }
    res.locals.notifications = notifications;
  }else{
    res.redirect("/user_login");
  }

  res.render("create_article");
});

router.post("/createArticle/:User_ID", addUserToLocals, upload.single("imageFile"), async function (req, res) {
    console.log("enter createArticle");
    const userID = req.params.User_ID;
    const fileInfo = req.file;
    let imageName = ""; // default value for Image property
  
    // if there is a file uploaded, rename it and get the new file name
    if(fileInfo){
    console.log("fileInfo: ", fileInfo);
    const oldFileName = fileInfo.path;
    const newFileName = `./public/uploadedFiles/${fileInfo.originalname}`;
    fs.renameSync(oldFileName, newFileName);
    console.log("fileInfo.originalname: ", fileInfo.originalname);
    console.log("oldFileName: ", oldFileName);
    console.log("newFileName: ", newFileName);
    imageName = fileInfo.originalname; 
  }
    const article = {
      Title: req.body.title,
      Content: req.body.content,
      Image: imageName, 
      Likes_Count: 0,
      User_ID: userID,
    };

    res.locals.fileName = imageName;
    

    //if the title or content is empty, return error message
  if (article.Title.trim().length == 0 || article.Content.trim().length == 0) {
      // res.setToastMessage("Title and content cannot be empty!");
      res.json({ success: false, message: 'Title and content cannot be empty!' });
    } else {
      
      await createArticleDao.createArticle(article);

      //add notification to all followers
      const authorUserName = await articleDao.getAuthorNameByArticleID(article.Article_ID);
      console.log("authorUserName: ", authorUserName);
      const followers = await getFollowersByUserID(article.User_ID);
      for (const follower of followers) {
        const notification = {
          Content: `Your subscribed author ${authorUserName.Username} has a new article posted!`,
          Is_Read: true,
          Sender_ID: article.User_ID,
          Receiver_ID: follower, 
          NotificationType: "article_posted",
          Article_ID: article.Article_ID,
        };
        await createArticleDao.createNotificationWhenPublishNewArticle(notification);
      }

      // res.redirect("/");
      res.json({ success: true });
    }
  }
);

router.get("/directToArticlePageAfterPublish", addUserToLocals, async function (req, res) {
  console.log("enter directToArticlePageAfterPublish");
  if(res.locals.user){
    const latestArticle = await createArticleDao.getLatestArticleByUserID(res.locals.user.User_ID);
    // const articleID = latestArticle.Article_ID;
    res.json(latestArticle);
  }else{
    res.redirect("/user_login");
  }
});

module.exports = router;
