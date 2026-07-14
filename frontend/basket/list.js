async function init() {
  await Promise.all([getAllMenus(), getCategories(), getLatteArtShapes()]);
  bindHeaderActions();
  document.getElementById("basketContent").addEventListener("click", handleBasketClick);
  renderBasketPage();

  document.getElementById("checkoutModalCloseBtn").addEventListener("click", closeCheckoutModal);
  document.getElementById("checkoutModalOverlay").addEventListener("click", (event) => {
    if (event.target.id === "checkoutModalOverlay") {
      closeCheckoutModal();
    }
  });
}

function bindHeaderActions() {
  const clearCartBtn = document.getElementById("clearCartBtn");

  clearCartBtn.addEventListener("click", () => {
    if (getCart().length === 0) {
      return;
    }

    const confirmed = window.confirm("장바구니를 모두 비울까요?");
    if (!confirmed) {
      return;
    }

    clearCart();
    renderBasketPage();
  });
}

function reconcileLatteArtSelection() {
  const selection = getLatteArtSelection();
  if (!selection) return;

  const stillInCart = getCart().some((item) => item.menuId === selection.menuId);
  if (!stillInCart) {
    clearLatteArtSelection();
  }
}

function renderLatteArtRequest() {
  const sectionEl = document.getElementById("latteArtRequest");
  const selection = getLatteArtSelection();

  if (!selection) {
    sectionEl.hidden = true;
    sectionEl.innerHTML = "";
    return;
  }

  const shapeInfo = LATTE_ART_SHAPES.find((shape) => shape.id === selection.shape);
  const detailText =
    selection.shape === "custom" ? selection.note : shapeInfo ? shapeInfo.label : selection.shape;

  sectionEl.hidden = false;
  sectionEl.innerHTML = `
    <div>
      <span class="latte-art-request-label">라떼아트 요청</span>
      <p class="latte-art-request-detail">${escapeHtml(selection.menuName)} · ${escapeHtml(detailText)}</p>
    </div>
    <button class="latte-art-request-remove" id="removeLatteArtBtn" type="button" aria-label="라떼아트 요청 삭제">✕</button>
  `;

  document.getElementById("removeLatteArtBtn").addEventListener("click", () => {
    clearLatteArtSelection();
    renderBasketPage();
  });
}

function buildCartViewModels() {
  return getCart().map((item) => {
    const menu = getMenuById(item.menuId);
    const category = menu ? getCategoryById(menu.categoryId) : null;

    return {
      ...item,
      menu,
      category,
      linePrice: menu ? menu.price * item.quantity : 0,
    };
  });
}

function renderBasketPage() {
  reconcileLatteArtSelection();
  renderLatteArtRequest();

  const contentEl = document.getElementById("basketContent");
  const cartItems = buildCartViewModels();
  const validItems = cartItems.filter((item) => item.menu);
  const totalCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = validItems.reduce((sum, item) => sum + item.linePrice, 0);

  document.getElementById("summaryCount").textContent = `${totalCount}개`;
  document.getElementById("summaryPrice").textContent = formatPrice(totalPrice);

  if (cartItems.length === 0) {
    contentEl.innerHTML = renderEmptyState();
    return;
  }

  contentEl.innerHTML = `
    <div class="basket-list">
      ${cartItems.map(renderBasketItem).join("")}
    </div>
    <div class="bottom-bar glass">
      <div class="bottom-bar-top">
        <div>
          <span class="bottom-bar-label">총 주문 수량</span>
          <strong>${totalCount}개</strong>
        </div>
        <div>
          <span class="bottom-bar-label">총 결제 예정 금액</span>
          <strong class="bottom-bar-price">${formatPrice(totalPrice)}</strong>
        </div>
      </div>
      <div class="bottom-bar-actions">
        <a class="shop-link" href="../menus/list.html">메뉴 더 담기</a>
        <button class="checkout-btn" id="checkoutBtn" type="button" ${validItems.length === 0 ? "disabled" : ""}>
          주문하기
        </button>
      </div>
    </div>
  `;

  bindBasketEvents();
}

function renderEmptyState() {
  return `
    <section class="empty-state">
      <h2 class="empty-title">장바구니가 비어 있어요</h2>
      <p class="empty-desc">메뉴를 둘러보고 원하는 음료와 디저트를 담아보세요.</p>
      <a class="shop-link" href="../menus/list.html">메뉴 보러 가기</a>
    </section>
  `;
}

function renderBasketItem(item) {
  if (!item.menu) {
    return `
      <article class="basket-item missing-item">
        <div class="basket-item-top">
          <div class="item-emoji">⚠️</div>
          <div>
            <h3 class="item-name">삭제된 메뉴</h3>
            <p class="item-desc">더 이상 존재하지 않는 메뉴예요. 삭제 후 다시 담아주세요.</p>
          </div>
          <span class="item-price">-</span>
        </div>
        <div class="item-meta">
          <span class="soldout-chip">주문 불가</span>
          <div class="item-actions">
            <button class="remove-btn" type="button" data-action="remove" data-menu-id="${item.menuId}">삭제</button>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="basket-item">
      <div class="basket-item-top">
        <div class="item-emoji">
          <img src="../${item.menu.image}" alt="${item.menu.name}" loading="lazy" />
        </div>
        <div>
          ${item.category ? `<span class="item-category">${item.category.name}</span>` : ""}
          <h3 class="item-name">${item.menu.name}</h3>
          <p class="item-desc">${item.menu.description}</p>
          ${item.menu.soldOut ? `<span class="soldout-chip">현재 품절된 메뉴예요</span>` : ""}
        </div>
        <span class="item-price">${formatPrice(item.linePrice)}</span>
      </div>
      <div class="item-meta">
        <div class="quantity-stepper">
          <button class="quantity-btn" type="button" data-action="decrease" data-menu-id="${item.menu.id}" aria-label="수량 감소">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" type="button" data-action="increase" data-menu-id="${item.menu.id}" aria-label="수량 증가">+</button>
        </div>
        <div class="item-actions">
          <a class="menu-link" href="../menus/detail.html?id=${encodeURIComponent(item.menu.id)}">상세</a>
          <button class="remove-btn" type="button" data-action="remove" data-menu-id="${item.menu.id}">삭제</button>
        </div>
      </div>
    </article>
  `;
}

function bindBasketEvents() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", openCheckoutModal);
  }
}

// ===== 주문하기 모달 (결제방법 + 잔별 라떼아트 선택) =====
// 라떼아트 선택은 카페라떼 메뉴에만 적용한다(카푸치노/바닐라라떼 등 다른 latteArtAvailable 메뉴는 제외).
const LATTE_ART_CHECKOUT_MENU_ID = "latte";
let checkoutGlassSlots = [];
let checkoutPaymentMethod = null;

function buildGlassSlots() {
  const slots = [];
  buildCartViewModels()
    .filter((item) => item.menu)
    .forEach((item) => {
      if (item.menu.id === LATTE_ART_CHECKOUT_MENU_ID) {
        for (let i = 0; i < item.quantity; i++) {
          slots.push({ menuId: item.menu.id, menuName: item.menu.name, shape: null, note: "" });
        }
      }
    });
  return slots;
}

async function openCheckoutModal() {
  const profile = await getCurrentProfile();
  if (!profile) {
    // 주의: 로컬 serve 서버가 "*.html?query" 요청을 clean-url 리다이렉트하며 쿼리스트링을 날리는
    // 기존 이슈가 있어(앱 버그 아님), 이 링크만 확장자 없이 이동한다(GitHub Pages에서도 정상 동작 확인).
    window.location.href = `../auth/login?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }

  checkoutGlassSlots = buildGlassSlots();
  checkoutPaymentMethod = null;
  renderCheckoutForm();
  document.getElementById("checkoutModalOverlay").hidden = false;
}

function closeCheckoutModal() {
  document.getElementById("checkoutModalOverlay").hidden = true;
}

function renderCheckoutForm() {
  const body = document.getElementById("checkoutModalBody");

  const latteArtSection = checkoutGlassSlots.length
    ? `
      <section class="latte-art-slots-section">
        <h3 class="section-title">라떼아트 선택 (${checkoutGlassSlots.length}잔)</h3>
        ${checkoutGlassSlots.map((slot, index) => renderGlassPicker(slot, index)).join("")}
      </section>
    `
    : "";

  body.innerHTML = `
    <section class="payment-method-section">
      <h3 class="section-title">결제 방법</h3>
      <div class="payment-method-options">
        <label class="payment-method-option">
          <input type="radio" name="paymentMethod" value="card" ${checkoutPaymentMethod === "card" ? "checked" : ""} />
          <span>카드 결제 (매장)</span>
        </label>
        <label class="payment-method-option">
          <input type="radio" name="paymentMethod" value="cash" ${checkoutPaymentMethod === "cash" ? "checked" : ""} />
          <span>현금 결제 (매장)</span>
        </label>
      </div>
    </section>

    ${latteArtSection}

    <p class="checkout-modal-message" id="checkoutModalMessage" hidden></p>
    <button type="button" class="primary-button" id="checkoutSubmitBtn">주문 완료</button>
  `;

  bindCheckoutFormEvents();
}

function renderGlassPicker(slot, index) {
  const presetButtons = LATTE_ART_SHAPES.map(
    (shape) => `
      <button
        type="button"
        class="latte-art-shape-btn ${slot.shape === shape.id ? "selected" : ""}"
        data-slot-index="${index}"
        data-shape="${shape.id}"
      >${shape.icon} ${shape.label}</button>
    `
  ).join("");

  return `
    <div class="latte-art-slot">
      <p class="latte-art-slot-title">${escapeHtml(slot.menuName)} #${index + 1}</p>
      <div class="latte-art-shapes">
        ${presetButtons}
        <button
          type="button"
          class="latte-art-shape-btn ${slot.shape === "custom" ? "selected" : ""}"
          data-slot-index="${index}"
          data-shape="custom"
        >기타</button>
      </div>
      ${
        slot.shape === "custom"
          ? `<textarea class="latte-art-note" data-slot-index="${index}" maxlength="100" placeholder="원하는 모양을 설명해주세요">${escapeHtml(slot.note)}</textarea>`
          : ""
      }
    </div>
  `;
}

function showCheckoutMessage(message) {
  const messageEl = document.getElementById("checkoutModalMessage");
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.hidden = !message;
}

function isCheckoutValid(paymentMethod) {
  if (!paymentMethod) return false;
  return checkoutGlassSlots.every((slot) => slot.shape && (slot.shape !== "custom" || slot.note.trim().length > 0));
}

function bindCheckoutFormEvents() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      checkoutPaymentMethod = input.value;
    });
  });

  document.querySelectorAll(".latte-art-shape-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.slotIndex);
      const shape = btn.dataset.shape;
      checkoutGlassSlots[index].shape = shape;
      if (shape !== "custom") {
        checkoutGlassSlots[index].note = "";
      }
      renderCheckoutForm();
    });
  });

  document.querySelectorAll(".latte-art-note").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const index = Number(textarea.dataset.slotIndex);
      checkoutGlassSlots[index].note = textarea.value;
    });
  });

  document.getElementById("checkoutSubmitBtn").addEventListener("click", handleCheckoutSubmit);
}

function buildOrderItems() {
  const items = [];
  let slotCursor = 0;

  buildCartViewModels()
    .filter((item) => item.menu)
    .forEach((item) => {
      if (item.menu.id === LATTE_ART_CHECKOUT_MENU_ID) {
        for (let i = 0; i < item.quantity; i++) {
          const slot = checkoutGlassSlots[slotCursor++];
          items.push({
            menuId: item.menu.id,
            quantity: 1,
            latteArtShape: slot.shape,
            latteArtNote: slot.shape === "custom" ? slot.note.trim() : "",
          });
        }
      } else {
        items.push({ menuId: item.menu.id, quantity: item.quantity });
      }
    });

  return items;
}

async function handleCheckoutSubmit() {
  if (!isCheckoutValid(checkoutPaymentMethod)) {
    showCheckoutMessage("결제 방법과 라떼아트 모양을 모두 선택해주세요.");
    return;
  }

  const submitBtn = document.getElementById("checkoutSubmitBtn");
  submitBtn.disabled = true;
  showCheckoutMessage("");

  const items = buildOrderItems();
  const newOrder = await createOrder(items, checkoutPaymentMethod);

  if (!newOrder) {
    submitBtn.disabled = false;
    showCheckoutMessage("주문 처리에 실패했습니다. 다시 시도해주세요.");
    return;
  }

  clearCart();
  clearLatteArtSelection();
  renderBasketPage();
  renderCheckoutComplete(newOrder);
}

function renderCheckoutComplete(order) {
  const body = document.getElementById("checkoutModalBody");
  body.innerHTML = `
    <div class="checkout-complete">
      <p class="checkout-complete-icon">✅</p>
      <h3>주문이 완료되었습니다</h3>
      <p class="checkout-complete-code">주문코드 <strong>${order.id}</strong></p>
      <button type="button" class="primary-button" id="checkoutCompleteConfirmBtn">주문 내역 보기</button>
    </div>
  `;

  document.getElementById("checkoutCompleteConfirmBtn").addEventListener("click", () => {
    window.location.href = `../orders/detail.html?id=${encodeURIComponent(order.id)}`;
  });
}

function handleBasketClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const { action, menuId } = target.dataset;
  if (!menuId) {
    return;
  }

  const currentItem = getCart().find((item) => item.menuId === menuId);

  if (action === "increase" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity + 1);
  }

  if (action === "decrease" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity - 1);
  }

  if (action === "remove") {
    removeFromCart(menuId);
  }

  renderBasketPage();
}

init();
