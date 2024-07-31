import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";

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
const db = getFirestore(app);

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

let currentTaskId = null;
const days = document.querySelectorAll('.day');
async function initializeWeeksCollection() {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of daysOfWeek) {
        const docRef = doc(db, 'weeks', day);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, { tasks: {} });
            console.log(`Document for ${day} created.`);
        } else {
            console.log(`Document for ${day} already exists.`);
        }
    }
}

// Event Listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeWeeksCollection()
        .then(() => {
            console.log('Weeks collection initialized.');
            // Continue with fetching tasks or any other setup
        })
        .catch(error => {
            console.error('Error initializing weeks collection:', error);
        });
});
// Initialize tasks from Firestore
async function fetchTasksFromFirestore(day) {
    try {
        const docRef = doc(db, 'weeks', day);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const tasks = docSnap.data().tasks || [];
            tasks.forEach(task => {
                const newTask = document.createElement('div');
                newTask.classList.add('task');
                newTask.setAttribute('draggable', 'true');
                newTask.setAttribute('id', task.id);
                newTask.style.backgroundColor = task.color;
                newTask.innerHTML = `${task.name} <span class="place">${task.place}</span><span class="time">${task.time}</span><button class="delete-btn">x</button>`;
                document.getElementById(`${day}-section`).appendChild(newTask);
            });
            initializeDragAndDrop();
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error("Error fetching tasks from Firestore: ", error);
    }
}

// Save tasks to Firestore
async function saveTaskToFirestore(day, taskId, taskData) {
    try {
        const docRef = doc(db, 'weeks', day);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const tasks = docSnap.data().tasks || [];
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            updatedTasks.push(taskData);
            await updateDoc(docRef, { tasks: updatedTasks });
        } else {
            await setDoc(docRef, { tasks: [taskData] });
        }
    } catch (error) {
        console.error("Error saving task to Firestore: ", error);
    }
}

// Add Task function
async function addTask() {
    const taskName = taskNameInput.value.trim();
    const taskPlace = taskPlaceInput.value.trim();
    const taskTime = taskTimeInput.value;
    const taskColor = taskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    const taskId = `task-${new Date().getTime()}`;
    const day = 'monday'; // Change this dynamically based on where the task is added

    const newTask = document.createElement('div');
    newTask.classList.add('task');
    newTask.setAttribute('draggable', 'true');
    newTask.setAttribute('id', taskId);
    newTask.style.backgroundColor = taskColor;
    newTask.innerHTML = `${taskName} <span class="place">${taskPlace}</span><span class="time">${taskTime}</span><button class="delete-btn">x</button>`;
    document.getElementById(`${day}-section`).appendChild(newTask);

    const taskData = {
        id: taskId,
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    };
    await saveTaskToFirestore(day, taskId, taskData);

    closeModal();
    taskNameInput.value = '';
    taskPlaceInput.value = '';
    taskTimeInput.value = '';
    taskColorInput.value = '#456C86';
    initializeDragAndDrop();
}

// Edit Task function
async function editTask() {
    const taskName = editTaskNameInput.value.trim();
    const taskPlace = editTaskPlaceInput.value.trim();
    const taskTime = editTaskTimeInput.value;
    const taskColor = editTaskColorInput.value;
    if (taskName === '' || taskPlace === '' || taskTime === '') return;
    
    const day = 'monday'; // Change this dynamically based on where the task is edited
    const task = document.getElementById(currentTaskId);
    task.style.backgroundColor = taskColor;
    task.innerHTML = `${taskName} <span class="place">${taskPlace}</span><span class="time">${taskTime}</span><button class="delete-btn">x</button>`;

    const taskData = {
        id: currentTaskId,
        name: taskName,
        place: taskPlace,
        time: taskTime,
        color: taskColor
    };
    await saveTaskToFirestore(day, currentTaskId, taskData);

    closeEditModal();
}

// Delete Task function
async function deleteTask(e) {
    const task = e.target.parentElement;
    const day = 'monday'; // Change this dynamically based on where the task is deleted
    const taskId = task.id;
    const docRef = doc(db, 'weeks', day);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const tasks = docSnap.data().tasks || [];
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        await updateDoc(docRef, { tasks: updatedTasks });
    }

    task.remove();
}

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

    if (e.target.classList.contains('day')) {
        e.target.appendChild(draggable);
        const day = e.target.id.split('-')[0]; // Assuming the day is part of the section ID (e.g., "monday-section")
        const taskData = {
            id: draggable.id,
            name: draggable.querySelector('.name').textContent,
            place: draggable.querySelector('.place').textContent,
            time: draggable.querySelector('.time').textContent,
            color: draggable.style.backgroundColor
        };
        saveTaskToFirestore(day, draggable.id, taskData);
    }
}

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function openEditModal(e) {
    const task = e.target.closest('.task');
    currentTaskId = task.id;
    editTaskNameInput.value = task.querySelector('.name').textContent;
    editTaskPlaceInput.value = task.querySelector('.place').textContent;
    editTaskTimeInput.value = task.querySelector('.time').textContent;
    editTaskColorInput.value = rgbToHex(task.style.backgroundColor);
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
}

function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g);
    return `#${rgbArray.map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
}

// Event Listeners
openModalBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
addTaskModalBtn.addEventListener('click', addTask);
editCloseBtn.addEventListener('click', closeEditModal);
editTaskModalBtn.addEventListener('click', editTask);

initializeDragAndDrop();




