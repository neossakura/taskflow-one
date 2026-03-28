const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const totalTasksEl = document.getElementById("totalTasks");
const activeTasksEl = document.getElementById("activeTasks");
const completedTasksEl = document.getElementById("completedTasks");
const completionRateEl = document.getElementById("completionRate");
const currentFilterLabelEl = document.getElementById("currentFilterLabel");

const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";
let currentSearch = "";

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function createTask(title, priority) {
  return {
    id: Date.now().toString(),
    title: title.trim(),
    priority,
    completed: false,
    createdAt: new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

function addTask(event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!title) return;

  const newTask = createTask(title, priority);
  tasks.unshift(newTask);

  saveTasks();
  renderTasks();
  updateStats();

  taskForm.reset();
  prioritySelect.value = "medium";
  taskInput.focus();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
  updateStats();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
  updateStats();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  updateStats();
}

function getFilteredTasks() {
  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch = task.title
      .toLowerCase()
      .includes(currentSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });
}

function getPriorityClass(priority) {
  if (priority === "high") return "badge--high";
  if (priority === "medium") return "badge--medium";
  return "badge--low";
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filteredTasks.forEach((task) => {
    const taskElement = document.createElement("article");
    taskElement.className = `task-card ${task.completed ? "completed" : ""}`;

    taskElement.innerHTML = `
      <div class="task-left">
        <button
          class="task-check ${task.completed ? "checked" : ""}"
          data-action="toggle"
          data-id="${task.id}"
          aria-label="Toggle task status"
        ></button>
      </div>

      <div class="task-info">
        <p class="task-title">${escapeHtml(task.title)}</p>
        <div class="task-meta">
          <span class="badge badge--status">
            ${task.completed ? "Completed" : "Active"}
          </span>
          <span class="badge ${getPriorityClass(task.priority)}">
            ${capitalize(task.priority)} priority
          </span>
          <span class="badge badge--status">${task.createdAt}</span>
        </div>
      </div>

      <div class="task-actions">
        <button
          class="delete-btn"
          data-action="delete"
          data-id="${task.id}"
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
    `;

    taskList.appendChild(taskElement);
  });
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksEl.textContent = total;
  activeTasksEl.textContent = active;
  completedTasksEl.textContent = completed;
  completionRateEl.textContent = `${rate}%`;
  currentFilterLabelEl.textContent = capitalize(currentFilter);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

taskForm.addEventListener("submit", addTask);

searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
    updateStats();
  });
});

clearCompletedBtn.addEventListener("click", clearCompletedTasks);

taskList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const { action, id } = target.dataset;

  if (action === "toggle") {
    toggleTask(id);
  }

  if (action === "delete") {
    deleteTask(id);
  }
});

renderTasks();
updateStats();