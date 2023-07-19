const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();
const notificationDao = require("../modules/notification-dao.js");
const subscriberDao = require("../modules/subscribers-dao.js");
const sarahNotificationDao = require("../modules/sarah-notifications-dao.js");
const { addUserToLocals } = require("../middleware/auth-middleware.js");


router.get("/subscribersList/:page", addUserToLocals, async function (req, res) {
    // //get notification unread number渲染出未读通知数量
    // const allNotifications = await notificationDao.getAllNotificationByUserID(res.locals.user.User_ID);
    // res.locals.unReadComment = allNotifications.length;
    const page = parseInt(req.params.page);
    const startIndex = (page - 1) * 15;
    const endIndex = startIndex + 15;
    if(res.locals.user){

        const User_ID = res.locals.user.User_ID;
        console.log("进入okokokokoko" + User_ID + "路由");
        const subscribersList = await subscriberDao.getSubscribersById(User_ID);
        
         //分页
         const slicedSubscribersList = subscribersList.slice(startIndex, endIndex);
  
         const totalPages = parseInt(subscribersList.length / 15) + 1;
   
        //  let pageBar = [];
        //  if (totalPages <= 3) {
        //      for (let i = 1; i <= totalPages; i++) {
        //      pageBar.push(i);
        //      }
        //  } else if (totalPages > 3 && page + 2 <= totalPages) {
        //      for (let i = 1; i < totalPages; i++) {
        //      if (
        //          i == page - 2 ||
        //          i == page - 1 ||
        //          i == page ||
        //          i == page + 1 ||
        //          i == page + 2
        //      ) {
        //          pageBar.push(i);
        //      }
        //      }
        //  }
        let pageBar = [];

if (totalPages <= 5) {
  // If there are 5 or less pages, just show all pages.
  for (let i = 1; i <= totalPages; i++) {
    pageBar.push(i);
  }
} else {
  // If there are more than 5 pages, we need to decide what to show.
  
  // Determine the start of the range:
  let startPage = Math.max(1, page - 2);
  
  // Adjust startPage if we are near the end:
  startPage = Math.min(startPage, totalPages - 4);

  // Now we add 5 pages to the page bar, from startPage to startPage + 4:
  for (let i = 0; i < 5; i++) {
    pageBar.push(startPage + i);
  }
}

     
         res.locals.pages = pageBar;
         res.locals.slicedSubscribersList = slicedSubscribersList;
        res.locals.subscribersList = subscribersList;

          // get at most 3 notifications for the user
 
          const notifications = await sarahNotificationDao.getThreeNotifications(res.locals.user.User_ID);  
          for (let i = 0; i < notifications.length; i++) {
          notifications[i].userInformation =
              await sarahNotificationDao.getSenderByNotificationID(notifications[i].Notification_ID);
          }
  
              //get unread notifications count
          const unreadNotificationsCount = await sarahNotificationDao.getUnreadNotificationCountByUserID(res.locals.user.User_ID);
          res.locals.unreadNotificationsCount = unreadNotificationsCount;
          //check if there is unread notifications
          if(unreadNotificationsCount.count > 0){
            console.log("has unread notifications");
            res.locals.hasUnreadNotifications = true;
            }
          res.locals.notifications = notifications;
        res.render("subscribersList");
       
    }else{
        res.redirect("/");
    }
});





module.exports = router;