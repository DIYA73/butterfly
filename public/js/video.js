(function () {
  const videoTrack = document.getElementById("videoTrack");
  const fashionVideo = document.getElementById("fashionVideo");
  const videoFallback = document.getElementById("videoFallback");

  function formatPrice(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  async function loadProducts() {
    try {
      const payload = await window.Api.request("/api/products");
      videoTrack.innerHTML = payload.products
        .map(
          (item) => `
            <article class="video-bag">
              <img src="${item.image}" alt="${item.name}" loading="lazy" />
              <strong>${item.name}</strong>
              <span>${item.color} - ${formatPrice(item.price)}</span>
            </article>
          `
        )
        .join("");
    } catch (error) {
      videoTrack.innerHTML = `<article class="video-bag">${error.message}</article>`;
    }
  }

  function setupVideoFallback() {
    if (!fashionVideo) return;

    fashionVideo.addEventListener("error", () => {
      videoFallback.classList.add("show");
    });
  }

  setupVideoFallback();
  loadProducts();
})();
