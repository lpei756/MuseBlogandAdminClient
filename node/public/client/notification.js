window.addEventListener("load", async function () {
    console.log("notification Window loaded.");
    //获取当前用户信息
    const response1 = await fetch("/user_info");
    const user_info = await response1.json();
    const User_ID = user_info.User_ID;

    const MUSE = document.querySelector("#MUSE");
  
    //when click the MUSE logo, it will go to the home page
    MUSE.addEventListener("click", function () {
      window.location.href = "/home/1/publishTime";
    });

    const notificationText = document.querySelectorAll(".text");
    for(let i = 0; i < notificationText.length; i++){
        notificationText[i].style.cursor = "pointer";
        const notificationID = notificationText[i].getAttribute("id");   
        const response5 = await fetch(`/getNotificationInfoOnly/${notificationID}`);
        const notification_details = await response5.json();
       if(notification_details.Is_Read == 0){
            console.log("notification is not read");
            notificationText[i].style.fontWeight = "bold";
            }
        notificationText[i].addEventListener("click", async function () {
          console.log("notification clicked");
          console.log("notificationID" + notificationID);
          const response5 = await fetch(`/notification_info/${notificationID}`);
          const notification_info = await response5.json();
       
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

    
  //Page functions start here
  const pages = document.querySelectorAll(".pages");
  const previousPage = document.querySelector("#left");
  const nextPage = document.querySelector("#right");
  const path = window.location.pathname;
  const regex = /\/notification\/(\w+)\/(\w+)/;

  let userCurrentPage = "";
  let userMatches = "";
  let userPurple = undefined;

 
    userMatches = path.match(regex);
    userCurrentPage = userMatches[2];
    console.log("userCurrentPage是: " + userCurrentPage);
    userPurple = document.querySelector(`#page${userCurrentPage}`);
    userPurple.style.color = "#7949ff";
    userPurple.style.backgroundColor = "#e9e1ff";
    const userNextPage = parseInt(userCurrentPage) + 1;
    const userPreviousPage = parseInt(userCurrentPage) - 1;


  previousPage.addEventListener("click", function () {
      if (parseInt(userCurrentPage) != 1) {
        window.location.href = `/notification/${User_ID}/${userPreviousPage}`;
      }  
  });

  nextPage.addEventListener("click", async function () {
      if (parseInt(userCurrentPage) < pages.length) {
        window.location.href = `/notification/${User_ID}/${userNextPage}`;
      }
  });
//处理页码跳转
  let pageThis = null;
  for (let i = 0; i < pages.length; i++) {
    pages[i].addEventListener("click", function () {
        const toPage = pages[i].innerHTML;
        window.location.href = `/notification/${User_ID}/${toPage}`;
        pageThis = document.querySelector(`#${pages[i].id}`);
     
    });

   
      if (parseInt(pages[i].innerHTML) === parseInt(userCurrentPage)) {
        const thisPageId = pages[i].id;
        const pageThis = document.querySelector(`#${thisPageId}`);
      }
   
  }
  //Page function end here

});