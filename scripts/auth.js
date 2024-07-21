// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHKWt7qf49qav84TdTTglUU_dK-TfMYAk",
  authDomain: "manager-613a6.firebaseapp.com",
  projectId: "manager-613a6",
  storageBucket: "manager-613a6.appspot.com",
  messagingSenderId: "679450448153",
  appId: "1:679450448153:web:b69f35a93d550162a57588"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Overlay functions
function openLoginOverlay() {
  document.getElementById('loginOverlay').style.display = 'block';
}

function closeLoginOverlay() {
  document.getElementById('loginOverlay').style.display = 'none';
}

// Google sign-in function
function signInWithGoogle(event) {
  event.preventDefault();
  signInWithRedirect(auth, provider);
}

// Handle sign-in result
function handleSignInResult() {
  getRedirectResult(auth)
    .then((result) => {
      if (result.user) {
        // User is signed in
        closeLoginOverlay(); // Optionally close the overlay after successful sign-in
        console.log("User signed in:", result.user);
      }
    })
    .catch((error) => {
      // Handle Errors here
      console.error("Error signing in with Google:", error);
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  handleSignInResult();

  // Event listeners for opening and closing the login overlay
  document.getElementById('loginBtn').addEventListener('click', openLoginOverlay);
  document.getElementById('closeBtn').addEventListener('click', closeLoginOverlay);

  // Event listener for Google sign-in
  document.getElementById('googleLogin').addEventListener('click', signInWithGoogle);
});


