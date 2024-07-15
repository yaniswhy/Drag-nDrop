import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


    const firebaseConfig = {
        apiKey: "AIzaSyDGQoKm3mR6AEfB0S5BNqKRhmAB2mT_nOw",
        authDomain: "drag-ndrop-4c524.firebaseapp.com",
        projectId: "drag-ndrop-4c524",
        storageBucket: "drag-ndrop-4c524.appspot.com",
        messagingSenderId: "159228330206",
        appId: "1:159228330206:web:2bcded151a12293a2ec24f"
      };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add Task button click event listener
addTaskModalBtn.addEventListener('click', () => {
    const taskName = taskNameInput.value.trim();
    const taskPlace = taskPlaceInput.value.trim();
    const taskTime = taskTimeInput.value;
    const taskColor = taskColorInput.value;

    addTaskToFirestore(taskName, taskPlace, taskTime, taskColor);

    // Additional UI handling logic (e.g., closing modals, clearing inputs) can go here
    closeModal();
});

// Save Changes button click event listener
editTaskModalBtn.addEventListener('click', () => {
    const taskName = editTaskNameInput.value.trim();
    const taskPlace = editTaskPlaceInput.value.trim();
    const taskTime = editTaskTimeInput.value;
    const taskColor = editTaskColorInput.value;
    const taskId = currentTaskId;

    updateTaskInFirestore(taskId, taskName, taskPlace, taskTime, taskColor);

    // Additional UI handling logic (e.g., closing modals) can go here
    closeEditModal();
});

// Delete button click event listener
deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const taskId = e.target.parentElement.id;

        deleteTaskFromFirestore(taskId);

        // Additional UI handling logic (e.g., removing task from UI) can go here
    });
});


