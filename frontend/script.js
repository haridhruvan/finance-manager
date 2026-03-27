const API =
  window.APP_CONFIG?.API_BASE_URL ||
  (window.location.protocol === "file:"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.hostname}:5000`);

let token = localStorage.getItem("token");

async function parseResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch (error) {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      await parseResponse(res);
      alert("Registered successfully");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(res);
      localStorage.setItem("token", data.token);
      token = data.token;
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

if (window.location.pathname.includes("index.html") && !token) {
  window.location.href = "login.html";
}

async function loadExpenses() {
  const list = document.getElementById("expenseList");
  if (!list || !token) {
    return;
  }

  try {
    const res = await fetch(`${API}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(res);
    list.innerHTML = "";

    data.forEach((expense) => {
      const li = document.createElement("li");
      li.textContent = `${expense.title} - Rs ${expense.amount}`;
      list.appendChild(li);
    });
  } catch (error) {
    list.innerHTML = `<li>${error.message}</li>`;
  }
}

async function addExpense() {
  const titleInput = document.getElementById("expenseName");
  const amountInput = document.getElementById("amount");
  const title = titleInput.value.trim();
  const amount = amountInput.value;

  if (!title || !amount) {
    alert("Enter both expense name and amount");
    return;
  }

  try {
    const res = await fetch(`${API}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, amount }),
    });

    await parseResponse(res);
    titleInput.value = "";
    amountInput.value = "";
    await loadExpenses();
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  token = null;
  window.location.href = "login.html";
}

window.onload = () => {
  loadExpenses();
};
