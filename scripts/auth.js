

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  handleSignInResult();

  // Event listeners for opening and closing the login overlay
  document.getElementById('loginBtn').addEventListener('click', openLoginOverlay);
  document.getElementById('closeBtn').addEventListener('click', closeLoginOverlay);

  // Event listener for Google sign-in
  document.getElementById('googleLogin').addEventListener('click', signInWithGoogle);
});


