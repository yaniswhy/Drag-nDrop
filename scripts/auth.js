// Function to show the login overlay
function showLoginOverlay() {
  document.getElementById('loginOverlay').style.display = 'block';
}

// Function to hide the login overlay
function hideLoginOverlay() {
  document.getElementById('loginOverlay').style.display = 'none';
}

// Check if enough time has passed since the last execution
function canExecuteFunction() {
  const lastExecution = localStorage.getItem('lastExecution');
  const now = new Date().getTime();

  if (lastExecution) {
    const timePassed = now - lastExecution;
    if (timePassed >= 300000) { // 5 minutes in milliseconds
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

// Function to handle the overlay click event
function handleOverlayClick(event) {
  if (event.target == document.getElementById('loginOverlay') && canExecuteFunction()) {
    hideLoginOverlay();
    localStorage.setItem('lastExecution', new Date().getTime());
  }
}

// Event listeners
document.getElementById('loginBtn').addEventListener('click', showLoginOverlay);

document.getElementById('closeBtn').addEventListener('click', hideLoginOverlay);

document.getElementById('inv').addEventListener('click', hideLoginOverlay);
document.getElementById('inv1').addEventListener('click', hideLoginOverlay);

window.addEventListener('click', handleOverlayClick);

// Optionally, clear the localStorage entry after the delay has passed
setInterval(() => {
  if (canExecuteFunction()) {
    localStorage.removeItem('lastExecution');
  }
}, 60000); // Check every minute
