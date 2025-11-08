// LOGIN SYSTEM
const loginContainer = document.getElementById("login-container");
const loginBtn = document.getElementById("login-btn");
const loginName = document.getElementById("login-name");
const usernameEl = document.getElementById("username");
const app = document.getElementById("app");

loginBtn.onclick = () => {
  if (loginName.value.trim() === "") return alert("Enter your name");
  localStorage.setItem("expenseUser", loginName.value);
  location.reload();
};

const savedUser = localStorage.getItem("expenseUser");
if (savedUser) {
  loginContainer.style.display = "none";
  app.style.display = "block";
  usernameEl.textContent = savedUser;
}

// MAIN VARIABLES
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const filterMonth = document.getElementById("filter-month");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingID = null;

// ADD / EDIT
document.getElementById("add-btn").onclick = () => {
  if (!text.value || !amount.value) return alert("Fill all fields");

  const transaction = {
    id: editingID || Math.random(),
    text: text.value,
    amount: Number(amount.value),
    category: category.value,
    date: new Date().toISOString()
  };

  if (editingID) {
    transactions = transactions.map(t => t.id === editingID ? transaction : t);
    editingID = null;
  } else {
    transactions.push(transaction);
  }

  saveData();
  loadUI();

  text.value = "";
  amount.value = "";
};

// DELETE
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  loadUI();
}

// EDIT
function editTransaction(id) {
  const t = transactions.find(x => x.id === id);
  text.value = t.text;
  amount.value = t.amount;
  category.value = t.category;
  editingID = id;
}

// SAVE
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// UI LOAD
function loadUI() {
  list.innerHTML = "";

  let filtered = transactions;

  if (filterMonth.value) {
    filtered = filtered.filter(t => t.date.startsWith(filterMonth.value));
  }

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.classList.add(t.amount < 0 ? "minus" : "plus");
    li.innerHTML = `
      ${t.text} (${t.category})
      <span>₹${t.amount}</span>
      <div>
        <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
      </div>
    `;
    list.appendChild(li);
  });

  updateSummary(filtered);
  updateChart(filtered);
}

// SUMMARY FIXED
function updateSummary(data) {
  const income = data.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const expense = data.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);

  balanceEl.textContent = `₹${(income - expense).toFixed(2)}`;
  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${expense.toFixed(2)}`;
}

// PIE CHART
let chart = null;

function updateChart(data) {
  const income = data.filter(t => t.amount > 0).reduce((a,b)=>a+b.amount,0);
  const expense = data.filter(t => t.amount < 0).reduce((a,b)=>a+Math.abs(b.amount),0);

  const ctx = document.getElementById("pieChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["green", "red"]
      }]
    }
  });
}

// FILTER
filterMonth.onchange = () => loadUI();

// PDF EXPORT
document.getElementById("pdf-btn").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("Expense Report", 10, 10);

  let y = 20;
  transactions.forEach(t => {
    pdf.text(`${t.text} - ₹${t.amount} (${t.category})`, 10, y);
    y += 8;
  });

  pdf.save("expense-report.pdf");
};

// INIT
loadUI();
