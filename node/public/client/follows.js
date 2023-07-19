window.addEventListener('load', async function() {
    console.log('subscription Window loaded.');
    //get local user info
    const response1 = await fetch("/user_info");
    const user_info = await response1.json();
    const User_ID = user_info.User_ID;
    //check if the user has logged in 判断用户是否登录，如果登录，显示导航条上的部分内容
    const homeBtn = document.querySelector("#home");
    const signInBtn = document.querySelector("#sign-in");
    const notificationBtn = document.querySelector("#notification");
    const profileBtn = document.querySelector("#profile");
    const createArticleBtn = document.querySelector("#create-article");
    const logoutBtn = document.querySelector("#log-out");
    const followButton = document.querySelectorAll(".follow-button");
    const fansDisplayBar = document.querySelectorAll(".fansDisplayBar");
    const MUSE = document.querySelector("#MUSE");
  
    //when click the MUSE logo, it will go to the home page
    MUSE.addEventListener("click", function () {
      window.location.href = "/home/1/publishTime";
    });

    if(User_ID){
        
        signInBtn.style.display = "none";
        profileBtn.style.display = "block";
        createArticleBtn.style.display = "block";
        logoutBtn.style.display = "block";
        notificationBtn.style.display = "block";

    }else if(User_ID == null){
    
        signInBtn.style.display = "block";
        profileBtn.style.display = "none";
        createArticleBtn.style.display = "none";
        logoutBtn.style.display = "none";
        notificationBtn.style.display = "none";
        
        
    }
    
    //when the cursor is on notification button, show notifications 当鼠标移动到notificaiton按钮时，显示通知
    const newContent = document.querySelector("#icon-container");
    const notifications = document.querySelectorAll(".notifications");
    // const redDot = document.querySelectorAll(".red-dot");
      
    if(User_ID){
        notificationBtn.addEventListener("mouseover", function () {

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
          const notificationMore = document.querySelector("#notificationMore");
          
          notificationMore.addEventListener("click", function () {
            console.log("notificationMore clicked");
            window.location.href =  `/notification/${User_ID}`;
          });
    }
   
    for(let i = 0; i < followButton.length; i++){
      followButton[i].addEventListener('click', async () => {
          let userId = followButton[i].dataset.userId;
          console.log('客户端Follow Button clicked - User ID:', userId);
          // 切换关注状态Toggle the follow button
          // toggleFollow(userId);
          await fetch(`/unfollow/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          window.location.reload();
      });
    }
   
//  //Page functions start here
//  const pages = document.querySelectorAll(".pages");
//  const previousPage = document.querySelector("#left");
//  const nextPage = document.querySelector("#right");
//  const path = window.location.pathname;
//  const regex = /\/followsList\/(\w+)/;

//  let userCurrentPage = "";
//  let userMatches = "";
//  let userPurple = undefined;


//    userMatches = path.match(regex);
//    userCurrentPage = userMatches[1];
//    console.log("userCurrentPage是: " + userCurrentPage);
//    userPurple = document.querySelector(`#page${userCurrentPage}`);
//    userPurple.style.color = "#7949ff";
//    userPurple.style.backgroundColor = "#e9e1ff";
//    const userNextPage = parseInt(userCurrentPage) + 1;
//    const userPreviousPage = parseInt(userCurrentPage) - 1;


//  previousPage.addEventListener("click", function () {
//      if (parseInt(userCurrentPage) != 1) {
//        window.location.href = `/followsList/${userPreviousPage}`;
//      }  
//  });

//  nextPage.addEventListener("click", async function () {
//      if (parseInt(userCurrentPage) < pages.length) {
//        window.location.href = `/followsList/${userNextPage}`;
//      }
//  });
// //处理页码跳转
//  let pageThis = null;
//  for (let i = 0; i < pages.length; i++) {
//    pages[i].addEventListener("click", function () {
//        const toPage = pages[i].innerHTML;
//        window.location.href = `/followsList/${toPage}`;
//        pageThis = document.querySelector(`#${pages[i].id}`);
    
//    });

  
//      if (parseInt(pages[i].innerHTML) === parseInt(userCurrentPage)) {
//        const thisPageId = pages[i].id;
//        const pageThis = document.querySelector(`#${thisPageId}`);
//      }
  
//  }
//  //Page function end here

});

function toggleFollow(userId) {
 
  const followButton = document.querySelector('.follow-button');
  const isFollowing = followButton.classList.contains('unfollow');
  const followersCount = document.querySelector('#followslink');
  console.log('Is Following:', isFollowing);

  if (isFollowing) {
    console.log('Unfollow logic');
    unfollowUser(userId)
        .then(() => {
            console.log('Unfollow successful');
            followButton.classList.remove('unfollow');
            followButton.innerText = 'Follow';
            //Decrease followers count 
            followersCount.innerText = Number(followersCount.innerText) - 1;
             // Show alert message for unfollow
            alert('You have unfollowed the user');
        })
        .catch((error) => {
            console.error('Error unfollowing user:', error);
        });

        

  } else {
    console.log('Follow logic');
    console.log('客户端following - User ID:', userId);
    followUser(userId)
        .then(() => {
            console.log('Follow successful');
            followButton.classList.add('unfollow');
            followButton.innerText = 'Unfollow';

            //increase the follower count
            followersCount.innerText = Number(followersCount.innerText) + 1;

        })
        .catch((error) => {
            console.error('Error following user:', error);
        });
  }
}


function followUser(userId) {
  // Implement the logic to send a request to the server to add the subscription
  console.log('客户端FollowUser方法 - User ID:', userId);
  return fetch(`/follow/${userId}`, { method: 'POST' })
      .then((response) => {
          if (!response.ok) {
              throw new Error(response.statusText);
          }
      });
}

function unfollowUser(userId) {
  // Implement the logic to send a request to the server to remove the subscription
  console.log('Unfollow User - User ID:', userId);
  return fetch(`/unfollow/${userId}`, { method: 'POST' })
      .then((response) => {
          if (!response.ok) {
              throw new Error(response.statusText);
          }
      });
}
