// Task Management System
class TodoApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = "all";
    this.editingTaskId = null;
    this.taskIdCounter = 1;

    this.init();
  }

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  // Local Storage Methods (using variables instead of localStorage)
  loadFromStorage() {
    // Since localStorage isn't available in Claude artifacts, we'll start with empty tasks
    this.tasks = [];
    this.taskIdCounter = 1;
  }

  saveToStorage() {
    // In a real environment, this would save to localStorage
    // For now, we'll just keep data in memory
    console.log("Tasks saved to memory:", this.tasks);
  }

  // Event Binding
  bindEvents() {
    const taskInput = document.getElementById("task-input");
    const addBtn = document.getElementById("add-btn");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const clearCompleted = document.getElementById("clear-completed");
    const clearAll = document.getElementById("clear-all");
    const modal = document.getElementById("edit-modal");
    const closeModal = document.getElementById("close-modal");
    const cancelEdit = document.getElementById("cancel-edit");
    const saveEdit = document.getElementById("save-edit");
    const editInput = document.getElementById("edit-input");

    // Add task events
    addBtn.addEventListener("click", () => this.addTask());
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    // Filter events
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn.dataset.filter));
    });

    // Clear events
    clearCompleted.addEventListener("click", () => this.clearCompleted());
    clearAll.addEventListener("click", () => this.clearAll());

    // Modal events
    closeModal.addEventListener("click", () => this.closeModal());
    cancelEdit.addEventListener("click", () => this.closeModal());
    saveEdit.addEventListener("click", () => this.saveEdit());
    editInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.saveEdit();
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Input animations
    taskInput.addEventListener("focus", () => {
      taskInput.parentElement.style.transform = "scale(1.02)";
    });

    taskInput.addEventListener("blur", () => {
      taskInput.parentElement.style.transform = "scale(1)";
    });
  }

  // Task Management Methods
  addTask() {
    const taskInput = document.getElementById("task-input");
    const text = taskInput.value.trim();

    if (!text) {
      this.showNotification("Please enter a task!", "error");
      this.shakeElement(taskInput.parentElement);
      return;
    }

    const task = {
      id: this.taskIdCounter++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveToStorage();
    this.render();
    this.updateStats();

    taskInput.value = "";
    this.showNotification("Task added successfully!", "success");

    // Add bounce animation to the input
    taskInput.parentElement.style.animation = "none";
    taskInput.parentElement.offsetHeight; // Trigger reflow
    taskInput.parentElement.style.animation = "bounce 0.6s ease-out";
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();
      this.updateStats();

      const message = task.completed ? "Task completed!" : "Task uncompleted!";
      this.showNotification(message, "success");
    }
  }

  deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add("removing");
      setTimeout(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.showNotification("Task deleted!", "success");
      }, 500);
    }
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      this.editingTaskId = id;
      document.getElementById("edit-input").value = task.text;
      document.getElementById("edit-modal").style.display = "block";
      document.getElementById("edit-input").focus();
    }
  }

  saveEdit() {
    const newText = document.getElementById("edit-input").value.trim();
    if (!newText) {
      this.showNotification("Please enter a task!", "error");
      return;
    }

    const task = this.tasks.find((t) => t.id === this.editingTaskId);
    if (task) {
      task.text = newText;
      this.saveToStorage();
      this.render();
      this.closeModal();
      this.showNotification("Task updated successfully!", "success");
    }
  }

  closeModal() {
    document.getElementById("edit-modal").style.display = "none";
    this.editingTaskId = null;
  }

  // Filter Methods
  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active");
    this.render();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "completed":
        return this.tasks.filter((task) => task.completed);
      case "pending":
        return this.tasks.filter((task) => !task.completed);
      default:
        return this.tasks;
    }
  }

  // Clear Methods
  clearCompleted() {
    const completedTasks = this.tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) {
      this.showNotification("No completed tasks to clear!", "error");
      return;
    }

    this.tasks = this.tasks.filter((t) => !t.completed);
    this.saveToStorage();
    this.render();
    this.updateStats();
    this.showNotification(
      `${completedTasks.length} completed tasks cleared!`,
      "success"
    );
  }

  clearAll() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to clear!", "error");
      return;
    }

    const taskCount = this.tasks.length;
    this.tasks = [];
    this.saveToStorage();
    this.render();
    this.updateStats();
    this.showNotification(`${taskCount} tasks cleared!`, "success");
  }

  // Render Methods
  render() {
    const taskList = document.getElementById("task-list");
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
                       <div class="empty-state">
                            <div style="font-size: 3em; margin-bottom: 15px;">📝</div>
                            <h3>No tasks ${
                              this.currentFilter === "all"
                                ? ""
                                : this.currentFilter
                            }</h3>
                            <p>Add a new task to get started!</p>
                        </div>
                    `;
      return;
    }

    taskList.innerHTML = filteredTasks
      .map(
        (task) => `
                    <div class="task-item ${
                      task.completed ? "completed" : ""
                    }" data-id="${task.id}">
                        <input type="checkbox" class="task-checkbox" ${
                          task.completed ? "checked" : ""
                        } 
                               onchange="todoApp.toggleTask(${task.id})">
                        <span class="task-text ${
                          task.completed ? "completed" : ""
                        }">${task.text}</span>
                        <div class="task-actions">
                            <button class="task-btn edit-btn" onclick="todoApp.editTask(${
                              task.id
                            })">Edit</button>
                            <button class="task-btn delete-btn" onclick="todoApp.deleteTask(${
                              task.id
                            })">Delete</button>
                        </div>
                    </div>
                `
      )
      .join("");
  }

  // Stats Methods
  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    document.getElementById("total-tasks").textContent = totalTasks;
    document.getElementById("completed-tasks").textContent = completedTasks;
    document.getElementById("pending-tasks").textContent = pendingTasks;
  }

  // Utility Methods
  showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  shakeElement(element) {
    element.classList.add("shake");
    setTimeout(() => element.classList.remove("shake"), 500);
  }
}

// Initialize the TodoApp when the page loads
const todoApp = new TodoApp();
