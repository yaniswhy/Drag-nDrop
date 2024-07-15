document.getElementById('loginBtn').addEventListener('click', function() {
  document.getElementById('loginOverlay').style.display = 'block';
});

document.getElementById('closeBtn').addEventListener('click', function() {
  document.getElementById('loginOverlay').style.display = 'none';
});

document.getElementById('inv').addEventListener('click', function() {
  document.getElementById('loginOverlay').style.display = 'none';
});
window.addEventListener('click', function(event) {
  if (event.target == document.getElementById('loginOverlay')) {
      document.getElementById('loginOverlay').style.display = 'none';
  }
});
