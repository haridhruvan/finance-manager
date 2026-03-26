// 🌐 LIVE BACKEND API
const API = "https://finance-manager-api-bg2w.onrender.com";

// 🔐 TOKEN STORAGE
let token = localStorage.getItem("token");

// ================= REGISTER =================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      window.location.href = "login.html";
    }
  });
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message);
    }
  });
}

// ================= LOAD EXPENSES =================
async function loadExpenses() {
  const list = document.getElementById("expenseList");
  if (!list) return;

  const res = await fetch(`${API}/api/expenses`, {
    headers: {
      Authorization: token,
    },
  });

  const data = await res.json();
  list.innerHTML = "";

  data.forEach((exp) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${exp.title} - ₹${exp.amount}
      <button onclick="editExpense('${exp._id}', '${exp.title}', '${exp.amount}')">Edit</button>
      <button onclick="deleteExpense('${exp._id}')">Delete</button>
    `;
    list.appendChild(li);
  });
}

// ================= ADD EXPENSE =================
async function addExpense() {
  const title = document.getElementById("expenseName").value;
  const amount = document.getElementById("amount").value;

  await fetch(`${API}/api/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ title, amount }),
  });

  loadExpenses();
}

// ================= DELETE =================
async function deleteExpense(id) {
  await fetch(`${API}/api/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  loadExpenses();
}

// ================= EDIT =================
async function editExpense(id, oldTitle, oldAmount) {
  const newTitle = prompt("Edit title:", oldTitle);
  const newAmount = prompt("Edit amount:", oldAmount);

  if (!newTitle || !newAmount) return;

  await fetch(`${API}/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ title: newTitle, amount: newAmount }),
  });

  loadExpenses();
}

// ================= THEME TOGGLE =================
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// ================= AUTO LOAD =================
window.onload = () => {
  loadExpenses();
};