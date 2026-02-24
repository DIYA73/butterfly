(function () {
  const productGrid = document.getElementById("productGrid");
  const shopGrid = document.getElementById("shopGrid");
  const heroBagImage = document.getElementById("heroBagImage");
  const openAuthBtn = document.getElementById("openAuthBtn");
  const joinNowBtn = document.getElementById("joinNowBtn");
  const closeAuthBtn = document.getElementById("closeAuthBtn");
  const authModal = document.getElementById("authModal");
  const tabButtons = document.querySelectorAll("[data-tab]");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");

  let products = [];

  function formatPrice(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  function productCard(item) {
    return `
      <article class="card bag-card">
        <div class="bag-card-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="bag-card-body">
          <span class="bag-line">${item.line}</span>
          <div class="bag-name">${item.name}</div>
          <div class="bag-meta">
            <span>${item.color}</span>
            <span class="price">${formatPrice(item.price)}</span>
          </div>
          <div>${item.description}</div>
        </div>
      </article>
    `;
  }

  function shopCard(shop) {
    return `
      <article class="card shop-card">
        <h3>${shop.name}</h3>
        <div class="shop-city">${shop.city}, ${shop.country}</div>
        <div>${shop.address}</div>
        <a class="shop-link" href="${shop.mapLink}" target="_blank" rel="noopener noreferrer">Open in Maps</a>
      </article>
    `;
  }

  function setTab(tabName) {
    tabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabName);
    });
    loginForm.classList.toggle("active", tabName === "login");
    registerForm.classList.toggle("active", tabName === "register");
    loginMessage.textContent = "";
    registerMessage.textContent = "";
  }

  function openAuth(tabName = "login") {
    setTab(tabName);
    authModal.classList.remove("hidden");
    authModal.setAttribute("aria-hidden", "false");
  }

  function closeAuth() {
    authModal.classList.add("hidden");
    authModal.setAttribute("aria-hidden", "true");
  }

  async function handleLogin(event) {
    event.preventDefault();
    loginMessage.textContent = "Signing in...";

    try {
      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get("email"),
        password: formData.get("password")
      };

      const data = await window.Api.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      window.Api.saveToken(data.token);
      loginMessage.textContent = "Login successful. Redirecting...";
      setTimeout(() => {
        window.location.href = "/app.html";
      }, 500);
    } catch (error) {
      loginMessage.textContent = error.message;
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    registerMessage.textContent = "Creating your account...";

    try {
      const formData = new FormData(registerForm);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      };

      const data = await window.Api.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      window.Api.saveToken(data.token);
      registerMessage.textContent = "Account created. Redirecting...";
      setTimeout(() => {
        window.location.href = "/app.html";
      }, 500);
    } catch (error) {
      registerMessage.textContent = error.message;
    }
  }

  function startHeroRotation() {
    if (!heroBagImage || products.length === 0) return;

    let index = 0;
    setInterval(() => {
      index = (index + 1) % products.length;
      heroBagImage.src = products[index].image;
      heroBagImage.alt = products[index].name;
    }, 2600);
  }

  async function loadData() {
    try {
      const [productPayload, shopPayload] = await Promise.all([
        window.Api.request("/api/products"),
        window.Api.request("/api/shops")
      ]);

      products = productPayload.products;
      productGrid.innerHTML = products.map(productCard).join("");
      shopGrid.innerHTML = shopPayload.shops.map(shopCard).join("");
      startHeroRotation();
    } catch (error) {
      productGrid.innerHTML = `<article class="card shop-card">${error.message}</article>`;
      shopGrid.innerHTML = `<article class="card shop-card">${error.message}</article>`;
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  openAuthBtn?.addEventListener("click", () => openAuth("login"));
  joinNowBtn?.addEventListener("click", () => openAuth("register"));
  closeAuthBtn?.addEventListener("click", closeAuth);
  authModal?.addEventListener("click", (event) => {
    if (event.target === authModal) {
      closeAuth();
    }
  });

  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);

  loadData();
})();
