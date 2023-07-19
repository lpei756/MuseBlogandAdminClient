window.onload = function() {
    console.log('Window loaded.');
  
    // Get a reference to the icon container div
    var iconContainer = document.querySelector('.iconcontainer');
    console.log('Icon container:', iconContainer);
  
    // Set up a click event listener on the icon container
    iconContainer.addEventListener('click', function(e) {
      console.log('Icon container clicked.');
      // If an icon div was clicked...
      if (e.target && e.target.matches('div[data-icon]')) {
        console.log('Icon div clicked:', e.target);
  
        // ...set the value of the hidden icon input field to the data-icon attribute of the clicked div
        var iconInput = document.querySelector('#icon');
        iconInput.value = e.target.getAttribute('data-icon');
  
        console.log('Icon input value set:', iconInput.value);
  
        // Show alert message for avatar click
        alert('New Avatar is selected!');
      }
    });
  
    // Get a reference to the submit button
    var submitButton = document.querySelector('.submitbtn');
  
    // Set up a click event listener on the submit button
    submitButton.addEventListener('click', function() {
      // Show alert message for submit button click
      alert('User Profile is updated!');
    });
  };
  
// window.onload = function() {
//     console.log('Window loaded.');

//     // Get a reference to the icon container div
//     var iconContainer = document.querySelector('.iconcontainer');
//     console.log('Icon container:', iconContainer);
    

//     // Set up a click event listener on the icon container
//     iconContainer.addEventListener('click', function(e) {
//         console.log('Icon container clicked.');
//         // If an icon div was clicked...
//         if (e.target && e.target.matches('div[data-icon]')) {
//             console.log('Icon div clicked:', e.target);

//             // ...set the value of the hidden icon input field to the data-icon attribute of the clicked div
//              var iconInput = document.querySelector('#icon');
//             iconInput.value = e.target.getAttribute('data-icon');

//             console.log('Icon input value set:', iconInput.value);
//         }
//     });
// }
