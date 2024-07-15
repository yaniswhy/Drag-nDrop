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

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const toggleBtn = document.getElementById('toggle-sidebar-btnn');

    // Initial theme mode (light mode)
    let isDarkMode = false;

    toggleBtn.addEventListener('click', function() {
        // Toggle dark mode
        isDarkMode = !isDarkMode;

        if (isDarkMode) {
            body.classList.add('dark-mode');
            toggleBtn.style.color = '#fff'; // Change button color in dark mode
        } else {
            body.classList.remove('dark-mode');
            toggleBtn.style.color = '#000'; // Change button color in light mode
        }
    });
});


const printScheduleBtn = document.getElementById('print-schedule-btn');

printScheduleBtn.addEventListener('click', () => {
    // Hide the task bar and overlays before printing
    tasksContainer.style.display = 'none';
    modal.style.display = 'none';
    editModal.style.display = 'none';
    // Print the schedule
    window.print();
    // Show the task bar and overlays after printing
    tasksContainer.style.display = '';
    modal.style.display = '';
    editModal.style.display = '';
});
let currentTaskId = null;
const days = document.querySelectorAll('.day');
function initializeDragAndDrop() {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragend', dragEnd);
        task.addEventListener('dblclick', openEditModal);
    });
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
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move'; // Specify the operation allowed (move)
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
    
    // If the drop target is the same as the current parent, return
    if (draggable.parentElement === e.target) {
        return;
    }
    // If the task is dragged from the sidebar, clone it
    if (draggable.parentElement === tasksContainer) {
        const clone = draggable.cloneNode(true);
        clone.id = `task-${new Date().getTime()}`;
        initializeTask(clone);
        e.target.appendChild(clone);
    } else {
        // Remove the task from its current parent
        draggable.parentElement.removeChild(draggable);
        e.target.appendChild(draggable);
    }
}
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
    editTaskColorInput.value = rgbToHex(task.style.backgroundColor); // Convert RGB to hex
    editModal.style.display = 'block';
}
function closeEditModal() {
    editModal.style.display = 'none';
}
function addTask() {
    const taskName = taskNameInput.value.trim();
    const taskPlace = taskPlaceInput.value.trim();
    const taskTime = taskTimeInput.value;
    const taskColor = taskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    const taskId = `task-${document.querySelectorAll('.task').length + 1}`;
    const newTask = document.createElement('div');
    newTask.classList.add('task');
    newTask.setAttribute('draggable', 'true');
    newTask.setAttribute('id', taskId);
    newTask.style.backgroundColor = taskColor;
    newTask.innerHTML = `${taskName} <span class="place">${taskPlace}</span><span class="time">${taskTime}</span><button class="delete-btn">x</button>`;
    tasksContainer.appendChild(newTask);
    closeModal();
    taskNameInput.value = '';
    taskPlaceInput.value = '';
    taskTimeInput.value = '';
    taskColorInput.value = '#456C86';
    initializeDragAndDrop();
}
function editTask() {
    const taskName = editTaskNameInput.value.trim();
    const taskPlace = editTaskPlaceInput.value.trim();
    const taskTime = editTaskTimeInput.value;
    const taskColor = editTaskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    const task = document.getElementById(currentTaskId);
    task.style.backgroundColor = taskColor;
    task.innerHTML = `${taskName} <span class="place">${taskPlace}</span><span class="time">${taskTime}</span><button class="delete-btn">x</button>`;
    initializeTask(task);
    closeEditModal();
}
function deleteTask(e) {
    const task = e.target.parentElement;
    task.remove();
}
function initializeTask(task) {
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);
    task.addEventListener('dblclick', openEditModal);
    const deleteButton = task.querySelector('.delete-btn');
    deleteButton.addEventListener('click', deleteTask);
}
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g);
    return `#${((1 << 24) + (parseInt(rgbArray[0]) << 16) + (parseInt(rgbArray[1]) << 8) + parseInt(rgbArray[2])).toString(16).slice(1).toUpperCase()}`;
}
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
initializeDragAndDrop();