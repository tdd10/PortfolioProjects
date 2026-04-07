const roleRank = { kid: 1, parent: 2, admin: 3 };
const roleLabel = { kid: "Kid", parent: "Parent", admin: "Admin" };
const canAccess = (role, minRole) => roleRank[role] >= roleRank[minRole];

const makeStore = (key, fallback) => {
  const load = () => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  const save = (value) => localStorage.setItem(key, JSON.stringify(value));
  return { load, save };
};

const defaultProfiles = [
  { id: crypto.randomUUID(), name: "Family Admin", role: "admin", pin: "1234" },
  { id: crypto.randomUUID(), name: "Parent", role: "parent", pin: "" },
  { id: crypto.randomUUID(), name: "Kid", role: "kid", pin: "" }
];

const stores = {
  profiles: makeStore("familyhub-profiles", defaultProfiles),
  activeProfileId: makeStore("familyhub-active-profile-id", defaultProfiles[0].id),
  permissions: makeStore("familyhub-permissions", {
    events: "kid",
    groceries: "kid",
    chores: "kid",
    notes: "parent"
  }),
  events: makeStore("familyhub-events", []),
  groceries: makeStore("familyhub-grocery", []),
  chores: makeStore("familyhub-chores", [])
};

let profiles = stores.profiles.load();
let activeProfileId = stores.activeProfileId.load();
let permissions = stores.permissions.load();
let events = stores.events.load();
let groceries = stores.groceries.load();
let chores = stores.chores.load();

if (!profiles.length) {
  profiles = defaultProfiles;
  stores.profiles.save(profiles);
}

if (!profiles.some((p) => p.id === activeProfileId)) {
  activeProfileId = profiles[0].id;
  stores.activeProfileId.save(activeProfileId);
}

const getActiveProfile = () => profiles.find((p) => p.id === activeProfileId) || profiles[0];
const isAdmin = () => getActiveProfile().role === "admin";
const canEdit = () => roleRank[getActiveProfile().role] >= roleRank.parent;

const activeProfileSelect = document.querySelector("#active-profile");
const activeRole = document.querySelector("#active-role");
const profileList = document.querySelector("#profile-list");

const profileForm = document.querySelector("#profile-form");
const profileName = document.querySelector("#profile-name");
const profileRole = document.querySelector("#profile-role");
const profilePin = document.querySelector("#profile-pin");

const permissionsForm = document.querySelector("#permissions-form");
const permEvents = document.querySelector("#perm-events");
const permGroceries = document.querySelector("#perm-groceries");
const permChores = document.querySelector("#perm-chores");
const permNotes = document.querySelector("#perm-notes");

const eventForm = document.querySelector("#event-form");
const eventTitle = document.querySelector("#event-title");
const eventDate = document.querySelector("#event-date");
const eventList = document.querySelector("#event-list");

const groceryForm = document.querySelector("#grocery-form");
const groceryItem = document.querySelector("#grocery-item");
const groceryList = document.querySelector("#grocery-list");

const choreForm = document.querySelector("#chore-form");
const choreItem = document.querySelector("#chore-item");
const choreList = document.querySelector("#chore-list");

const notesEl = document.querySelector("#notes");
notesEl.value = localStorage.getItem("familyhub-notes") || "";

const sectionKeys = {
  "#events-section": "events",
  "#groceries-section": "groceries",
  "#chores-section": "chores",
  "#notes-section": "notes"
};

const renderList = (items, listEl, options) => {
  const { allowToggle, allowDelete, onToggle, onDelete, labelFormat } = options;
  listEl.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = labelFormat ? labelFormat(item) : item.label;
    if (item.done) text.classList.add("done");

    const actions = document.createElement("div");
    actions.className = "actions";

    if (allowToggle) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.textContent = item.done ? "Undo" : "Done";
      toggle.addEventListener("click", () => onToggle(index));
      actions.append(toggle);
    }

    if (allowDelete) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => onDelete(index));
      actions.append(remove);
    }

    li.append(text);
    if (actions.childNodes.length) li.append(actions);
    listEl.append(li);
  });
};

const renderProfiles = () => {
  const active = getActiveProfile();

  activeProfileSelect.innerHTML = "";
  profiles.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = `${p.name} (${roleLabel[p.role]})`;
    activeProfileSelect.append(option);
  });
  activeProfileSelect.value = active.id;

  activeRole.textContent = `Role: ${roleLabel[active.role]}`;

  profileList.innerHTML = "";
  profiles.forEach((p) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${p.name} — ${roleLabel[p.role]}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    if (isAdmin() && p.id !== active.id) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        profiles = profiles.filter((profile) => profile.id !== p.id);
        stores.profiles.save(profiles);
        renderAll();
      });
      actions.append(remove);
    }

    li.append(text);
    if (actions.childNodes.length) li.append(actions);
    profileList.append(li);
  });
};

const applyVisibility = () => {
  const role = getActiveProfile().role;
  Object.entries(sectionKeys).forEach(([selector, key]) => {
    const section = document.querySelector(selector);
    const minRole = permissions[key];
    section.hidden = !canAccess(role, minRole);
  });

  document.querySelector("#admin-panel").hidden = role !== "admin";

  const editingAllowed = canEdit();
  [eventForm, groceryForm, choreForm].forEach((form) => {
    Array.from(form.elements).forEach((el) => {
      el.disabled = !editingAllowed;
    });
  });

  notesEl.disabled = !editingAllowed;
};

const renderEvents = () => {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  renderList(sorted, eventList, {
    allowToggle: false,
    allowDelete: canEdit(),
    labelFormat: (item) => `${item.date} — ${item.label}`,
    onToggle: () => {},
    onDelete: (idx) => {
      const match = sorted[idx];
      events = events.filter((e) => !(e.date === match.date && e.label === match.label));
      stores.events.save(events);
      renderEvents();
    }
  });
};

const renderGroceries = () => {
  renderList(groceries, groceryList, {
    allowToggle: true,
    allowDelete: canEdit(),
    onToggle: (idx) => {
      groceries[idx].done = !groceries[idx].done;
      stores.groceries.save(groceries);
      renderGroceries();
    },
    onDelete: (idx) => {
      groceries.splice(idx, 1);
      stores.groceries.save(groceries);
      renderGroceries();
    }
  });
};

const renderChores = () => {
  renderList(chores, choreList, {
    allowToggle: true,
    allowDelete: canEdit(),
    onToggle: (idx) => {
      chores[idx].done = !chores[idx].done;
      stores.chores.save(chores);
      renderChores();
    },
    onDelete: (idx) => {
      chores.splice(idx, 1);
      stores.chores.save(chores);
      renderChores();
    }
  });
};

const renderAll = () => {
  permEvents.value = permissions.events;
  permGroceries.value = permissions.groceries;
  permChores.value = permissions.chores;
  permNotes.value = permissions.notes;

  renderProfiles();
  applyVisibility();
  renderEvents();
  renderGroceries();
  renderChores();
};

activeProfileSelect.addEventListener("change", () => {
  const next = profiles.find((p) => p.id === activeProfileSelect.value);
  if (!next) return;

  if (next.role === "admin") {
    const inputPin = prompt("Enter admin PIN");
    if (inputPin !== next.pin) {
      alert("Incorrect PIN.");
      activeProfileSelect.value = activeProfileId;
      return;
    }
  }

  activeProfileId = next.id;
  stores.activeProfileId.save(activeProfileId);
  renderAll();
});

profileRole.addEventListener("change", () => {
  profilePin.required = profileRole.value === "admin";
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin()) return;

  const name = profileName.value.trim();
  const role = profileRole.value;
  const pin = profilePin.value.trim();

  if (!name) return;
  if (role === "admin" && pin.length < 4) {
    alert("Admin PIN must be at least 4 characters.");
    return;
  }

  profiles.push({ id: crypto.randomUUID(), name, role, pin });
  stores.profiles.save(profiles);
  profileForm.reset();
  profilePin.required = false;
  renderAll();
});

permissionsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isAdmin()) return;

  permissions = {
    events: permEvents.value,
    groceries: permGroceries.value,
    chores: permChores.value,
    notes: permNotes.value
  };

  stores.permissions.save(permissions);
  renderAll();
});

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!canEdit()) return;
  events.push({ label: eventTitle.value.trim(), date: eventDate.value, done: false });
  stores.events.save(events);
  eventForm.reset();
  renderEvents();
});

groceryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!canEdit()) return;
  groceries.push({ label: groceryItem.value.trim(), done: false });
  stores.groceries.save(groceries);
  groceryForm.reset();
  renderGroceries();
});

choreForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!canEdit()) return;
  chores.push({ label: choreItem.value.trim(), done: false });
  stores.chores.save(chores);
  choreForm.reset();
  renderChores();
});

notesEl.addEventListener("input", () => {
  if (!canEdit()) return;
  localStorage.setItem("familyhub-notes", notesEl.value);
});

renderAll();
