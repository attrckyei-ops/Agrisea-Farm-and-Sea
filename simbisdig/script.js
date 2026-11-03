let cart = [];
let selectedAccountRole = "pengguna";

function selectAccountRole(role, button) {
  selectedAccountRole = role;

  document.querySelectorAll(".role-option").forEach(option => {
    const isSelected = option === button;
    option.classList.toggle("active", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });

  const roleName = role === "mitra" ? "Mitra" : "Pengguna";
  document.getElementById("login-intro").innerText =
    `Masuk sebagai ${roleName} untuk melanjutkan.`;
  document.getElementById("login-submit").innerText =
    `Masuk sebagai ${roleName}`;
}

function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) {
    return;
  }

  document.getElementById("login-screen").hidden = true;
  const homePage = document.getElementById("home-page");
  homePage.hidden = false;
  homePage.dataset.accountRole = selectedAccountRole;
  window.scrollTo(0, 0);
}

function addCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  renderCart();

  document.getElementById("cart-message").innerText =
    name + " berhasil ditambahkan ke keranjang!";
}

function showCart() {
  renderCart();
  document.getElementById("cart-dialog").showModal();
}

function closeCart() {
  document.getElementById("cart-dialog").close();
}

function changeCartQuantity(name, amount) {
  const item = cart.find(cartItem => cartItem.name === name);
  if (!item) {
    return;
  }

  item.quantity += amount;
  if (item.quantity <= 0) {
    removeCartItem(name);
    return;
  }

  renderCart();
}

function removeCartItem(name) {
  cart = cart.filter(item => item.name !== name);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
  document.getElementById("cart-message").innerText =
    "Keranjang telah dikosongkan.";
}

function renderCart() {
  const itemsContainer = document.getElementById("cart-items");
  const emptyMessage = document.getElementById("cart-empty");
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  document.getElementById("cart-count").innerText = itemCount;
  document.getElementById("cart-total").innerText =
    `Rp${cartTotal.toLocaleString("id-ID")}`;
  emptyMessage.hidden = cart.length > 0;
  document.getElementById("cart-clear").disabled = cart.length === 0;
  itemsContainer.replaceChildren();

  cart.forEach(item => {
    const row = document.createElement("article");
    row.className = "cart-item";

    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.innerText = item.name;
    const unitPrice = document.createElement("p");
    unitPrice.className = "cart-item-price";
    unitPrice.innerText = `Rp${item.price.toLocaleString("id-ID")} / item`;
    const subtotal = document.createElement("p");
    subtotal.className = "cart-item-subtotal";
    subtotal.innerText = `Rp${(item.price * item.quantity).toLocaleString("id-ID")}`;
    details.append(name, unitPrice, subtotal);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const quantityControl = document.createElement("div");
    quantityControl.className = "cart-quantity-control";
    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.setAttribute("aria-label", `Kurangi ${item.name}`);
    decreaseButton.innerText = "−";
    decreaseButton.addEventListener("click", () => changeCartQuantity(item.name, -1));
    const quantity = document.createElement("span");
    quantity.className = "cart-quantity";
    quantity.innerText = item.quantity;
    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.setAttribute("aria-label", `Tambah ${item.name}`);
    increaseButton.innerText = "+";
    increaseButton.addEventListener("click", () => changeCartQuantity(item.name, 1));
    quantityControl.append(decreaseButton, quantity, increaseButton);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "cart-remove";
    removeButton.innerText = "Hapus";
    removeButton.addEventListener("click", () => removeCartItem(item.name));
    actions.append(quantityControl, removeButton);

    row.append(details, actions);
    itemsContainer.append(row);
  });
}

function filterProducts(category) {
  let products = document.querySelectorAll(".product");

  products.forEach(product => {
    const matchesCategory =
      category === "all" ||
      product.dataset.category === category;
    const matchesBestseller =
      category === "terlaris" &&
      product.dataset.bestseller === "true";

    if (matchesCategory || matchesBestseller) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

function locateBuyer() {
  const status = document.getElementById("location-status");
  const locationTags = document.querySelectorAll("[data-location-tag]");

  if (!navigator.geolocation) {
    status.innerText = "Browser ini tidak mendukung akses lokasi.";
    return;
  }

  status.innerText = "Meminta izin lokasi perangkat...";
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;

      document.querySelectorAll(".product").forEach(product => {
        const distance = getDistanceKm(
          latitude,
          longitude,
          Number(product.dataset.lat),
          Number(product.dataset.lng)
        );
        const distanceLabel = distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`;
        const tag = product.querySelector("[data-location-tag]");

        tag.innerText = `📍 ${product.dataset.location} · ${distanceLabel}`;
      });

      status.innerText = "Jarak dihitung dari lokasi perangkat ke titik mitra contoh.";
    },
    error => {
      const messages = {
        1: "Izin lokasi ditolak. Izinkan akses lokasi untuk melihat jarak.",
        2: "Lokasi perangkat tidak tersedia saat ini.",
        3: "Pencarian lokasi terlalu lama. Coba lagi."
      };

      status.innerText = messages[error.code] || "Lokasi tidak dapat diakses.";
      locationTags.forEach(tag => {
        tag.innerText = `📍 ${tag.closest(".product").dataset.location} · jarak tidak tersedia`;
      });
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
  );
}

function getDistanceKm(latitude1, longitude1, latitude2, longitude2) {
  const degreesToRadians = value => value * Math.PI / 180;
  const latitudeDifference = degreesToRadians(latitude2 - latitude1);
  const longitudeDifference = degreesToRadians(longitude2 - longitude1);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(degreesToRadians(latitude1)) *
    Math.cos(degreesToRadians(latitude2)) *
    Math.sin(longitudeDifference / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
