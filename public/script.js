let tasks = [];

async function fetchTasks() {
  const res = await fetch("/tasks");
  tasks = await res.json();
  console.log(tasks);
  render();
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${t.task} <button class="editBtn" onclick="editTask('${t._id}')">Edit</button> 
      <button class="deleteBtn" onclick="deleteTask('${t._id}')">Delete</button>
    `;

    list.appendChild(li);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");

  await fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: input.value }),
  });

  input.value = "";
  fetchTasks();
}

async function editTask(id) {
  const newTask = prompt("Edit task:");

  await fetch(`/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: newTask }),
  });

  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/tasks/${id}`, {
    method: "DELETE",
  });

  fetchTasks();
}

fetchTasks();
