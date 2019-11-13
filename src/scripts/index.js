import "../styles/index.scss";
import eventFire from "./helpers/eventFire";
const getById = s => document.getElementById(s);
const form = getById("formCreate");
const todosNode = getById("todos");
const closeModal = getById("closeModal");
const submitButton = getById("submitButton");
const openForm = getById("openForm");
let titleHandler = getById("formTitle");
let descriptionHandler = getById("formDescription");
let priorityHandler = getById("formPriority");
const searchTodos = getById("searchTodos");
const dropdownPriority = getById("dropdownPriority");
const dropdownStatus = getById("dropdownStatus");

const state = {
  todos: JSON.parse(localStorage.getItem("todos")) || [],
  todosFiltered: [],
  editing: "",
  filters: {
    status: JSON.parse(localStorage.getItem("filters_status")) || "all",
    priority: JSON.parse(localStorage.getItem("filters_priority")) || "all"
  }
};
dropdownPriority.innerText = state.filters.priority;
dropdownStatus.innerText = state.filters.status;

class Todo {
  constructor(title, description, priority) {
    this.title = title.value;
    this.description = description.value;
    this.priority = priority.innerText;
    this.id = `${Date.now()}`;
    this.status = "open";
  }
}

const render = todos => {
  todosNode.innerHTML = "";
  todos.map(task => {
    todosNode.innerHTML += `
        <div class="col-sm-3 mb-4 ${task.status}" id="${task.id}">
          <div class="card">
            <div class="doneSymbol"></div>
            <div class="card-body">
              <h5 class="card-title">	${task.title}</h5>
              <p class="card-text">${task.description}</p>
              <div class="d-flex justify-content-between align-items-center w-100">
                <span class="btn btn-outline-info mr-3" data-id="${task.id}">${task.priority}</span>
                <div class="dropdown">
                  <button class="btn btn-info dropdown-toggle" type="button"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" data-rel="${task.id}">
                    <a class="dropdown-item custom" href="#" data-action="done">done</a>
                    <a class="dropdown-item custom" href="#" data-action="edit">edit</a>
                    <a class="dropdown-item custom" href="#" data-action="delete">delete</a>
                  </div>
                </div>
              </div>      
            </div>
          </div>
        </div>
      `;
  });
};

const setData = (title, description, priority) => {
  descriptionHandler.value = title || "";
  titleHandler.value = description || "";
  priorityHandler.innerText = priority || "high";
};

form.addEventListener("submit", e => {
  e.preventDefault();
  if (state.editing) {
    state.todos.map(todo => {
      if (todo.id === state.editing) {
        todo.description = descriptionHandler.value;
        todo.title = titleHandler.value;
        todo.priority = priorityHandler.innerText;
      }
    });
    localStorage.setItem("todos", JSON.stringify(state.todos));
    setData();
    state.editing = "";
    submitButton.value = "Create";
    eventFire(closeModal, "click");
    return render(state.todos);
  }
  eventFire(closeModal, "click");
  const newTask = new Todo(titleHandler, descriptionHandler, priorityHandler);
  state.todos.push(newTask);
  localStorage.setItem("todos", JSON.stringify(state.todos));
  filter();
  [titleHandler, descriptionHandler].forEach(i => (i.value = ""));
});

const filter = (selector, value) => {
  if (selector) {
    state.filters[selector] = value;
    localStorage.setItem(`filters_${selector}`, JSON.stringify(value));
  }
  state.todosFiltered = state.todos;
  for (let key in state.filters) {
    if (state.filters[key] !== "all") {
      state.todosFiltered = state.todosFiltered.filter(
        todo => state.filters[key] === todo[key]
      );
    }
  }
  render(state.todosFiltered);
};
filter();

document.addEventListener("click", e => {
  if (e.target.classList.value === "dropdown-item") {
    const dropdownNode = getById(e.target.parentNode.dataset.rel);
    [e.target.innerText, dropdownNode.innerText] = [
      dropdownNode.innerText,
      e.target.innerText
    ];
    if (dropdownNode.dataset.search)
      filter(dropdownNode.dataset.search, dropdownNode.innerText);
  }
  const el = e.target;
  if (el.dataset.action) {
    if (el.dataset.action === "done") {
      getById(el.parentNode.dataset.rel).classList.add("done");
      state.todos.map(i => {
        if (i.id === el.parentNode.dataset.rel) i.status = "done";
      });
    }
    if (el.dataset.action === "delete") {
      state.todos = state.todos.filter(
        todo => todo.id !== el.parentNode.dataset.rel
      );
      render(state.todos);
    }
    if (el.dataset.action === "edit") {
      let [editItem] = state.todos.filter(
        todo => todo.id === el.parentNode.dataset.rel
      );
      setData(editItem.title, editItem.description, editItem.priority);
      submitButton.value = "Edit task";
      state.editing = editItem.id;
      eventFire(openForm, "click");
    }
    localStorage.setItem("todos", JSON.stringify(state.todos));
  }
});

searchTodos.addEventListener("input", e => {
  const searched = e.target.value.trim();
  state.todosFiltered = state.todos.filter(i => i.title.includes(searched));
  filter();
});
