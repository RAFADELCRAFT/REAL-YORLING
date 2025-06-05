// Global variables
let currentUser = null
let users = []
let receipts = []
let currentPhoneNumber = ""

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadData()
  setupEventListeners()
  updatePinDots()
})

// Load data from localStorage
function loadData() {
  // Load users
  const savedUsers = localStorage.getItem("yorling_users")
  if (savedUsers) {
    users = JSON.parse(savedUsers)
  } else {
    // Initialize with admin user
    users = [
      {
        id: "admin_001",
        phoneNumber: "1234567890",
        pin: "1234",
        isActive: true,
        isAdmin: true,
        fullName: "Administrador",
        balance: 1000000,
        ipAddress: getCurrentIP(),
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    ]
    saveUsers()
  }

  // Load receipts
  const savedReceipts = localStorage.getItem("yorling_receipts")
  if (savedReceipts) {
    receipts = JSON.parse(savedReceipts)
  }
}

// Save data to localStorage
function saveUsers() {
  localStorage.setItem("yorling_users", JSON.stringify(users))
}

function saveReceipts() {
  localStorage.setItem("yorling_receipts", JSON.stringify(receipts))
}

// Get current IP (simulated)
function getCurrentIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Register form
  document.getElementById("registerForm").addEventListener("submit", handleRegister)

  // PIN form
  document.getElementById("pinForm").addEventListener("submit", handlePinSubmit)

  // PIN input for dots update
  document.getElementById("userPin").addEventListener("input", updatePinDots)
  document.getElementById("regPin").addEventListener("input", function () {
    // Ensure only numbers
    this.value = this.value.replace(/\D/g, "")
  })
}

// Screen navigation
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active")
  })
  document.getElementById(screenId).classList.add("active")
}

function showLogin() {
  showScreen("loginScreen")
  clearForms()
}

function showRegister() {
  showScreen("registerScreen")
  clearForms()
}

function showPin() {
  showScreen("pinScreen")
  document.getElementById("pinPhoneDisplay").textContent = `Para el número ${currentPhoneNumber}`
}

function showDashboard() {
  showScreen("dashboardScreen")
  updateDashboard()
}

function showAdmin() {
  showScreen("adminScreen")
  updateAdminPanel()
}

// Clear forms
function clearForms() {
  document.querySelectorAll("input").forEach((input) => {
    input.value = ""
  })
  hideError()
  updatePinDots()
}

// Error handling
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  errorElement.textContent = message
  errorElement.style.display = "block"
}

function hideError() {
  document.querySelectorAll(".error-message").forEach((error) => {
    error.style.display = "none"
  })
}

// PIN visibility toggle
function togglePinVisibility(inputId) {
  const input = document.getElementById(inputId)
  const icon = input.nextElementSibling.querySelector("i")

  if (input.type === "password") {
    input.type = "text"
    icon.className = "fas fa-eye-slash"
  } else {
    input.type = "password"
    icon.className = "fas fa-eye"
  }
}

// Update PIN dots
function updatePinDots() {
  const pinInput = document.getElementById("userPin")
  const dots = document.querySelectorAll(".pin-dots .dot")

  if (pinInput && dots.length > 0) {
    const pinLength = pinInput.value.length
    dots.forEach((dot, index) => {
      if (index < pinLength) {
        dot.classList.add("filled")
      } else {
        dot.classList.remove("filled")
      }
    })
  }
}

// Authentication functions
function handleLogin(e) {
  e.preventDefault()
  hideError()

  const phoneNumber = document.getElementById("phoneNumber").value.trim()

  if (!phoneNumber) {
    showError("errorMessage", "Por favor ingresa tu número de teléfono")
    return
  }

  const user = users.find((u) => u.phoneNumber === phoneNumber)

  if (!user) {
    showError("errorMessage", "Este número no está registrado. Contacta a @AnonyMysql en Telegram")
    return
  }

  if (!user.isActive && !user.isAdmin) {
    showError("errorMessage", "Tu cuenta no está activada. Contacta a @AnonyMysql en Telegram")
    return
  }

  currentPhoneNumber = phoneNumber
  showPin()
}

function handleRegister(e) {
  e.preventDefault()
  hideError()

  const fullName = document.getElementById("regFullName").value.trim()
  const phoneNumber = document.getElementById("regPhoneNumber").value.trim()
  const pin = document.getElementById("regPin").value.trim()

  if (!fullName || !phoneNumber || pin.length !== 4) {
    showError("regErrorMessage", "Por favor completa todos los campos correctamente")
    return
  }

  const existingUser = users.find((u) => u.phoneNumber === phoneNumber)
  if (existingUser) {
    showError("regErrorMessage", "Este número ya está registrado")
    return
  }

  const newUser = {
    id: `user_${Date.now()}`,
    phoneNumber,
    pin,
    isActive: false,
    isAdmin: false,
    fullName,
    balance: 0,
    ipAddress: getCurrentIP(),
    registrationDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers()

  showError("regErrorMessage", "Registro exitoso. Contacta a @AnonyMysql en Telegram para activar tu cuenta")

  setTimeout(() => {
    showLogin()
  }, 3000)
}

function handlePinSubmit(e) {
  e.preventDefault()
  hideError()

  const pin = document.getElementById("userPin").value.trim()

  if (pin.length !== 4) {
    showError("pinErrorMessage", "El PIN debe tener 4 dígitos")
    return
  }

  const user = users.find((u) => u.phoneNumber === currentPhoneNumber && u.pin === pin)

  if (!user) {
    showError("pinErrorMessage", "PIN incorrecto")
    return
  }

  // Update user login info
  user.lastLogin = new Date().toISOString()
  user.ipAddress = getCurrentIP()
  saveUsers()

  currentUser = user

  if (user.isAdmin) {
    showAdmin()
  } else {
    showDashboard()
  }
}

// Dashboard functions
function updateDashboard() {
  if (!currentUser) return

  document.getElementById("userName").textContent = `Hola, ${currentUser.fullName}`
  document.getElementById("userBalance").textContent = currentUser.balance.toLocaleString()
  document.getElementById("accountPhone").textContent = currentUser.phoneNumber
  document.getElementById("lastLogin").textContent = new Date(currentUser.lastLogin).toLocaleString()
  document.getElementById("currentIP").textContent = currentUser.ipAddress

  updateUserReceipts()
  updateServiceButtons()
}

function updateUserReceipts() {
  const container = document.getElementById("receiptsContainer")
  const userReceipts = receipts.filter((r) => r.userId === currentUser.id)

  if (userReceipts.length === 0) {
    container.innerHTML = '<p class="no-receipts">No tienes comprobantes</p>'
    return
  }

  container.innerHTML = userReceipts
    .slice(0, 5)
    .map(
      (receipt) => `
        <div class="receipt-item">
            <div class="receipt-header">
                <span class="receipt-number">${receipt.receiptNumber}</span>
                <span class="receipt-amount">$${receipt.amount.toLocaleString()}</span>
            </div>
            <div class="receipt-date">${receipt.date}</div>
            <div style="font-size: 0.9rem; color: #666;">${receipt.concept}</div>
        </div>
    `,
    )
    .join("")
}

function updateServiceButtons() {
  const buttons = document.querySelectorAll(".btn-service")
  buttons.forEach((button) => {
    const price = Number.parseInt(button.getAttribute("onclick").match(/\d+/)[0])
    button.disabled = currentUser.balance < price
  })
}

function purchaseService(serviceType, amount) {
  if (currentUser.balance < amount) {
    alert("Saldo insuficiente")
    return
  }

  const serviceNames = {
    premium: "Servicio Premium",
    bot: "Bot Social Media",
    analytics: "Análisis Avanzado",
    security: "Seguridad Plus",
  }

  const receiptNumber = generateReceipt(serviceNames[serviceType], amount)

  // Update user balance
  currentUser.balance -= amount
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  users[userIndex] = currentUser
  saveUsers()

  alert(`${serviceNames[serviceType]} activado exitosamente!\nComprobante: ${receiptNumber}`)
  updateDashboard()
}

function generateReceipt(serviceName, amount) {
  const receiptNumber = `YOR${Date.now().toString().slice(-8)}`
  const newReceipt = {
    id: `receipt_${Date.now()}`,
    type: "Servicio",
    amount: amount,
    recipientName: "REAL YORLING",
    concept: serviceName,
    date: new Date().toLocaleString(),
    receiptNumber: receiptNumber,
    userId: currentUser.id,
  }

  receipts.unshift(newReceipt)
  saveReceipts()

  return receiptNumber
}

// Admin functions
function updateAdminPanel() {
  updateUsersTab()
  updateBalanceTab()
  updateAdminReceiptsTab()
}

function showAdminTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Update tab content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(tabName + "Tab").classList.add("active")

  // Load tab-specific data
  switch (tabName) {
    case "users":
      updateUsersTab()
      break
    case "balance":
      updateBalanceTab()
      break
    case "receipts":
      updateAdminReceiptsTab()
      break
  }
}

function updateUsersTab() {
  const container = document.getElementById("usersContainer")
  const regularUsers = users.filter((u) => !u.isAdmin)

  if (regularUsers.length === 0) {
    container.innerHTML = '<p class="no-receipts">No hay usuarios registrados</p>'
    return
  }

  container.innerHTML = regularUsers
    .map(
      (user) => `
        <div class="user-item">
            <div class="user-info-admin">
                <h4>${user.fullName}</h4>
                <p>Teléfono: ${user.phoneNumber}</p>
                <p>IP: ${user.ipAddress}</p>
                <p>Registro: ${new Date(user.registrationDate).toLocaleDateString()}</p>
                <p>Saldo: $${user.balance.toLocaleString()}</p>
            </div>
            <div class="user-actions">
                <span class="status-badge ${user.isActive ? "status-active" : "status-inactive"}">
                    ${user.isActive ? "Activo" : "Inactivo"}
                </span>
                <button class="btn-toggle" onclick="toggleUserStatus('${user.id}')">
                    ${user.isActive ? "Desactivar" : "Activar"}
                </button>
                <button class="btn-delete" onclick="deleteUser('${user.id}')">
                    Eliminar
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateBalanceTab() {
  // Update user select
  const userSelect = document.getElementById("userSelect")
  const regularUsers = users.filter((u) => !u.isAdmin)

  userSelect.innerHTML =
    '<option value="">Seleccionar usuario</option>' +
    regularUsers
      .map(
        (user) => `
            <option value="${user.id}">${user.fullName} - ${user.phoneNumber}</option>
        `,
      )
      .join("")

  // Update balances display
  const container = document.getElementById("balancesContainer")
  container.innerHTML = regularUsers
    .map(
      (user) => `
        <div class="balance-item">
            <div class="user-info-admin">
                <h4>${user.fullName}</h4>
                <p>${user.phoneNumber}</p>
                <p>IP: ${user.ipAddress}</p>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.5rem; font-weight: bold; color: #28a745;">
                    $${user.balance.toLocaleString()}
                </div>
                <div style="font-size: 0.8rem; color: #666;">
                    Último acceso: ${new Date(user.lastLogin).toLocaleDateString()}
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateAdminReceiptsTab() {
  const container = document.getElementById("adminReceiptsContainer")

  if (receipts.length === 0) {
    container.innerHTML = '<p class="no-receipts">No hay comprobantes generados</p>'
    return
  }

  container.innerHTML = receipts
    .slice(0, 20)
    .map((receipt) => {
      const user = users.find((u) => u.id === receipt.userId)
      return `
            <div class="receipt-item">
                <div class="receipt-header">
                    <span class="receipt-number">${receipt.receiptNumber}</span>
                    <span class="receipt-amount">$${receipt.amount.toLocaleString()}</span>
                </div>
                <div style="font-size: 0.9rem; color: #666; margin: 5px 0;">
                    Usuario: ${user ? user.fullName : "Usuario eliminado"}
                </div>
                <div style="font-size: 0.9rem; color: #666;">${receipt.concept}</div>
                <div class="receipt-date">${receipt.date}</div>
            </div>
        `
    })
    .join("")
}

function toggleUserStatus(userId) {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].isActive = !users[userIndex].isActive
    saveUsers()
    updateUsersTab()
    updateBalanceTab()
  }
}

function deleteUser(userId) {
  if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
    users = users.filter((u) => u.id !== userId)
    receipts = receipts.filter((r) => r.userId !== userId)
    saveUsers()
    saveReceipts()
    updateUsersTab()
    updateBalanceTab()
  }
}

function addBalance() {
  const userId = document.getElementById("userSelect").value
  const amount = Number.parseFloat(document.getElementById("balanceAmount").value)

  if (!userId || !amount || amount <= 0) {
    alert("Por favor selecciona un usuario y un monto válido")
    return
  }

  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].balance += amount
    saveUsers()

    // Clear form
    document.getElementById("userSelect").value = ""
    document.getElementById("balanceAmount").value = ""

    alert(`Saldo agregado exitosamente: $${amount.toLocaleString()}`)
    updateBalanceTab()
  }
}

function logout() {
  currentUser = null
  currentPhoneNumber = ""
  showLogin()
}
