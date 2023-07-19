window.addEventListener('load', async function() {
    console.log('editaccount Window loaded.');
    //获取当前用户信息
    const response1 = await fetch("/user_info");
    const user_info = await response1.json();
    const User_ID = user_info.User_ID;

    // Get a reference to the icon container div
    const iconBox = document.querySelector('.iconbox');
    const icon = document.querySelectorAll('.icon');
    console.log('iconbox:', iconBox);
  
    // Set up a click event listener on the icon container
    if(iconBox) {
    iconBox.addEventListener('click', function(e) {
      for(let i = 0; i < icon.length; i++) {
        icon[i].style.border = "none";
      }
      console.log('iconbox clicked.');
      // If an icon div was clicked...
      if (e.target && e.target.matches('div[data-icon]')) {
        console.log('Icon div clicked:', e.target);
        e.target.style.border = "3px solid red";
        // ...set the value of the hidden icon input field to the data-icon attribute of the clicked div
        var iconInput = document.querySelector('#icon');
        iconInput.value = e.target.getAttribute('data-icon');
  
        console.log('Icon input value set:', iconInput.value);
  
        // Show alert message for avatar click
        // alert('New Avatar is selected!');
      }
    });
  }
  
    // Get a reference to the submit button
    const submitButton = document.querySelector('.submitbtn');
  
    // Set up a click event listener on the submit button
    if(submitButton) {
    submitButton.addEventListener('click', function() {
      // Show alert message for submit button click
      // alert('User Profile is updated!');
    });
  };

  //get delete account button
  const deleteAccountButton = document.querySelector("#deleteBtn");
  const deleteAccountWindow = document.querySelector(".deleteAccountWindow");
  const deleteAccountYesButton = document.querySelector(".yesDeleteAccount");
  const deleteAccountNoButton = document.querySelector(".noDeleteAccount");

 // addeventlistner to delete button 添加监听事件，一点击就会弹出弹窗

    deleteAccountButton.addEventListener("click", function () {
      console.log("deleteAccountButton clicked");
      deleteAccountWindow.style.display = "flex";
      
    });
    //if click yes button, delete the account
    const substring = deleteAccountYesButton.id.substring(3);
    console.log(substring + "substring的值");
    deleteAccountYesButton.addEventListener("click", async function () {
      console.log("deleteAccountYesButton clicked");
      deleteAccountWindow.style.display = "none";
      window.location.href = `/delete-account/${substring}`;
    });
  
  //loop through all no button 遍历所有no button,如果用户点击这个按钮，弹窗直接消失
 
  deleteAccountNoButton.addEventListener("click", function () {
    console.log("deleteAccountNoButton clicked");
      deleteAccountWindow.style.display = "none";
    });

});
