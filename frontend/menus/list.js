// ===== 상태 =====
let selectedCategoryId = "all";

// ===== 초기화 =====
async function init() {
  await Promise.all([getCategories(), getAllMenus(), getLatteArtShapes()]);
  renderCategoryTabs();
  renderMenuGrid();
  updateCartBadge();
}

// ===== 카테고리 탭 =====
function renderCategoryTabs() {
  const tabsEl = document.getElementById("categoryTabs");
  const allTabs = [{ id: "all", name: "전체" }, ...CATEGORIES, { id: "latte-art", name: "라떼아트" }];

  tabsEl.innerHTML = allTabs
    .map(
      (category) => `
        <button
          class="category-tab${category.id === selectedCategoryId ? " active" : ""}"
          data-category-id="${category.id}"
        >${category.name}</button>
      `
    )
    .join("");

  tabsEl.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      selectedCategoryId = tab.dataset.categoryId;
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

// ===== 메뉴 그리드 =====
function renderMenuGrid() {
  const gridEl = document.getElementById("menuGrid");

  if (selectedCategoryId === "latte-art") {
    renderLatteArtShapeGrid(gridEl);
    return;
  }

  const menus = getMenusByCategory(selectedCategoryId);

  if (menus.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">해당 카테고리에 메뉴가 없습니다.</p>`;
    return;
  }

  gridEl.innerHTML = menus
    .map(
      (menu) => `
        <a
          class="menu-card glass${menu.soldOut ? " sold-out" : ""}"
          href="detail.html?id=${encodeURIComponent(menu.id)}"
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
}

// ===== 라떼아트 모양 그리드 =====
function renderLatteArtShapeGrid(gridEl) {
  gridEl.innerHTML = LATTE_ART_SHAPES.map(
    (shape) => `
      <a class="menu-card glass" href="latte-art-detail.html?shape=${encodeURIComponent(shape.id)}">
        <div class="menu-card-image latte-art-shape-icon">${renderLatteArtShapeMedia(shape)}</div>
        <div class="menu-card-body">
          <span class="menu-card-name">${shape.label}</span>
          <p class="menu-card-desc">카페라떼, 카푸치노, 바닐라라떼에서 선택할 수 있는 라떼아트예요.</p>
        </div>
      </a>
    `
  ).join("");
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
