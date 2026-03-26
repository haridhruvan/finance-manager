// 🌐 BACKEND API
const API = "https://finance-manager-api-bg2w.onrender.com";

// 🔐 TOKEN
let token = localStorage.getItem("token");


// ================= WAKE SERVER (Render Fix) =================
async function wakeServer() {
  try {
    await fetch(API);
  } catch (err) {
    console.log("Waking server...");
  }
}


// ================= REGISTER =================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await wakeServer(); // 🔥 important

      const res = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully ✅");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Server not reachable ❌");
    }
  });
}


// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  // 🔥 If already logged in, skip login page
  if (token) {
    window.location.href = "index.html";
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await wakeServer(); // 🔥 important

      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful ✅");
        window.location.href = "index.html";
      } else {
        alert(data.message || "Login failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Server not reachable ❌");
    }
  });
}


// ================= PROTECT DASHBOARD =================
if (window.location.pathname.includes("index.html")) {
  if (!token) {
    alert("Please login first ❌");
    window.location.href = "login.html";
  }
}


// ================= LOAD EXPENSES =================
async function loadExpenses() {
  const list = document.getElementById("expenseList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/api/expenses`, {
      headers: {
        Authorization: token
      }
    });

    const data = await res.json();
    list.innerHTML = "";

    data.forEach((exp) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${exp.title} - ₹${exp.amount}
        <button onclick="deleteExpense('${exp._id}')">Delete</button>
      `;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Load error:", err);
  }
}


// ================= ADD EXPENSE =================
async function addExpense() {
  const title = document.getElementById("expenseName").value;
  const amount = document.getElementById("amount").value;

  if (!title || !amount) {
    alert("Enter all fields ❗");
    return;
  }

  try {
    await fetch(`${API}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ title, amount })
    });

    document.getElementById("expenseName").value = "";
    document.getElementById("amount").value = "";

    loadExpenses();

  } catch (err) {
    console.error("Add error:", err);
  }
}


// ================= DELETE =================
async function deleteExpense(id) {
  try {
    await fetch(`${API}/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token
      }
    });

    loadExpenses();

  } catch (err) {
    console.error("Delete error:", err);
  }
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}


// ================= AUTO LOAD =================
window.onload = () => {
  loadExpenses();
};