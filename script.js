document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskCategory = document.getElementById('task-category');
    const taskList = document.getElementById('task-list');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const currentCategoryTitle = document.getElementById('current-category-title');
    
    // Mobile Sidebar Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'Semua';

    // Initialize
    document.getElementById('current-year').textContent = new Date().getFullYear();
    renderTasks();

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskAction);
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            const clickedBtn = e.currentTarget;
            clickedBtn.classList.add('active');
            
            // Update filter
            currentFilter = clickedBtn.getAttribute('data-category');
            currentCategoryTitle.textContent = currentFilter === 'Semua' ? 'Semua Tugas' : `Tugas ${currentFilter}`;
            
            // Re-render
            renderTasks();

            // Close sidebar on mobile after selecting category
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Mobile Sidebar Handlers
    menuToggle.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Functions
    function addTask(e) {
        e.preventDefault();
        
        const text = taskInput.value.trim();
        const category = taskCategory.value;
        
        if (text !== '') {
            const newTask = {
                id: Date.now(),
                text: text,
                category: category,
                completed: false
            };
            
            tasks.push(newTask);
            saveToLocalStorage();
            
            renderTasks();
            
            // Reset input
            taskInput.value = '';
            taskInput.focus();
        }
    }

    function handleTaskAction(e) {
        const target = e.target;
        
        // Handle Delete
        if (target.closest('.btn-delete')) {
            const taskItem = target.closest('.task-item');
            const taskId = Number(taskItem.getAttribute('data-id'));
            
            // Animate removal
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateY(15px)';
            
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveToLocalStorage();
                renderTasks();
            }, 300);
        }
        
        // Handle Checkbox Toggle
        if (target.classList.contains('task-checkbox')) {
            const taskItem = target.closest('.task-item');
            const taskId = Number(taskItem.getAttribute('data-id'));
            
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, completed: target.checked };
                }
                return task;
            });
            
            saveToLocalStorage();
            renderTasks();
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = currentFilter === 'Semua' 
            ? tasks 
            : tasks.filter(task => task.category === currentFilter);
            
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li style="text-align: center; color: var(--text-muted); padding: 3rem 0; font-size: 1.1rem;">Belum ada tugas di kategori ini.</li>`;
            return;
        }

        // Sort tasks: uncompleted first, then completed
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed === b.completed) {
                return b.id - a.id; // Newest first for same status
            }
            return a.completed ? 1 : -1; // Uncompleted first
        });

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Tandai selesai">
                    <div>
                        <span class="task-text">${escapeHTML(task.text)}</span>
                        <span class="task-badge">${task.category}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-delete" aria-label="Hapus tugas">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }

    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
