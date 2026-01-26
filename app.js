// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const totalTasksElement = document.getElementById('totalTasks');
const pendingTasksElement = document.getElementById('pendingTasks');
const completedTasksElement = document.getElementById('completedTasks');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskListSection = document.getElementById('taskListSection');

// Initialize tasks from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    updateTaskList();
    updateStats();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Add task when button is clicked
    addTaskBtn.addEventListener('click', addTask);
    
    // Add task when Enter key is pressed
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Clear all tasks
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Set current filter and update task list
            currentFilter = button.getAttribute('data-filter');
            updateTaskList();
        });
    });
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(), // Unique ID based on timestamp
        text: taskText,
        completed: false,
        date: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Update UI
    updateTaskList();
    updateStats();
    
    // Clear input and focus
    taskInput.value = '';
    taskInput.focus();
    
    // Show feedback
    showFeedback('Task added successfully!');
}

// Remove a task
function removeTask(taskId) {
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        // Remove from array
        tasks.splice(taskIndex, 1);
        
        // Save to localStorage
        saveTasks();
        
        // Update UI
        updateTaskList();
        updateStats();
        
        // Show feedback
        showFeedback('Task removed successfully!');
    }
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    // Find task
    const task = tasks.find(task => task.id === taskId);
    
    if (task) {
        // Toggle completion status
        task.completed = !task.completed;
        
        // Update date
        task.date = new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Save to localStorage
        saveTasks();
        
        // Update UI
        updateTaskList();
        updateStats();
        
        // Show feedback
        const message = task.completed ? 'Task marked as completed!' : 'Task marked as pending!';
        showFeedback(message);
    }
}

// Clear all completed tasks
function clearCompletedTasks() {
    // Filter out completed tasks
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
        showFeedback('No completed tasks to clear!');
        return;
    }
    
    // Keep only pending tasks
    tasks = tasks.filter(task => !task.completed);
    
    // Save to localStorage
    saveTasks();
    
    // Update UI
    updateTaskList();
    updateStats();
    
    // Show feedback
    showFeedback('Completed tasks cleared successfully!');
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        showFeedback('No tasks to clear!');
        return;
    }
    
    if (confirm('Are you sure you want to delete all tasks?')) {
        // Clear all tasks
        tasks = [];
        
        // Save to localStorage
        saveTasks();
        
        // Update UI
        updateTaskList();
        updateStats();
        
        // Show feedback
        showFeedback('All tasks cleared successfully!');
    }
}

// Update task list UI
function updateTaskList() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Show/hide empty message
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = 'block';
        
        // Update empty message based on filter
        if (currentFilter === 'pending') {
            emptyMessage.textContent = 'No pending tasks. Great job!';
        } else if (currentFilter === 'completed') {
            emptyMessage.textContent = 'No completed tasks yet. Keep going!';
        } else {
            emptyMessage.textContent = 'No tasks yet. Add your first task above!';
        }
    } else {
        emptyMessage.style.display = 'none';
        
        // Add tasks to the list
        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    // Create task content
    li.innerHTML = `
        <div class="task-status">
            <button class="task-btn complete-btn" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
                <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
            </button>
        </div>
        <div class="task-content">
            <div class="task-text">${task.text}</div>
            <div class="task-date">Added: ${task.date}</div>
        </div>
        <div class="task-actions">
            <button class="task-btn delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to buttons
    const completeBtn = li.querySelector('.complete-btn');
    const deleteBtn = li.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id));
    deleteBtn.addEventListener('click', () => removeTask(task.id));
    
    return li;
}

// Update statistics
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Update DOM elements
    totalTasksElement.textContent = totalTasks;
    pendingTasksElement.textContent = pendingTasks;
    completedTasksElement.textContent = completedTasks;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Show feedback message
function showFeedback(message) {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #00b894;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to document
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 3000);
}

// Add CSS for feedback animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);