// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, if applicable
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCollection = collection(db, 'tasks');

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    document.getElementById('add-task-btn').addEventListener('click', openModal);
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('add-task-modal-btn').addEventListener('click', addTask);
    document.getElementById('toggle-sidebar-btn').addEventListener('click', () => {
        document.body.classList.toggle('sidebar-active');
    });
    document.getElementById('print-schedule-btn').addEventListener('click', printSchedule);
    initializeDragAndDrop();
});

async function fetchTasks() {
    const querySnapshot = await getDocs(tasksCollection);
    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayTasks(tasks);
}

function displayTasks(tasks) {
    const sidebar = document.querySelector('.tasks');
    sidebar.innerHTML = `<button id="add-task-btn"><i class="fas fa-plus"></i></button>`;
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.setAttribute('draggable', 'true');
        taskElement.setAttribute('id', task.id);
        taskElement.style.backgroundColor = task.color;
        taskElement.innerHTML = `${task.name} <span class="place">${task.place}</span><span class="time">${task.time}</span><button class="delete-btn">x</button>`;
        sidebar.appendChild(taskElement);
        initializeTask(taskElement);
    });
}

async function addTask() {
    const taskName = document.getElementById('task-name').value.trim();
    const taskPlace = document.getElementById('task-place').value.trim();
    const taskTime = document.getElementById('task-time').value;
    const taskColor = document.getElementById('task-color').value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;

    const newTask = {
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    };

    try {
        const docRef = await addDoc(tasksCollection, newTask);
        newTask.id = docRef.id;
        displayTasks([newTask]);
        closeModal();
    } catch (e) {
        console.error('Error adding task: ', e);
    }
}

function deleteTask(taskId) {
    try {
        deleteDoc(doc(db, 'tasks', taskId));
        document.getElementById(taskId).remove();
    } catch (e) {
        console.error('Error deleting task: ', e);
    }
}

function initializeTask(taskElement) {
    taskElement.addEventListener('dragstart', dragStart);
    taskElement.addEventListener('dragend', dragEnd);
    taskElement.addEventListener('dblclick', openEditModal);
    const deleteButton = taskElement.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => deleteTask(taskElement.id));
}

async function updateTask(taskId, updatedTask) {
    try {
        await setDoc(doc(db, 'tasks', taskId), updatedTask);
        const taskElement = document.getElementById(taskId);
        taskElement.style.backgroundColor = updatedTask.color;
        taskElement.innerHTML = `${updatedTask.name} <span class="place">${updatedTask.place}</span><span class="time">${updatedTask.time}</span><button class="delete-btn">x</button>`;
    } catch (e) {
        console.error('Error updating task: ', e);
    }
}

function openModal() {
    document.getElementById('task-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
}

function openEditModal(e) {
    const taskId = e.currentTarget.id;
    const taskElement = document.getElementById(taskId);
    document.getElementById('edit-task-name').value = taskElement.childNodes[0].nodeValue.trim();
    document.getElementById('edit-task-place').value = taskElement.querySelector('.place').textContent;
    document.getElementById('edit-task-time').value = taskElement.querySelector('.time').textContent;
    document.getElementById('edit-task-color').value = taskElement.style.backgroundColor;
    document.getElementById('edit-task-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-task-modal').style.display = 'none';
}

function printSchedule() {
    window.print();
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

function initializeDragAndDrop() {
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        day.addEventListener('dragover', dragOver);
        day.addEventListener('dragenter', dragEnter);
        day.addEventListener('dragleave', dragLeave);
        day.addEventListener('drop', drop);
    });

    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragend', dragEnd);
    });
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('hovered');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('hovered');
}

async function drop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.getElementById(taskId);
    const targetDay = e.currentTarget.id;
    
    if (!targetDay || !taskElement) return;

    try {
        const task = {
            name: taskElement.childNodes[0].nodeValue.trim(),
            place: taskElement.querySelector('.place').textContent,
            time: taskElement.querySelector('.time').textContent,
            color: taskElement.style.backgroundColor
        };

        await updateTask(taskId, { ...task, day: targetDay });
    } catch (err) {
        console.error('Error dropping task: ', err);
    }
    e.currentTarget.classList.remove('hovered');
}

// Initialize the app
initializeApp(firebaseConfig);
