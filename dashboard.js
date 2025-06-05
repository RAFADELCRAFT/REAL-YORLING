// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem("currentUser"))
if (!currentUser) {
  window.location.href = "index.html"
}

// Load user data
let users = JSON.parse(localStorage.getItem("jorlingUsers")) || []
let userIndex = users.findIndex((u) => u.id === currentUser.id)

// Service prices (per unit)
const servicePrices = {
  instagram: 0.00015, // $0.015 por cada 100 seguidores
  tiktok: 0.00015,
  youtube_subscribers: 0.00015,
  youtube_views: 0.03, // $15 por 500 horas = $0.03 por hora
  facebook: 0.00015,
  twitter: 0.00015,
  twitch: 0.00015,
  telegram: 0.00015,
}

// Minimum quantities for each service
const serviceMinimums = {
  instagram: 100,
  tiktok: 100,
  youtube_subscribers: 100,
  youtube_views: 500, // Mínimo 500 horas
  facebook: 100,
  twitter: 100,
  twitch: 100,
  telegram: 100,
}

// Special pricing for YouTube hours
const youtubeHoursPricing = {
  500: 15, // 500 horas = $15
  3000: 130, // 3000 horas = $130
}

let selectedService = null

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadUserData()
  loadOrders()
})

function loadUserData() {
  // Update user info from latest data
  const latestUser = users[userIndex]
  document.getElementById("username").textContent = latestUser.username
  document.getElementById("balance").textContent = `$${latestUser.balance.toFixed(2)}`
  document.getElementById("totalOrders").textContent = latestUser.orders.length

  const completedOrders = latestUser.orders.filter((order) => order.status === "completed").length
  document.getElementById("completedOrders").textContent = completedOrders
}

// Menu functions
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu")
  menu.classList.toggle("show")
}

function showNewOrder() {
  document.getElementById("orderSection").style.display = "block"
  document.getElementById("orderSection").scrollIntoView({ behavior: "smooth" })
  toggleMenu()
}

function showOrders() {
  document.getElementById("ordersList").scrollIntoView({ behavior: "smooth" })
  toggleMenu()
}

function showAddFunds() {
  document.getElementById("addFundsModal").style.display = "block"
  toggleMenu()
}

function showRefunds() {
  showMessage("Contacta con soporte para solicitar reembolsos", "success")
  toggleMenu()
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "index.html"
}

// Services functions
function toggleServices() {
  const servicesList = document.getElementById("servicesList")
  const chevron = document.getElementById("servicesChevron")

  servicesList.classList.toggle("show")
  chevron.style.transform = servicesList.classList.contains("show") ? "rotate(180deg)" : "rotate(0deg)"
}

function selectService(service) {
  selectedService = service
  const serviceNames = {
    instagram: "Instagram Seguidores",
    tiktok: "TikTok Seguidores",
    youtube_subscribers: "YouTube Suscriptores",
    youtube_views: "YouTube Horas de Reproducción",
    facebook: "Facebook Seguidores",
    twitter: "X (Twitter) Seguidores",
    twitch: "Twitch Seguidores",
    telegram: "Telegram Miembros",
  }

  document.getElementById("selectedServiceTitle").textContent = `Servicio: ${serviceNames[service]}`
  document.getElementById("orderSection").style.display = "block"

  // Update minimum quantity and placeholder based on service
  const quantityInput = document.getElementById("quantity")
  const minimumInfo = document.querySelector(".input-group small")

  if (service === "youtube_views") {
    quantityInput.min = "500"
    quantityInput.placeholder = "Ingresa las horas (mínimo 500)"
    minimumInfo.innerHTML = `Mínimo: 500 horas - Paquetes especiales: 500 horas ($15) | 3000 horas ($130)`
  } else {
    quantityInput.min = "100"
    quantityInput.placeholder = "Ingresa la cantidad (mínimo 100)"
    minimumInfo.innerHTML = `Mínimo: 100 ${service.includes("youtube") ? "suscriptores" : "seguidores"}`
  }

  // Clear quantity and price
  quantityInput.value = ""
  document.getElementById("totalPrice").textContent = "$0.00"

  // Close services list
  toggleServices()

  showMessage(`Servicio ${serviceNames[service]} seleccionado`, "success")
}

function updatePrice() {
  const quantity = Number.parseInt(document.getElementById("quantity").value) || 0

  if (!selectedService || quantity < (serviceMinimums[selectedService] || 100)) {
    document.getElementById("totalPrice").textContent = "$0.00"
    return
  }

  let total = 0

  if (selectedService === "youtube_views") {
    // Special pricing for YouTube hours
    if (quantity === 500) {
      total = 15
    } else if (quantity === 3000) {
      total = 130
    } else {
      // Calculate based on hourly rate
      total = quantity * servicePrices[selectedService]
    }
  } else {
    // Regular calculation for other services
    total = quantity * servicePrices[selectedService]
  }

  document.getElementById("totalPrice").textContent = `$${total.toFixed(2)}`
}

// Order form
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault()

  if (!selectedService) {
    showMessage("Por favor selecciona un servicio", "error")
    return
  }

  const url = document.getElementById("serviceUrl").value
  const quantity = Number.parseInt(document.getElementById("quantity").value)
  const pricePerHundred = servicePrices[selectedService]
  const totalPrice = (quantity / 100) * pricePerHundred

  // Check if user has enough balance
  const currentUserData = users[userIndex]
  if (currentUserData.balance < totalPrice) {
    showMessage("Saldo insuficiente. Añade fondos a tu cuenta.", "error")
    showAddFunds()
    return
  }

  // Create new order
  const newOrder = {
    id: Date.now(),
    service: selectedService,
    url: url,
    quantity: quantity,
    price: totalPrice,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Update user data
  users[userIndex].orders.push(newOrder)
  users[userIndex].balance -= totalPrice

  // Save to localStorage
  localStorage.setItem("jorlingUsers", JSON.stringify(users))
  localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))

  // Update UI
  loadUserData()
  loadOrders()

  // Clear form
  document.getElementById("orderForm").reset()
  document.getElementById("orderSection").style.display = "none"
  selectedService = null

  showMessage("¡Pedido realizado exitosamente!", "success")

  // Simulate order processing (in production, this would be handled by Python bots)
  setTimeout(() => {
    processOrder(newOrder.id)
  }, 5000)
})

function processOrder(orderId) {
  const orderIndex = users[userIndex].orders.findIndex((order) => order.id === orderId)
  if (orderIndex !== -1) {
    users[userIndex].orders[orderIndex].status = "processing"
    localStorage.setItem("jorlingUsers", JSON.stringify(users))
    loadOrders()

    // Simulate completion
    setTimeout(() => {
      users[userIndex].orders[orderIndex].status = "completed"
      localStorage.setItem("jorlingUsers", JSON.stringify(users))
      loadOrders()
      showMessage("¡Pedido completado!", "success")
    }, 10000)
  }
}

function loadOrders() {
  const ordersList = document.getElementById("ordersList")
  const currentUserData = users[userIndex]

  if (currentUserData.orders.length === 0) {
    ordersList.innerHTML = '<p class="no-orders">No tienes pedidos aún</p>'
    return
  }

  const ordersHTML = currentUserData.orders
    .map((order) => {
      const serviceNames = {
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        facebook: "Facebook",
        twitter: "X (Twitter)",
        twitch: "Twitch",
        telegram: "Telegram",
      }

      const statusClass = `status-${order.status}`
      const statusText = {
        pending: "Pendiente",
        processing: "Procesando",
        completed: "Completado",
      }

      return `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Pedido #${order.id}</span>
                    <span class="order-status ${statusClass}">${statusText[order.status]}</span>
                </div>
                <div class="order-details">
                    <p><strong>Servicio:</strong> ${serviceNames[order.service]}</p>
                    <p><strong>Cantidad:</strong> ${order.quantity}</p>
                    <p><strong>Precio:</strong> $${order.price.toFixed(4)}</p>
                    <p><strong>URL:</strong> ${order.url}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `
    })
    .join("")

  ordersList.innerHTML = ordersHTML
}

// Quantity input listener
document.getElementById("quantity").addEventListener("input", updatePrice)

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
}

// Message functions
function showMessage(text, type = "success") {
  const messageElement = document.getElementById(type + "Message")
  const textElement = document.getElementById(type + "Text")

  textElement.textContent = text
  messageElement.style.display = "flex"

  setTimeout(() => {
    messageElement.style.display = "none"
  }, 5000)
}

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  const menu = document.getElementById("dropdownMenu")
  const toggle = document.querySelector(".menu-toggle")

  if (!toggle.contains(event.target) && !menu.contains(event.target)) {
    menu.classList.remove("show")
  }
})

// Close modals when clicking outside
window.onclick = (event) => {
  const modals = ["addFundsModal"]
  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId)
    if (event.target === modal) {
      closeModal(modalId)
    }
  })
}

// Auto-refresh user data every 30 seconds (to check for admin balance updates)
setInterval(() => {
  const updatedUsers = JSON.parse(localStorage.getItem("jorlingUsers")) || []
  const updatedUserIndex = updatedUsers.findIndex((u) => u.id === currentUser.id)

  if (updatedUserIndex !== -1) {
    users = updatedUsers
    userIndex = updatedUserIndex
    loadUserData()
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))
  }
}, 30000)
