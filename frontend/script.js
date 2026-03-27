const API =
  window.APP_CONFIG?.API_BASE_URL ||
  (window.location.protocol === "file:"
    ? "http://localhost:5000"
    : `${window.location.protocol}//${window.location.hostname}:5000`);

let token = localStorage.getItem("token");
let expensesCache = [];
let selectedExpenseId = null;

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

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function getCategoryTotals(expenses) {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});
}

function renderCategoryRows(totals) {
  const categoryList = document.getElementById("categoryList");
  const analyticsCategories = document.getElementById("analyticsCategories");
  const topCategory = document.getElementById("topCategory");

  if (!categoryList || !analyticsCategories || !topCategory) {
    return;
  }

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const topEntries = (entries.length ? entries : [["Other", 0]]).slice(0, 4);
  const palette = ["dot-blue", "dot-white", "dot-muted", "dot-blue"];
  const maxAmount = topEntries.reduce((sum, [, amount]) => Math.max(sum, amount), 1);

  topCategory.textContent = topEntries[0][0];

  categoryList.innerHTML = topEntries
    .map(
      ([name, amount], index) => `
        <div class="category-row">
          <span class="dot ${palette[index % palette.length]}"></span>
          <span>${name}</span>
          <strong>${formatCurrency(amount)}</strong>
        </div>
      `
    )
    .join("");

  analyticsCategories.innerHTML = topEntries
    .map(
      ([name, amount]) => `
        <div class="breakdown-row">
          <span>${name}</span>
          <strong>${formatCurrency(amount)}</strong>
          <div class="progress"><span style="width: ${(amount / maxAmount) * 100}%"></span></div>
        </div>
      `
    )
    .join("");
}

function renderTransactions(expenses) {
  const list = document.getElementById("expenseList");
  if (!list) {
    return;
  }

  if (!expenses.length) {
    list.innerHTML = `
      <div class="transaction-item">
        <div class="transaction-icon">+</div>
        <div class="transaction-meta">
          <strong>No transactions yet</strong>
          <small>Add your first expense to activate the dashboard.</small>
        </div>
        <div class="transaction-amount">
          <strong>${formatCurrency(0)}</strong>
          <small>Ready</small>
        </div>
      </div>
    `;
    return;
  }

  list.innerHTML = expenses
    .slice(0, 8)
    .map((expense) => {
      const category = expense.category || "Other";
      const dateText = expense.date
        ? new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Today";

      return `
        <div class="transaction-item">
          <div class="transaction-icon">${category.slice(0, 1).toUpperCase()}</div>
          <div class="transaction-meta">
            <strong>${expense.title}</strong>
            <small>${dateText} • ${category}</small>
          </div>
          <div class="transaction-amount">
            <strong>${formatCurrency(expense.amount)}</strong>
            <small>Expense</small>
          </div>
          <div class="transaction-actions">
            <button class="mini-btn" type="button" onclick="editExpense('${expense._id}')">Edit</button>
            <button class="mini-btn danger" type="button" onclick="deleteExpense('${expense._id}')">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderInsights(expenses) {
  const liquidityTotal = document.getElementById("liquidityTotal");
  const monthlySpending = document.getElementById("monthlySpending");
  const spendingDelta = document.getElementById("spendingDelta");
  const savingsInsight = document.getElementById("savingsInsight");
  const analyticsHeadline = document.getElementById("analyticsHeadline");
  const analyticsCopy = document.getElementById("analyticsCopy");

  if (!liquidityTotal || !monthlySpending || !spendingDelta || !savingsInsight || !analyticsHeadline || !analyticsCopy) {
    return;
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const balance = Math.max(150000 - totalSpent, 0);
  const recentSlice = expenses.slice(0, 3);
  const recentSpend = recentSlice.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const avgSpend = expenses.length ? totalSpent / expenses.length : 0;
  const change = avgSpend ? Math.round((recentSpend / Math.max(avgSpend, 1)) * 12) : 0;

  liquidityTotal.textContent = formatCurrency(balance);
  monthlySpending.textContent = formatCurrency(totalSpent);
  spendingDelta.textContent = expenses.length
    ? `${change}% pulse versus your average expense size.`
    : "Ready for your first transaction.";
  savingsInsight.textContent = expenses.length
    ? `You could recover ${formatCurrency(totalSpent * 0.18)} by trimming the highest category this cycle.`
    : "Add a few expenses and Vault will surface insights here.";
  analyticsHeadline.textContent = expenses.length
    ? `You spent ${change}% more on your latest activity wave.`
    : "You spent 0% more this month.";
  analyticsCopy.textContent = expenses.length
    ? `Vault analyzed ${expenses.length} expenses and sees optimization room around ${formatCurrency(totalSpent * 0.12)}.`
    : "Once your expenses are loaded, Vault will compare the latest entries and show patterns here.";
}

function renderDashboard(expenses) {
  expensesCache = expenses;
  renderTransactions(expenses);
  renderInsights(expenses);
  renderCategoryRows(getCategoryTotals(expenses));
}

function openExpenseModal() {
  const modal = document.getElementById("expenseModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeExpenseModal() {
  const modal = document.getElementById("expenseModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  resetExpenseForm();
}

function resetExpenseForm() {
  selectedExpenseId = null;
  const expenseId = document.getElementById("expenseId");
  const titleInput = document.getElementById("expenseName");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("expenseCategory");
  const saveButton = document.getElementById("saveExpenseButton");
  const deleteButton = document.getElementById("deleteExpenseButton");

  if (expenseId) expenseId.value = "";
  if (titleInput) titleInput.value = "";
  if (amountInput) amountInput.value = "";
  if (categoryInput) categoryInput.value = "Dining";
  if (saveButton) saveButton.textContent = "Save Transaction";
  if (deleteButton) deleteButton.classList.add("hidden");
}

function populateExpenseForm(expense) {
  selectedExpenseId = expense._id;
  const expenseId = document.getElementById("expenseId");
  const titleInput = document.getElementById("expenseName");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("expenseCategory");
  const saveButton = document.getElementById("saveExpenseButton");
  const deleteButton = document.getElementById("deleteExpenseButton");

  if (expenseId) expenseId.value = expense._id;
  if (titleInput) titleInput.value = expense.title || "";
  if (amountInput) amountInput.value = expense.amount || "";
  if (categoryInput) categoryInput.value = expense.category || "Other";
  if (saveButton) saveButton.textContent = "Update Transaction";
  if (deleteButton) deleteButton.classList.remove("hidden");
}

function activateScreen(target) {
  const screens = document.querySelectorAll(".screen");
  const navButtons = document.querySelectorAll(".nav-btn");

  screens.forEach((screen) => {
    screen.classList.toggle("screen-active", screen.dataset.screen === target);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.navTarget === target);
  });
}

function attachNavigation() {
  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.navTarget;

      if (target === "add") {
        resetExpenseForm();
        openExpenseModal();
        return;
      }

      activateScreen(target);
      closeExpenseModal();
    });
  });

  const closeButton = document.getElementById("closeExpenseModal");
  if (closeButton) {
    closeButton.addEventListener("click", closeExpenseModal);
  }

  const modal = document.getElementById("expenseModal");
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeExpenseModal();
      }
    });
  }

  const deleteButton = document.getElementById("deleteExpenseButton");
  if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
      if (selectedExpenseId) {
        await deleteExpense(selectedExpenseId);
      }
    });
  }
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
      alert("Vault created successfully");
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
    renderDashboard(data);
  } catch (error) {
    list.innerHTML = `<div class="transaction-item"><div class="transaction-icon">!</div><div class="transaction-meta"><strong>Connection issue</strong><small>${error.message}</small></div><div class="transaction-amount"><strong>Retry</strong></div></div>`;
  }
}

async function saveExpense() {
  const titleInput = document.getElementById("expenseName");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("expenseCategory");
  const title = titleInput.value.trim();
  const amount = amountInput.value;
  const category = categoryInput?.value || "Other";

  if (!title || !amount) {
    alert("Enter both expense title and amount");
    return;
  }

  try {
    const isEditing = Boolean(selectedExpenseId);
    const endpoint = isEditing ? `${API}/api/expenses/${selectedExpenseId}` : `${API}/api/expenses`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, amount, category }),
    });

    await parseResponse(res);
    closeExpenseModal();
    await loadExpenses();
  } catch (error) {
    alert(error.message);
  }
}

function editExpense(expenseId) {
  const expense = expensesCache.find((item) => item._id === expenseId);
  if (!expense) {
    return;
  }

  populateExpenseForm(expense);
  openExpenseModal();
}

async function deleteExpense(expenseId) {
  if (!expenseId) {
    return;
  }

  const confirmed = window.confirm("Delete this expense from your vault?");
  if (!confirmed) {
    return;
  }

  try {
    const res = await fetch(`${API}/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await parseResponse(res);
    closeExpenseModal();
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
  attachNavigation();
  renderDashboard(expensesCache);
  loadExpenses();
};
