const STORAGE_KEY = "daylist.tasks.v1";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyHint = document.querySelector("#empty-hint");
const summary = document.querySelector("#task-summary");
const clearDoneButton = document.querySelector("#clear-done");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let activeFilter = "all";

renderTasks();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) {
    input.focus();
    return;
  }

  tasks.unshift({
    id: makeId(),
    title,
    completed: false,
  });

  input.value = "";
  saveTasks();
  renderTasks();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

clearDoneButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "done") return task.completed;
    return true;
  });

  taskList.replaceChildren();
  visibleTasks.forEach((task) => taskList.append(createTaskElement(task)));

  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;
  summary.textContent = tasks.length
    ? `共 ${tasks.length} 件 · 还剩 ${remaining} 件待完成`
    : "还没有任务";

  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;
  clearDoneButton.hidden = completed === 0;

  if (activeFilter === "active") {
    emptyTitle.textContent = "待办清零了";
    emptyHint.textContent = "有新任务时，再回来记下来。";
  } else if (activeFilter === "done") {
    emptyTitle.textContent = "还没有完成的任务";
    emptyHint.textContent = "完成一件后，它会出现在这里。";
  } else {
    emptyTitle.textContent = "先写下第一件小事";
    emptyHint.textContent = "完成后，点一下圆圈就能打勾。";
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-done" : ""}`;

  const checkButton = document.createElement("button");
  checkButton.className = "task-check";
  checkButton.type = "button";
  checkButton.setAttribute("aria-label", task.completed ? "标记为待完成" : "标记为已完成");
  checkButton.setAttribute("aria-pressed", String(task.completed));
  checkButton.innerHTML = task.completed
    ? '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8.2 3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    : "";
  checkButton.addEventListener("click", () => toggleTask(task.id));

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `删除任务：${task.title}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(checkButton, title, deleteButton);
  return item;
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => task.id === taskId
    ? { ...task, completed: !task.completed }
    : task);
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}
