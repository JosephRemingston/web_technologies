const taskInput = document.getElementById('taskName');
const addTaskBtn = document.getElementById('addTaskBtn');
const message = document.getElementById('message');
const columns = document.querySelectorAll('.column');

// Add task when button is clicked
addTaskBtn.addEventListener('click', function() {
    const taskName = taskInput.value.trim();
    if (taskName === '') {
        alert('Please enter a task name');
        return;
    }
    
    createTask(taskName);
    taskInput.value = '';
});

// Create a new task card
function createTask(taskName) {
    const task = document.createElement('div');
    task.className = 'task-card';
    task.draggable = true;
    
    const currentDate = new Date().toLocaleDateString();
    task.innerHTML = `
        <p><strong>${taskName}</strong></p>
        <p>${currentDate}</p>
    `;
    
    // Add drag event listeners
    task.addEventListener('dragstart', handleDragStart);
    task.addEventListener('dragend', handleDragEnd);
    
    // Add to "To Do" column
    document.getElementById('todo').appendChild(task);
}

// Drag start
function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

// Drag end
function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// Set up drop zones
columns.forEach(column => {
    column.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    column.addEventListener('drop', function(e) {
        e.preventDefault();
        const draggingTask = document.querySelector('.dragging');
        
        if (draggingTask) {
            this.appendChild(draggingTask);
            
            // Check if dropped in completed column
            if (this.id === 'completed') {
                draggingTask.style.backgroundColor = '#90EE90';
                message.textContent = 'Task Completed Successfully';
                message.style.display = 'block';
                
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            } else {
                draggingTask.style.backgroundColor = '#fff';
            }
        }
    });
});
