// ===== 상태 =====
let currentShape = null;

// ===== 초기화 =====
function init() {
  const params = new URLSearchParams(window.location.search);
  const shapeId = params.get("shape");
  currentShape = LATTE_ART_SHAPES.find((shape) => shape.id === shapeId) || null;

  render();
  updateCartBadge();
}

// ===== 렌더링 =====
function render() {
  const el = document.getElementById("latteArtDetail");

  if (!currentShape) {
    el.innerHTML = `<p class="not-found">모양을 찾을 수 없습니다.</p>`;
    return;
  }

  const eligibleMenus = getAllMenus().filter((menu) => menu.latteArtAvailable);

  const menuCards = eligibleMenus
    .map(
      (menu) => `
        <a
          class="menu-card glass${menu.soldOut ? " sold-out" : ""}"
          href="detail.html?id=${encodeURIComponent(menu.id)}&shape=${encodeURIComponent(currentShape.id)}"
        >
          ${menu.soldOut ? `<span class="sold-out-badge">품절</span>` : ""}
          <div class="menu-card-image">
            <img src="../${menu.image}" alt="${menu.name}" loading="lazy" />
          </div>
          <div class="menu-card-body">
            <span class="menu-card-name">${menu.name}</span>
            <p class="menu-card-desc">${menu.description}</p>
            <span class="menu-card-price">${formatPrice(menu.price)}</span>
          </div>
        </a>
      `
    )
    .join("");

  el.innerHTML = `
    <div class="latte-art-shape-hero glass">
      <div class="latte-art-shape-icon-large">${currentShape.icon}</div>
      <h2 class="latte-art-shape-name">${currentShape.label}</h2>
      <p class="latte-art-shape-hint">이 모양은 아래 커피에서 선택할 수 있어요.</p>
    </div>
    <div class="menu-grid">
      ${menuCards}
    </div>
  `;
}

// ===== 장바구니 배지 =====
function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

init();
