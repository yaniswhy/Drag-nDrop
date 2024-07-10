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

const printScheduleBtn = document.getElementById('print-schedule-btn');

printScheduleBtn.addEventListener('click', () => {
    window.print();
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
    e.dataTransfer.effectAllowed = 'move';
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
        saveTaskToFirestore(clone);
    } else {
        draggable.parentElement.removeChild(draggable);
        e.target.appendChild(draggable);
        updateTaskPositionInFirestore(draggable);
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
    editTaskColorInput.value = task.style.backgroundColor;
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
    saveTaskToFirestore(newTask);
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
    updateTaskInFirestore(task);
}

function deleteTask(e) {
    const task = e.target.parentElement;
    deleteTaskFromFirestore(task.id);
    task.remove();
}

function initializeTask(task) {
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);
    task.addEventListener('dblclick', openEditModal);
    const deleteButton = task.querySelector('.delete-btn');
    deleteButton.addEventListener('click', deleteTask);
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

function saveTaskToFirestore(task) {
    const taskData = {
        id: task.id,
        name: task.childNodes[0].nodeValue.trim(),
        place: task.querySelector('.place').textContent,
        time: task.querySelector('.time').textContent,
        color: task.style.backgroundColor,
        parent: task.parentElement.classList.contains('day') ? task.parentElement.id : 'tasksContainer'
    };
    db.collection('tasks').doc(task.id).set(taskData)
        .then(() => {
            console.log('Task saved to Firestore');
        })
        .catch(error => {
            console.error('Error saving task to Firestore: ', error);
        });
}

function updateTaskInFirestore(task) {
    const taskData = {
        id: task.id,
        name: task.childNodes[0].nodeValue.trim(),
        place: task.querySelector('.place').textContent,
        time: task.querySelector('.time').textContent,
        color: task.style.backgroundColor,
        parent: task.parentElement.classList.contains('day') ? task.parentElement.id : 'tasksContainer'
    };
    db.collection('tasks').doc(task.id).update(taskData)
        .then(() => {
            console.log('Task updated in Firestore');
        })
        .catch(error => {
            console.error('Error updating task in Firestore: ', error);
        });
}

function updateTaskPositionInFirestore(task) {
    const parent = task.parentElement.classList.contains('day') ? task.parentElement.id : 'tasksContainer';
    db.collection('tasks').doc(task.id).update({ parent })
        .then(() => {
            console.log('Task position updated in Firestore');
        })
        .catch(error => {
            console.error('Error updating task position in Firestore: ', error);
        });
}

function deleteTaskFromFirestore(taskId) {
    db.collection('tasks').doc(taskId).delete()
        .then(() => {
            console.log('Task deleted from Firestore');
        })
        .catch(error => {
            console.error('Error deleting task from Firestore: ', error);
        });
}

function loadTasksFromFirestore() {
    db.collection('tasks').get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const taskData = doc.data();
                const task = document.createElement('div');
                task.classList.add('task');
                task.setAttribute('draggable', 'true');
                task.setAttribute('id', taskData.id);
                task.style.backgroundColor = taskData.color;
                task.innerHTML = `${taskData.name} <span class="place">${taskData.place}</span><span class="time">${taskData.time}</span><button class="delete-btn">x</button>`;
                initializeTask(task);

                const parent = taskData.parent === 'tasksContainer' ? tasksContainer : document.getElementById(taskData.parent);
                parent.appendChild(task);
            });
        })
        .catch(error => {
            console.error('Error loading tasks from Firestore: ', error);
        });
}

document.addEventListener('DOMContentLoaded', loadTasksFromFirestore);
