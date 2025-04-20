const addBtn = document.getElementById("addTaskBtn");
const taskInputContainer = document.getElementById("taskInputContainer");
const taskInput = document.getElementById("taskInput");
const saveIcon = document.getElementById("saveIcon");
const cancelIcon = document.getElementById("cancelIcon");
const taskList = document.getElementById("taskList");

let draggedItem = null;

// 🧱 할 일 생성 함수
function renderTask(taskText, completed = false) {
  const lines = taskText.split('\n');
  const title = lines[0];
  const details = lines.slice(1).join('\n');

  const li = document.createElement("li");
  li.className = "task";
  li.setAttribute("draggable", "true");

  if (completed) li.classList.add("completed");

  const checkbox = document.createElement("div");
  checkbox.className = "checkbox";
  if (completed) checkbox.classList.add("checked");

  const content = document.createElement("div");
  content.className = "task-content";

  const titleDiv = document.createElement("div");
  titleDiv.className = "task-title";
  titleDiv.textContent = title;

  const detailsDiv = document.createElement("div");
  detailsDiv.className = "task-details";
  detailsDiv.textContent = details;

  content.appendChild(titleDiv);
  if (details.trim()) content.appendChild(detailsDiv);

  li.appendChild(checkbox);
  li.appendChild(content);
  taskList.appendChild(li);

  // ✅ 완료 체크 토글
  checkbox.addEventListener("click", (e) => {
    e.stopPropagation();
    checkbox.classList.toggle("checked");
    li.classList.toggle("completed");
    saveTasksToLocalStorage();
  });

  // ✏️ 수정 모드 활성화
  content.addEventListener("click", () => {
    const editContainer = document.createElement("div");
    editContainer.className = "edit-container";

    const editArea = document.createElement("textarea");
    editArea.className = "edit-area";
    editArea.value = taskText;

    const actionBox = document.createElement("div");
    actionBox.className = "edit-actions";

    const save = document.createElement("span");
    save.textContent = "💾";

    const del = document.createElement("span");
    del.textContent = "🗑️";

    actionBox.appendChild(save);
    actionBox.appendChild(del);

    editContainer.appendChild(editArea);
    editContainer.appendChild(actionBox);

    content.replaceWith(editContainer);

    // 저장
    save.addEventListener("click", () => {
      const newText = editArea.value.trim();
      if (newText) {
        taskList.removeChild(li);
        renderTask(newText, li.classList.contains("completed"));
        saveTasksToLocalStorage();
      }
    });

    // 삭제
    del.addEventListener("click", () => {
      taskList.removeChild(li);
      saveTasksToLocalStorage();
    });
  });

  // 🪄 드래그 앤 드롭 이벤트
  li.addEventListener("dragstart", () => {
    draggedItem = li;
    setTimeout(() => li.classList.add("dragging"), 0);
  });

  li.addEventListener("dragend", () => {
    draggedItem = null;
    li.classList.remove("dragging");
  });

  li.addEventListener("dragover", (e) => e.preventDefault());

  li.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== li) {
      const bounding = li.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      const middle = bounding.height / 2;

      if (offset > middle) {
        taskList.insertBefore(draggedItem, li.nextSibling);
      } else {
        taskList.insertBefore(draggedItem, li);
      }
      saveTasksToLocalStorage();
    }
  });

  saveTasksToLocalStorage();
}

// 🔄 로컬 저장/불러오기
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll(".task").forEach(task => {
    const title = task.querySelector(".task-title")?.textContent || "";
    const details = task.querySelector(".task-details")?.textContent || "";
    const fullText = [title, details].filter(Boolean).join("\n");
    const completed = task.classList.contains("completed");
    tasks.push({ text: fullText, completed });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => renderTask(task.text, task.completed));
}

// ➕ 버튼 이벤트
addBtn.addEventListener("click", () => {
  taskInputContainer.classList.remove("hidden");
  taskInput.value = "";
  taskInput.focus();
});

// ❌ 취소
cancelIcon.addEventListener("click", () => {
  taskInputContainer.classList.add("hidden");
  taskInput.value = "";
});

// 💾 저장
saveIcon.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text) {
    renderTask(text);
    taskInput.value = "";
    taskInputContainer.classList.add("hidden");
  }
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(reg => console.log("Service Worker 등록됨:", reg))
      .catch(err => console.error("등록 실패:", err));
  });
}


// 🚀 초기 로딩 시
loadTasksFromLocalStorage();



