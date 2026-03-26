// =======================
// RUN AFTER PAGE LOAD
// =======================
document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // LOGIN
  // =======================
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("Login successful ✅");
          window.location.href = "dashboard.html";
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Login error");
      }
    });
  }

  // =======================
  // REGISTER
  // =======================
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("http://localhost:5000/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (data._id) {
          alert("Registered successfully ✅");
          window.location.href = "login.html";
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Register error");
      }
    });
  }

});


// =======================
// DASHBOARD FUNCTIONS
// =======================

 // ADD EXPENSE
function addExpense() {
  const name = document.getElementById("expenseName").value;
  const amount = document.getElementById("amount").value;

  if (!name || !amount) {
    alert("Enter all fields");
    return;
  }

  const list = document.getElementById("expenseList");

  const li = document.createElement("li");

  li.innerHTML = `
    <span>${name} - ₹${amount}</span>
    <div class="btn-group">
      <button onclick="editExpense(this)">Edit</button>
      <button onclick="deleteExpense(this)">Delete</button>
    </div>
  `;

  list.appendChild(li);

  document.getElementById("expenseName").value = "";
  document.getElementById("amount").value = "";
}


// DELETE
function deleteExpense(btn) {
  btn.parentElement.parentElement.remove();
}


// EDIT
function editExpense(btn) {
  const li = btn.parentElement.parentElement;
  const text = li.querySelector("span").innerText;

  const [name, amount] = text.split(" - ₹");

  const newName = prompt("Edit name:", name);
  const newAmount = prompt("Edit amount:", amount);

  if (newName && newAmount) {
    li.querySelector("span").innerText = `${newName} - ₹${newAmount}`;
  }
}


// THEME
function toggleTheme() {
  document.body.classList.toggle("dark");
}