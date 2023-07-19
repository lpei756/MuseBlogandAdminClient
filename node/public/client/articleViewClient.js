console.log("reply client js...");
window.addEventListener("load", async function() {
    // get login status
    const response = await fetch("/user_login_status");
    const loginStatus = await response.json();
    console.log("loginStatus: " + loginStatus);
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
    
    // const replyRemoveDiv = document.querySelectorAll(".reply-remove-div");
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
    // set ql-editor's ediable to false 将ql-editor的样式设为不可编辑
    if(this.document.querySelector(".ql-editor") != undefined){
        const editor = document.querySelector(".ql-editor");
        editor.setAttribute("contenteditable", false);
    }
    
    

    // get article id 获取文章id
    var currentURL = window.location.href;
    const parsedUrl = new URL(currentURL);
    const articleId = parsedUrl.pathname.split('/').pop();
    console.log("articleId: " + articleId);
    // get article comments 展示文章所有评论
    const response2 = await fetch(`/showComments?Article_ID=${articleId}`);
    const comments = await response2.json();
    
    const renderedComments = [];
    //get top level comments 获取顶级评论
    const topLevelComments = comments.filter(comment => comment.Parent_Comment_ID == null);
    //get sub comments 获取子评论
    topLevelComments.forEach(comment => {
        comment.subComment = getSubComments(comment.Comment_ID);
        renderedComments.push(comment);
    });
 
    const commentArea = document.querySelector(".comment");
    const commentDisplay = renderComments(renderedComments, 0);
    commentArea.innerHTML = commentDisplay;
    //show reply div when click reply button 点击reply触发弹窗
    const reply = document.querySelectorAll(".reply");
    const replyDiv = document.querySelectorAll(".reply-text-div");
    for(let i = 0; i < reply.length; i++){
        reply[i].style.cursor = "pointer";
        reply[i].addEventListener("click", function(){
            if(replyDiv[i].style.display == "none"){
            console.log("reply clicked...");
            replyDiv[i].style.display = "block";
            }else{
                replyDiv[i].style.display = "none";
            }
        });
    }
    //check user's identity to decide whether to show delete button and edit button
    //判断用户身份,如果是作者本人或者评论者本人，显示删除按钮
    //如果用户是visitor，不显示回复按钮
    //如果用户是本人，显示edit按钮
    const editArticle = document.querySelector("#editArticle");
    const replyDivBtn = document.querySelectorAll(".replydivbtn");
    
    const response3 = await fetch(`/is_article_author/${articleId}`) ;
    const isAuthor = await response3.json();

    const MUSE = document.querySelector("#MUSE");
  
    //when click the MUSE logo, it will go to the home page
    MUSE.addEventListener("click", function () {
        window.location.href = "/home/1/publishTime";
    });
   
    const removeDiv = document.querySelectorAll(".removediv");
    if(User_ID){
        if(isAuthor.isAuthor === true){
            console.log("是作者本人");
            editArticle.style.display = "block";
            editArticle.addEventListener("click", function(){
                window.location.href = `/editArticle/${articleId}`;
            });
            for(let i = 0; i < removeDiv.length; i++){
                removeDiv[i].style.display = "block";
            }
        }else{
            for(let i = 0; i < removeDiv.length; i++){
                if(removeDiv[i].getAttribute("id") == User_ID){
                    console.log("不是作者，是评论者本人");
                    removeDiv[i].style.display = "block";
                }else{
                    console.log("不是作者，不是评论者本人");
                    removeDiv[i].style.display = "none";
                }
            }
        }
    }else{
        for(let i = 0; i < replyDivBtn.length; i++){
            replyDivBtn[i].style.display = "none";
            
        }
        for(let i = 0; i < removeDiv.length; i++){
            removeDiv[i].style.display = "none";
            
        }       
    }
    
    //when cursor is on notification button, show the notifications 当鼠标移动到notificaiton按钮时，显示通知
    const newContent = document.querySelector("#icon-container");
    const notifications = document.querySelectorAll(".notifications");
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
          
        // const response4 = await fetch(`/notification-list/${User_ID}`);
        // const notificationList = await response4.json();
        // console.log("notificationList: ", notificationList);
        // notificationpanel.innerHTML += `<ul>`;
        // for(let i = 0; i < 3; i++){
        //     // console.log("notificationList[i].NotificationType: ", notificationList[i].NotificationType);
        //     if(notificationList[i].NotificationType == "Comment" || notificationList[i].NotificationType == "Reply"){
        //         if(notificationList[i].Is_Read == 0){
        //         notificationpanel.innerHTML += `
        //             <li class="notification-item"><strong>${notificationList[i].Content}<strong></li>
        //         `;
        //         }else{
        //             notificationpanel.innerHTML += `
        //             <li class="notification-item">${notificationList[i].Content}</li>
        //         `;
        //         }
        //     }
        // }
        // notificationpanel.innerHTML += `
        // </ul>
        // <a href="/notifications">More...</a>
        // `;
    }
    





    function getSubComments(parentCommentId){
        const parentComment = comments.find(comment => comment.Comment_ID == parentCommentId);
        const subComments = comments.filter(comment => comment.Parent_Comment_ID == parentCommentId);
        subComments.forEach(comment => {
        comment.subComment = getSubComments(comment.Comment_ID);
        comment.parentCommenterUsername = parentComment.Commenter_Username;
        });
        return subComments;
    }
    function renderComments(comments, n){
        let commentDisplay = "";
        if(n > 0){
           n = 1;
        }
        comments.forEach(comment => {
            commentDisplay += `
            <div class="comment-display${n}">
                <div class="commenterinfo">
                    <img src="/images/${comment.Commenter_Avatar}" alt="avatar" class="avatar">
                    <div class="commentername"><a href="/profile/${comment.User_ID}">${comment.Commenter_Username}</a>
                    `;
                    if (comment.parentCommenterUsername) {
                        commentDisplay += `<span class="reply-to">  reply to ${comment.parentCommenterUsername}</span>`;
                    }
                    commentDisplay += `</div>
                    <div class="commenttimestamp">${comment.Comment_Time}</div>
                </div>
                <div class="commenttext">${comment.Comment_Text}</div>
                <div class="reply-remove-div">
                    <div class="replydivbtn">
                        <img src="/images/comment.png" class="replyicon">
                        <span class="reply">Reply</span>
                    
                    </div>
                    <div id="${comment.User_ID}" class="removediv">
                        <img src="/images/deleteaccount.png" class="removeicon">
                        <a href="/removecomment/${comment.Comment_ID}" class="remove">Remove</a>
                    </div>
                </div>
                <div class="reply-text-div">
                    <form action="/reply/${comment.Article_ID}/${comment.Comment_ID}" method="POST">
                        <div>
                            <textarea rows="3" cols="30" name="reply" class="reply-textarea"></textarea>
                        </div>
                        <button type="submit" class="writereply">Reply</button>
                    </form>
                </div>
            `;
 
           
            if(comment.subComment){
                commentDisplay += renderComments(comment.subComment, n + 1);
            }
            commentDisplay += `</div>`;
        });
        return commentDisplay;
    }
    //hide comment panel function
    hideCommentPanel();
    //show toastmessage when click like button without login
    showToastMessage(loginStatus);
    //block comment area when not login
    blockCommentArea(loginStatus);

});

function showToastMessage(loginStatus){
    // 获取 toastMessage 元素
    if(loginStatus == "false"){
        const toastMessage = document.querySelector('.toastmessage');

        toastMessage.style.cursor = 'pointer';

        toastMessage.addEventListener("click", function(){
            toastMessage.style.display = 'none';
        });
    }
}

async function blockCommentArea(loginStatus){
    if(loginStatus == false){
        console.log("loginStatus是false，禁用评论区");
        const commentBtn = document.querySelector("#writecomment");
        commentBtn.disabled = true;
        commentBtn.style.cursor = "not-allowed";
        const textarea = document.querySelector(".comment-textarea");
        textarea.disabled = true;
        
    }else{
        console.log("loginStatus是true，启用评论区");
    }
}

async function isAuthor(articleId){
    const response = await fetch(`/is_article_author/${articleId}`) ;
    const isAuthor = await response.json();
    console.log("isAuthor是: ", isAuthor);
    if (isAuthor == true) {
        console.log("isAuthor is true");
        return true;
    }else{
        console.log("isAuthor is false");
        return false;
    }
    
}
function hideCommentPanel(){
    const commentPanel = document.querySelector("#commentpanel");
    const hideCommentBtn = document.querySelector("#hidecommentpanel");
    const container = document.querySelector("#container");
    hideCommentBtn.addEventListener("click", function(){
        if(hideCommentBtn.textContent == "Hide comments"){
        
            commentPanel.style.display = "none";
            hideCommentBtn.textContent = "Show comments";
            // articlePanel.style.width = "130%";
            container.style.gridTemplateColumns = "9fr 1fr";

        }else if(hideCommentBtn.textContent == "Show comments"){
        
            console.log("恢复评论区");
            commentPanel.style.display = "block";
            hideCommentBtn.textContent = "Hide comments";
            container.style.gridTemplateColumns = "7fr 3fr";
        }

    });
   
}

