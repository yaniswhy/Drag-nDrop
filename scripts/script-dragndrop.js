

// Task-related elements
const tasksContainer = document.querySelector('.tasks');
const openModalBtn = document.getElementById('add-task-btn');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const modal = document.getElementById('task-modal');
const closeBtn = document.querySelector('.close-btn');
const addTaskModalBtn = document.getElementById('add-task-modal-btn');
const taskNameInput = document.getElementById('task-name');
const taskPlaceInput = document.getElementById('task-place');
const taskTimeInput = document.getElementById('task-time');
const taskColorInput = document.getElementById('task-color');
const editModal = document.getElementById('edit-task-modal');
const editCloseBtn = document.querySelector('.edit-close-btn');
const editTaskModalBtn = document.getElementById('edit-task-modal-btn');
const editTaskNameInput = document.getElementById('edit-task-name');
const editTaskPlaceInput = document.getElementById('edit-task-place');
const editTaskTimeInput = document.getElementById('edit-task-time');
const editTaskColorInput = document.getElementById('edit-task-color');

// Function to save task to Firestore
async function saveTaskToFirestore(taskId, taskData) {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(taskRef, taskData);
        console.log("Task saved to Firestore.");
    } catch (error) {
        console.error("Error saving task to Firestore:", error);
    }
}

// Function to fetch tasks from Firestore
async function fetchTasksFromFirestore() {
    try {
        const tasksCollection = collection(db, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollection);
        tasksSnapshot.forEach(doc => {
            const taskData = doc.data();
            createTaskElement(doc.id, taskData);
        });
        initializeDragAndDrop();
    } catch (error) {
        console.error("Error fetching tasks from Firestore:", error);
    }
}

// Initialize the drag-and-drop functionality
function initializeDragAndDrop() {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragend', dragEnd);
        task.addEventListener('dblclick', openEditModal);
    });
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        day.addEventListener('dragover', dragOver);
        day.addEventListener('dragenter', dragEnter);
        day.addEventListener('dragleave', dragLeave);
        day.addEventListener('drop', drop);
    });
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteTask);
    });
}

// Drag-and-drop event handlers
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
}

function dragEnd(e) {
    e.target.classList.remove('hide');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('hovered');
}

function dragLeave(e) {
    e.target.classList.remove('hovered');
}

function drop(e) {
    e.preventDefault();
    e.target.classList.remove('hovered');
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    if (draggable.parentElement === e.target) {
        return;
    }
    if (draggable.parentElement === tasksContainer) {
        const clone = draggable.cloneNode(true);
        clone.id = `task-${new Date().getTime()}`;
        initializeTask(clone);
        e.target.appendChild(clone);
        saveTaskToFirestore(clone.id, {
            name: clone.childNodes[0].nodeValue.trim(),
            place: clone.querySelector('.place').textContent,
            time: clone.querySelector('.time').textContent,
            color: clone.style.backgroundColor
        });
    } else {
        draggable.parentElement.removeChild(draggable);
        e.target.appendChild(draggable);
        saveTaskToFirestore(draggable.id, {
            name: draggable.childNodes[0].nodeValue.trim(),
            place: draggable.querySelector('.place').textContent,
            time: draggable.querySelector('.time').textContent,
            color: draggable.style.backgroundColor
        });
    }
}

// Modal functions
function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function openEditModal(e) {
    currentTaskId = e.target.id;
    const task = document.getElementById(currentTaskId);
    editTaskNameInput.value = task.childNodes[0].nodeValue.trim();
    editTaskPlaceInput.value = task.querySelector('.place').textContent;
    editTaskTimeInput.value = task.querySelector('.time').textContent;
    editTaskColorInput.value = rgbToHex(task.style.backgroundColor);
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
}

// Function to add a task
function addTask() {
    const taskName = taskNameInput.value.trim();
    const taskPlace = taskPlaceInput.value.trim();
    const taskTime = taskTimeInput.value;
    const taskColor = taskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    const taskId = `task-${new Date().getTime()}`;
    const newTask = createTaskElement(taskId, {
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    });
    tasksContainer.appendChild(newTask);
    closeModal();
    saveTaskToFirestore(taskId, {
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    });
    taskNameInput.value = '';
    taskPlaceInput.value = '';
    taskTimeInput.value = '';
    taskColorInput.value = '#456C86';
    initializeDragAndDrop();
}

// Function to edit a task
function editTask() {
    const taskName = editTaskNameInput.value.trim();
    const taskPlace = editTaskPlaceInput.value.trim();
    const taskTime = editTaskTimeInput.value;
    const taskColor = editTaskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    const task = document.getElementById(currentTaskId);
    task.style.backgroundColor = taskColor;
    task.innerHTML = `${taskName} <span class="place">${taskPlace}</span><span class="time">${taskTime}</span><button class="delete-btn">x</button>`;
    saveTaskToFirestore(task.id, {
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    });
    initializeTask(task);
    closeEditModal();
}

// Function to delete a task
async function deleteTask(e) {
    const task = e.target.parentElement;
    try {
        await deleteDoc(doc(db, 'tasks', task.id));
        console.log("Task deleted from Firestore.");
    } catch (error) {
        console.error("Error deleting task from Firestore:", error);
    }
    task.remove();
}

// Function to create a task element
function createTaskElement(taskId, taskData) {
    const newTask = document.createElement('div');
    newTask.classList.add('task');
    newTask.setAttribute('draggable', 'true');
    newTask.setAttribute('id', taskId);
    newTask.style.backgroundColor = taskData.color;
    newTask.innerHTML = `${taskData.name} <span class="place">${taskData.place}</span><span class="time">${taskData.time}</span><button class="delete-btn">x</button>`;
    return newTask;
}

// Convert RGB to Hex
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g);
    return `#${((1 << 24) + (parseInt(rgbArray[0]) << 16) + (parseInt(rgbArray[1]) << 8) + parseInt(rgbArray[2])).toString(16).slice(1).toUpperCase()}`;
}

// Event listeners
openModalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
addTaskModalBtn.addEventListener('click', addTask);
editCloseBtn.addEventListener('click', closeEditModal);
editTaskModalBtn.addEventListener('click', editTask);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    } else if (e.target === editModal) {
        closeEditModal();
    }
});
toggleSidebarBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-active');
});

// Clear tasks when the button is clicked
document.getElementById('toggle-sidebar-btnnn').addEventListener('click', function() {
    const daySections = document.querySelectorAll('.day');
    daySections.forEach(function(section) {
        section.innerHTML = '<h3>' + section.querySelector('h3').textContent + '</h3>';
    });
});

// Dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const toggleBtn = document.getElementById('toggle-sidebar-btnn');
    let isDarkMode = false;
    toggleBtn.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            body.classList.add('dark-mode');
            toggleBtn.style.color = '#fff';
        } else {
            body.classList.remove('dark-mode');
            toggleBtn.style.color = '#000';
        }
    });
});

// Print schedule
const printScheduleBtn = document.getElementById('print-schedule-btn');
printScheduleBtn.addEventListener('click', () => {
    tasksContainer.style.display = 'none';
    modal.style.display = 'none';
    editModal.style.display = 'none';
    window.print();
    tasksContainer.style.display = '';
    modal.style.display = '';
    editModal.style.display = '';
});

// Initialize drag-and-drop and fetch tasks from Firestore on page load
initializeDragAndDrop();
fetchTasksFromFirestore();
