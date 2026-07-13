// ===== 상태 =====
let currentMenu = null;
let quantity = 1;
let selectedLatteArtShape = null; // 프리셋 id, "custom", 또는 null
let latteArtNote = "";

// ===== 초기화 =====
function init() {
  const params = new URLSearchParams(window.location.search);
  const menuId = params.get("id");
  currentMenu = menuId ? getMenuById(menuId) : null;

  renderMenuDetail();
  updateCartBadge();
}

// ===== 메뉴 상세 렌더링 =====
function renderMenuDetail() {
  const detailEl = document.getElementById("menuDetail");

  if (!currentMenu) {
    detailEl.innerHTML = `<p class="not-found">메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  const category = getCategoryById(currentMenu.categoryId);
  const soldOut = currentMenu.soldOut;

  detailEl.innerHTML = `
    <div class="menu-detail-image">
      <img src="../${currentMenu.image}" alt="${currentMenu.name}" loading="lazy" />
    </div>
    <div class="menu-detail-body">
      ${category ? `<span class="menu-detail-category">${category.name}</span>` : ""}
      <h2 class="menu-detail-name">${currentMenu.name}</h2>
      <p class="menu-detail-price">${formatPrice(currentMenu.price)}</p>
      <p class="menu-detail-desc">${currentMenu.description}</p>
      ${soldOut ? `<span class="menu-detail-soldout">품절된 메뉴입니다</span>` : renderQuantityStepper()}
      ${!soldOut && currentMenu.latteArtAvailable ? renderLatteArtPicker() : ""}
    </div>
    ${soldOut ? "" : renderActionBar()}
  `;

  if (!soldOut) {
    bindQuantityEvents();
    bindAddToCartEvent();
    if (currentMenu.latteArtAvailable) {
      bindLatteArtEvents();
    }
  }
}

function renderQuantityStepper() {
  return `
    <div class="quantity-stepper">
      <button class="quantity-btn" id="decreaseBtn" aria-label="수량 감소">-</button>
      <span class="quantity-value" id="quantityValue">${quantity}</span>
      <button class="quantity-btn" id="increaseBtn" aria-label="수량 증가">+</button>
    </div>
  `;
}

function renderLatteArtPicker() {
  const presetButtons = LATTE_ART_SHAPES.map(
    (shape) => `
      <button
        type="button"
        class="latte-art-shape-btn ${selectedLatteArtShape === shape.id ? "selected" : ""}"
        data-shape="${shape.id}"
      >
        ${shape.label}
      </button>
    `
  ).join("");

  return `
    <div class="latte-art-picker">
      <h3 class="latte-art-title">라떼아트 요청 (선택)</h3>
      <div class="latte-art-shapes">
        ${presetButtons}
        <button
          type="button"
          class="latte-art-shape-btn ${selectedLatteArtShape === "custom" ? "selected" : ""}"
          data-shape="custom"
        >
          기타
        </button>
      </div>
      ${
        selectedLatteArtShape === "custom"
          ? `<textarea id="latteArtNote" class="latte-art-note" maxlength="100" placeholder="원하는 모양을 설명해주세요">${escapeHtml(latteArtNote)}</textarea>`
          : ""
      }
    </div>
  `;
}

function renderActionBar() {
  const disabled = currentMenu.latteArtAvailable && !isLatteArtValid();
  return `
    <div class="action-bar glass">
      <span class="action-bar-total" id="actionBarTotal">${formatPrice(currentMenu.price * quantity)}</span>
      <button class="add-to-cart-btn" id="addToCartBtn" ${disabled ? "disabled" : ""}>장바구니 담기</button>
    </div>
  `;
}

// ===== 수량 조절 =====
function bindQuantityEvents() {
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");

  decreaseBtn.disabled = quantity <= 1;

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity -= 1;
      updateQuantityDisplay();
    }
  });

  increaseBtn.addEventListener("click", () => {
    quantity += 1;
    updateQuantityDisplay();
  });
}

function updateQuantityDisplay() {
  document.getElementById("quantityValue").textContent = quantity;
  document.getElementById("decreaseBtn").disabled = quantity <= 1;
  document.getElementById("actionBarTotal").textContent = formatPrice(currentMenu.price * quantity);
}

// ===== 라떼아트 선택 =====
function bindLatteArtEvents() {
  document.querySelectorAll(".latte-art-shape-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedLatteArtShape = btn.dataset.shape;
      if (selectedLatteArtShape !== "custom") {
        latteArtNote = "";
      }
      renderMenuDetail();
    });
  });

  const noteInput = document.getElementById("latteArtNote");
  if (noteInput) {
    noteInput.addEventListener("input", () => {
      latteArtNote = noteInput.value;
      const addToCartBtn = document.getElementById("addToCartBtn");
      if (addToCartBtn) {
        addToCartBtn.disabled = !isLatteArtValid();
      }
    });
  }
}

function isLatteArtValid() {
  if (selectedLatteArtShape === "custom") {
    return latteArtNote.trim().length > 0;
  }
  return true;
}

// ===== 장바구니 담기 =====
function bindAddToCartEvent() {
  const addToCartBtn = document.getElementById("addToCartBtn");

  addToCartBtn.addEventListener("click", () => {
    if (currentMenu.latteArtAvailable && selectedLatteArtShape) {
      applyLatteArtSelection();
    }

    addToCart(currentMenu.id, quantity);
    updateCartBadge();

    const originalText = addToCartBtn.textContent;
    addToCartBtn.textContent = "담았습니다!";
    addToCartBtn.disabled = true;

    setTimeout(() => {
      addToCartBtn.textContent = originalText;
      addToCartBtn.disabled = !isLatteArtValid();
    }, 1200);
  });
}

function applyLatteArtSelection() {
  const nextSelection = {
    menuId: currentMenu.id,
    menuName: currentMenu.name,
    shape: selectedLatteArtShape,
    note: selectedLatteArtShape === "custom" ? latteArtNote.trim() : "",
  };

  const existing = getLatteArtSelection();
  const isSameRequest =
    existing &&
    existing.menuId === nextSelection.menuId &&
    existing.shape === nextSelection.shape &&
    existing.note === nextSelection.note;

  if (existing && !isSameRequest) {
    const confirmed = window.confirm(
      `이미 "${existing.menuName}"에 라떼아트 요청이 있어요. "${nextSelection.menuName}" 요청으로 교체할까요?`
    );
    if (!confirmed) {
      return;
    }
  }

  setLatteArtSelection(nextSelection);
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
