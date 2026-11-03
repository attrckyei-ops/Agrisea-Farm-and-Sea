let cart = [];
let totalItems = 0;
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
  cart.push({name, price});
  totalItems++;

  document.getElementById("cart-count").innerText =
    totalItems;

  document.getElementById("cart-message").innerText =
    name + " berhasil ditambahkan ke keranjang!";
}

function showCart() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong.");
    return;
  }

  let total = 0;
  let detail = "KERANJANG AGRISEA\n\n";

  cart.forEach(item => {
    detail += item.name + " - Rp" +
      item.price.toLocaleString("id-ID") + "\n";
    total += item.price;
  });

  detail += "\nTotal: Rp" +
    total.toLocaleString("id-ID");

  alert(detail);
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
