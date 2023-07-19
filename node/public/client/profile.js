window.addEventListener('load', async function() {
    console.log('profile Window loaded.');
    //get local user info
    console.log('准备进入/user_info 路由');
    const response1 = await fetch("/user_info");
    const user_info = await response1.json();
    const User_ID = user_info.User_ID;
    console.log('User_info得出User_ID: ', User_ID);
    //check user login status判断用户是否登录，如果登录，显示导航条上的部分内容
    const homeBtn = document.querySelector("#home");
    const signInBtn = document.querySelector("#sign-in");
    const notificationBtn = document.querySelector("#notification");
    const profileBtn = document.querySelector("#profile");
    const createArticleBtn = document.querySelector("#create-article");
    const logoutBtn = document.querySelector("#log-out");
    const followButton = document.querySelector('.follow-button');
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
        followButton.style.display = "none";
        
    }
    //check if the user is the owner of the profile 判断是否是当前用户的profile，如果是，隐藏follow按钮
    const currentURL = window.location.href;
    const parsedUrl = new URL(currentURL);
    const profileID = parsedUrl.pathname.split('/').pop();
    
    const userFollowsDiv = document.querySelector('.user-follows');
    if(User_ID != profileID){
      //show the status of follow button 显示follow按钮的状态
      console.log("准备进入checkIsFollowing路由");
      const response6 = await fetch(`/checkIsFollowing/${profileID}`);
      const isFollowing = await response6.json();
      console.log('checkisfollow路由得出isfollowing是: ', isFollowing);
      if(isFollowing.isFollowing == true){
        followButton.innerHTML = "Unfollow";
        followButton.classList.remove('follow');
        followButton.classList.add('unfollow');
      }else{
        followButton.innerHTML = "Follow";
        followButton.classList.remove('unfollow');
        followButton.classList.add('follow');

      }

      console.log('User_ID:和profileID不相等', User_ID);
      followButton.addEventListener('click', () => {
          let userId = followButton.dataset.userId;
          console.log('客户端Follow Button clicked - User ID:', userId);
          // 切换关注状态Toggle the follow button
          toggleFollow(userId);
      });
    }else{
      console.log('User_ID:和profileID相等', User_ID);
      userFollowsDiv.style.display = "none";
    }
    //check if the local user the is the profile owner, if yes, stop jumpping when click 
    //the followList link and subscribersList link
    //判断当前用户是否是当前页面的用户，如果不是，阻止超链接跳转
    const followslink = document.querySelector("#followslink");
    const followerslink = document.querySelector("#followerslink");
    if(User_ID != profileID || User_ID == null){
      console.log('User_ID:和profileID不相等', User_ID);
      followslink.addEventListener("click", function (event) {
        event.preventDefault();
      });
      followerslink.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }

   //when the cursor is on notification button, show notifications当鼠标移动到notificaiton按钮时，显示通知
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
          //click notifications to redirect点击notification，跳转到对应的文章
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
            window.location.href =  `/notification/${User_ID}/1`;
          });
    }

  //When click delete article button, show the comfirm window 当点击删除文章按钮时，出现确认删除的弹窗
  const deleteArticleButton = document.querySelectorAll(".delete-button");
  const deleteArticleWindow = document.querySelectorAll(".deleteArticleWindow");
  const deleteArticleYesButton = document.querySelectorAll(".yesDeleteArticle");
  const deleteArticleNoButton = document.querySelectorAll(".noDeleteArticle");
 
  // loop through all delete button 遍历删除按钮，添加监听事件，一点击就会弹出弹窗
   for (let i = 0; i < deleteArticleButton.length; i++) {
    deleteArticleButton[i].addEventListener("click", function () {
       deleteArticleWindow[i].style.display = "flex";
     });
   }
   
   //loop through all yes button 遍历所有yes button,用户选择yes之后数据库删除文章，所有弹窗消失
   for (let i = 0; i < deleteArticleYesButton.length; i++) {
     const substring = deleteArticleYesButton[i].id.substring(3);
     deleteArticleYesButton[i].addEventListener("click", async function () {
       deleteArticleWindow[i].style.display = "none";
       window.location.href = `/delete-article/${substring}`;
     });
   }
   //loop through all no button 遍历所有no button,如果用户点击这个按钮，弹窗直接消失
   for (let i = 0; i < deleteArticleNoButton.length; i++) {
    deleteArticleNoButton[i].addEventListener("click", function () {
      console.log("no button clicked");
       deleteArticleWindow[i].style.display = "none";
     });
   }
});


async function toggleFollow(userId) {
 
  const followButton = document.querySelector('.follow-button');
  // const isFollowing = followButton.classList.contains('unfollow');
  const response6 = await fetch(`/checkIsFollowing/${userId}`);
  const isFollowing = await response6.json();
  console.log('Is Following:', isFollowing);

  if (isFollowing.isFollowing == true) {
    console.log('Unfollow logic');
    unfollowUser(userId)
        .then(() => {
            console.log('Unfollow successful');
            followButton.classList.remove('unfollow');
            followButton.innerText = 'Follow';
        })
        .catch((error) => {
            console.error('Error unfollowing user:', error);
        });

         // Show alert message for unfollow
         alert('You have unfollowed the user');

  } else if(isFollowing.isFollowing == false){
    console.log('Follow logic');
    console.log('客户端following - User ID:', userId);
    followUser(userId)
        .then(() => {
            console.log('Follow successful');
            followButton.classList.add('unfollow');
            followButton.innerText = 'Unfollow';
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
