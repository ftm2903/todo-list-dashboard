flatpickr("#dateInput", { dateFormat: "M d, Y" });
flatpickr("#timeInput", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "h:i K",
});

const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const tagInput = document.getElementById("taskTagInput");
const addTaskBtn = document.getElementById("addTask");
const clearBtn = document.getElementById("clearBtn");
const tbodyTable = document.getElementById("tbodyTable");
const countLabel = document.querySelector(".count");

const errorModal = document.getElementById("errorModal");
const modalErrorMessage = document.getElementById("modalErrorMessage");
const closeModalBtn = document.getElementById("closeModal");

let selectedColor = "";
const colorDots = document.querySelectorAll(".color-picker .dot");
colorDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    colorDots.forEach((d) => d.classList.remove("active"));
    dot.classList.add("active");
    selectedColor = dot.style.backgroundColor;
    taskInput.style.backgroundColor = selectedColor;
  });
});

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

renderTasks();

addTaskBtn.addEventListener("click", () => {
  let missingFields = [];
  if (!taskInput.value.trim()) missingFields.push("Task Title");
  if (!dateInput.value.trim()) missingFields.push("Date");
  if (!timeInput.value.trim()) missingFields.push("Time");

  if (missingFields.length > 0) {
    showModal(
      `Please fill in the following fields: <strong>${missingFields.join(", ")}</strong>`,
    );
    return;
  }

  const newTask = {
    id: Date.now(),
    title: taskInput.value.trim(),
    color: selectedColor || "#f8f9fa",
    date: dateInput.value,
    time: timeInput.value,
    tag: tagInput.value.trim() || "General",
    status: "Not Started",
  };

  tasks.push(newTask);
  saveToLocalStorage();
  renderTasks();
  clearFields();
});

clearBtn.addEventListener("click", clearFields);

tbodyTable.addEventListener("click", (e) => {
  const target = e.target;
  const row = target.closest("tr");
  if (!row) return;
  const taskId = parseInt(row.dataset.id);

  if (target.closest(".remove")) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveToLocalStorage();
    renderTasks();
  }

  if (target.closest(".status-badge")) {
    const task = tasks.find((t) => t.id === taskId);
    if (task.status === "Not Started") {
      task.status = "In Progress";
    } else if (task.status === "In Progress") {
      task.status = "Done";
    } else {
      task.status = "Not Started";
    }
    saveToLocalStorage();
    renderTasks();
  }

  if (target.closest(".edit")) {
    const editBtn = target.closest(".edit");
    const isEditing = row.classList.contains("editing");

    if (!isEditing) {
      row.classList.add("editing");
      editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';

      const titleSpan = row.querySelector(".task-badge");
      const dateCell = row.cells[2];
      const timeCell = row.cells[3];
      const tagSpan = row.querySelector(".tag-badge");

      titleSpan.innerHTML = `<input type="text" class="edit-input edit-title" value="${titleSpan.textContent}">`;
      dateCell.innerHTML = `<input type="text" class="edit-input edit-date" value="${dateCell.textContent}">`;
      timeCell.innerHTML = `<input type="text" class="edit-input edit-time" value="${timeCell.textContent}">`;
      tagSpan.innerHTML = `<input type="text" class="edit-input edit-tag" value="${tagSpan.textContent}">`;

      flatpickr(dateCell.querySelector("input"), { dateFormat: "M d, Y" });
      flatpickr(timeCell.querySelector("input"), {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
      });
    } else {
      const updatedTitle = row.querySelector(".edit-title").value.trim();
      const updatedDate = row.querySelector(".edit-date").value.trim();
      const updatedTime = row.querySelector(".edit-time").value.trim();
      const updatedTag = row.querySelector(".edit-tag").value.trim();

      if (!updatedTitle || !updatedDate || !updatedTime) {
        showModal("Fields cannot be empty during edit!");
        return;
      }

      const task = tasks.find((t) => t.id === taskId);
      task.title = updatedTitle;
      task.date = updatedDate;
      task.time = updatedTime;
      task.tag = updatedTag || "General";

      saveToLocalStorage();
      renderTasks();
    }
  }
});

function renderTasks() {
  tbodyTable.innerHTML = "";

  tasks.forEach((task, index) => {
    const row = document.createElement("tr");
    row.dataset.id = task.id;

    let statusClass = "started";
    if (task.status === "In Progress") statusClass = "progress";
    if (task.status === "Done") statusClass = "done";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td><span class="task-badge" style="background-color: ${task.color};">${task.title}</span></td>
      <td>${task.date}</td>
      <td>${task.time}</td>
      <td><span class="task-badge tag-badge" style="background-color: #e2e8f0; color: #4a5568;">${task.tag}</span></td>
      <td><span class="status-badge ${statusClass}">${task.status}</span></td>
      <td><button class="icon-btn edit"><i class="fa-solid fa-pen-to-square"></i></button></td>
      <td><button class="icon-btn remove"><i class="fa-solid fa-trash"></i></button></td>
    `;

    tbodyTable.appendChild(row);
  });

  countLabel.textContent = `Total Tasks: ${tasks.length}`;
}

function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showModal(message) {
  modalErrorMessage.innerHTML = message;
  errorModal.classList.add("active");
}

closeModalBtn.addEventListener("click", () => {
  errorModal.classList.remove("active");
});

window.addEventListener("click", (e) => {
  if (e.target === errorModal) {
    errorModal.classList.remove("active");
  }
});

function clearFields() {
  taskInput.value = "";
  taskInput.style.backgroundColor = "";
  dateInput.value = "";
  timeInput.value = "";
  tagInput.value = "";
  selectedColor = "";
  colorDots.forEach((d) => d.classList.remove("active"));
}
