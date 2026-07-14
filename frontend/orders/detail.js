// ===== 상태 =====
let currentOrder = null;

// ===== 초기화 =====
async function init() {
  await Promise.all([getAllMenus(), getLatteArtShapes()]);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  currentOrder = orderId ? await getOrderById(orderId) : null;

  renderOrderDetail();
  updateCartBadge();
  renderAuthStatus("../");
}

// ===== 라떼아트 영상 섹션 렌더링 (카페라떼 잔별, 읽기 전용) =====
function renderLatteArtSection(order) {
  const latteItems = order.items.filter((item) => item.menuId === "latte");
  if (latteItems.length === 0) return "";

  const cards = latteItems
    .map((item, index) => {
      const videoSection = item.latteArtVideoUrl
        ? `<video class="latte-art-video" src="${escapeHtml(item.latteArtVideoUrl)}" controls></video>`
        : `<p class="latte-art-status">라떼아트 영상을 제작 중이에요. 완성되면 이곳에서 볼 수 있어요.</p>`;

      return `
        <div class="latte-art-item">
          <p class="latte-art-request-detail">카페라떼 #${index + 1}</p>
          ${videoSection}
        </div>
      `;
    })
    .join("");

  return `
    <div class="latte-art-section glass">
      <h2 class="section-title">라떼아트 영상</h2>
      ${cards}
    </div>
  `;
}

// ===== 주문 상세 렌더링 =====
function renderOrderDetail() {
  const detailEl = document.getElementById("orderDetail");

  if (!currentOrder) {
    detailEl.innerHTML = `<p class="not-found">주문을 찾을 수 없습니다.</p>`;
    return;
  }

  const itemRows = currentOrder.items
    .map((item) => {
      const menu = getMenuById(item.menuId);
      const name = menu ? menu.name : "알 수 없는 메뉴";
      const subtotal = menu ? menu.price * item.quantity : 0;
      return `
        <div class="order-item-row">
          <div>
            <div class="order-item-name">${name}</div>
            <div class="order-item-qty">${item.quantity}개</div>
          </div>
          <span class="order-item-subtotal">${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  const totalPrice = currentOrder.items.reduce((total, item) => {
    const menu = getMenuById(item.menuId);
    return menu ? total + menu.price * item.quantity : total;
  }, 0);

  detailEl.innerHTML = `
    <div class="order-detail-top">
      <span class="order-detail-id">${currentOrder.id}</span>
      <span class="order-status ${getStatusClass(currentOrder.status)}">${currentOrder.status}</span>
    </div>
    <p class="order-detail-date">${formatDate(currentOrder.createdAt)}</p>

    <div class="order-item-list glass">
      ${itemRows}
    </div>

    <div class="order-total-row glass">
      <span class="order-total-label">총 결제 금액</span>
      <span class="order-total-value">${formatPrice(totalPrice)}</span>
    </div>

    ${renderLatteArtSection(currentOrder)}
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
