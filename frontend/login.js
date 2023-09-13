window.addEventListener("load", function() {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleCredentialResponse 
  });

  const parent = document.getElementById('google_btn');
  google.accounts.id.renderButton(parent, {theme: 'filled_blue'});

  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMomemt()) {
      console.log('One tap was not displayed or was skipped.');
    }
  });
});


function handleCredentialResponse(response) {
  console.log('Credential response received: ', response);


  window.location.href='index.html';
} 