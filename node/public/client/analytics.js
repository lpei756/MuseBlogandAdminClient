// For total's
window.onload = async function() {
    console.log('analytics.js loaded');
    // Fetch user ID from the user profile (replace this with your code to fetch the user ID dynamically)
    // const userId = 1; // Replace getCurrentUserId() with your code to get the current user's ID
    //获取当前用户信息
    const response1 = await fetch("/user_info");
    const user_info = await response1.json();
    const userId = user_info.User_ID;
    console.log('Analytics userId:', userId);
    // Fetch total followers
    $.get(`/api/total-followers/${userId}`, function (data) {
        $('#total-followers').text(`Total Followers: ${data.followersCount}`);
    });

    // Fetch total comments
    $.get(`/api/total-comments/${userId}`, function (data) {
        $('#total-comments').text(`Total Comments: ${data.commentsCount}`);
    });

    // Fetch total likes
    $.get(`/api/total-likes/${userId}`, function (data) {
        $('#total-likes').text(`Total Likes: ${data.likesCount}`);
    });

 
}

