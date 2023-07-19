console.log("createArticleClient.js loaded");
window.addEventListener("load", async function () {
    console.log("window loaded");
    
    const response1 = await fetch("/user_info");
    
    const user_info = await response1.json();
    const User_ID = user_info.User_ID;
    
    // const editor = document.querySelector("#editor");
    //  editor.setAttribute("contenteditable", true);
    
    const notificationBtn = document.querySelector("#notification");
    const newContent = document.querySelector("#icon-container");
    const notifications = document.querySelectorAll(".notifications");

    const MUSE = document.querySelector("#MUSE");
  
    //when click the MUSE logo, it will go to the home page
    MUSE.addEventListener("click", function () {
        window.location.href = "/home/1/publishTime";
    });

    if(User_ID){
        notificationBtn.addEventListener("mouseover", function () {
                console.log("notificationBtn mouseover");
                newContent.style.display = "flex";
        });
        newContent.addEventListener("mouseover", function () {
        
            newContent.style.display = "flex";
        });
        newContent.addEventListener("mouseout", function () {
        
            if(newContent.style.display === "flex"){
            newContent.style.display = "none";
            }
        });
        //点击notification，跳转到对应的文章
        for(let i = 0; i < notifications.length; i++){
            notifications[i].style.cursor = "pointer";
            notifications[i].addEventListener("click", async function () {
                console.log("notification clicked");
                let notificationID = notifications[i].getAttribute("id");      
                notificationID = notificationID.substring(13);
                
                const response5 = await fetch(`/notification_info/${notificationID}`);
                const notification_info = await response5.json();
                console.log("notification_info: ", notification_info);
                if(notification_info.NotificationType == "Comment" || notification_info.NotificationType == "Reply"){
                    const articleID = notification_info.Article_ID;
                    window.location.href =  `/articleView/${articleID}`;
                }else if(notification_info.NotificationType == "Follow"){
                    const profileID = notification_info.Sender_ID;
                    window.location.href =  `/profile/${profileID}`;
                }else if(notification_info.NotificationType == "article_posted"){
                    const articleID = notification_info.Article_ID;
                    window.location.href =  `/articleView/${articleID}`;
                }
            });
        }
        
        notificationMore.addEventListener("click", function () {
            console.log("notificationMore clicked!!!!!!");
            window.location.href =  `/notification/${User_ID}/1`;
        });
    }
});

