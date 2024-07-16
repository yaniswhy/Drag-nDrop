// Function to show add note overlay
function showAddNoteOverlay() {
    const overlay = document.getElementById('addNoteOverlay');
    overlay.style.display = 'block';
}

// Function to close add note overlay
function closeAddNoteOverlay() {
    const overlay = document.getElementById('addNoteOverlay');
    overlay.style.display = 'none';
}

// Function to add a new note
function addNewNote() {
    const title = document.getElementById('newNoteTitle').value;
    const content = document.getElementById('newNoteContent').value;

    if (!title || !content) {
        alert("Please enter both title and content for the note.");
        return;
    }

    const notesList = document.querySelector('.notes-list');
    const newNoteItem = document.createElement('div');
    newNoteItem.className = 'note-item';
    newNoteItem.setAttribute('onclick', `showNoteDetails('${title}')`);
    newNoteItem.innerHTML = `
        <div class="note-icon"><img src="note-icon-placeholder.png" alt="Note Icon"></div>
        <div class="note-summary">
            <h3 id="${title}-title">${title}</h3>
            <p id="${title}-content">${content}</p>
            <span class="note-date">${getCurrentDateTime()}</span>
        </div>
    `;
    notesList.appendChild(newNoteItem);

    closeAddNoteOverlay();
}

// Function to show note details
function showNoteDetails(title) {
    const noteDetails = document.querySelectorAll('.note-detail');
    noteDetails.forEach(detail => {
        detail.style.display = 'none';
    });

    const noteDetail = document.getElementById(title);
    noteDetail.style.display = 'block';
}

// Function to show edit note overlay
function showEditNoteOverlay(noteId) {
    const overlay = document.getElementById('editNoteOverlay');
    overlay.style.display = 'block';

    const noteTitle = document.getElementById(`${noteId}-title`).textContent;
    const noteContent = document.getElementById(`${noteId}-content`).textContent;

    document.getElementById('editNoteTitle').value = noteTitle;
    document.getElementById('editNoteContent').value = noteContent;
}

// Function to close edit note overlay
function closeEditNoteOverlay() {
    const overlay = document.getElementById('editNoteOverlay');
    overlay.style.display = 'none';
}

// Function to edit note details
function editNote() {
    const title = document.getElementById('editNoteTitle').value;
    const content = document.getElementById('editNoteContent').value;

    if (!title || !content) {
        alert("Please enter both title and content for the note.");
        return;
    }

    const noteDetail = document.querySelector('.note-detail[style="display: block;"]');
    noteDetail.querySelector('h3').textContent = title;
    noteDetail.querySelector('p').textContent = content;

    closeEditNoteOverlay();
}

// Function to get current date and time
function getCurrentDateTime() {
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString()}`;
    return formattedDate;
}

// Event listener to close overlays when clicking outside the content
document.addEventListener('click', function(event) {
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach(overlay => {
        if (overlay.style.display === 'block' && !overlay.contains(event.target)) {
            overlay.style.display = 'none';
        }
    });
});

// Prevent overlay closing when clicking inside the overlay content
document.querySelectorAll('.overlay-content').forEach(content => {
    content.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

