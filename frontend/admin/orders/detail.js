const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

let currentOrder = null;

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

// 주문 항목 중 카페라떼(라떼아트 대상) 잔마다 개별 영상 업로드 UI를 보여준다.
// 메뉴/홈페이지 관리에서 쓰는 라떼아트 영상과는 별개의, 이 주문만을 위한 개인 맞춤 영상이다.
function renderOrderItemLatteArtSection(order) {
  const latteItems = order.items.filter((item) => item.menuId === "latte");
  if (latteItems.length === 0) return "";

  const cards = latteItems
    .map((item, index) => {
      const videoSection = item.latteArtVideoUrl
        ? `
          <video class="latte-art-video" src="${escapeHtml(item.latteArtVideoUrl)}" controls></video>
          <p class="latte-art-uploaded-at">업로드됨: ${formatDate(item.latteArtVideoUploadedAt)}</p>
        `
        : `<p class="latte-art-status">아직 영상이 업로드되지 않았습니다.</p>`;

      return `
        <div class="latte-art-item-card">
          <p class="latte-art-slot-title">카페라떼 #${index + 1}</p>
          ${videoSection}
          <div class="latte-art-upload">
            <input type="file" class="latte-art-video-input" data-item-id="${item.id}" accept="video/*" />
            <button type="button" class="latte-art-upload-btn" data-item-id="${item.id}">
              ${item.latteArtVideoUrl ? "영상 교체" : "영상 업로드"}
            </button>
          </div>
          <p class="latte-art-upload-status" data-item-id="${item.id}" hidden></p>
        </div>
      `;
    })
    .join("");

  return `
    <section class="latte-art-card">
      <h2 class="section-title">라떼아트 영상 (카페라떼 ${latteItems.length}잔)</h2>
      ${cards}
    </section>
  `;
}

function renderDetail(order) {
  currentOrder = order;
  editLink.href = `./edit.html?id=${encodeURIComponent(order.id)}`;

  const itemRows = order.items
    .map((item) => {
      const menu = getMenuById(item.menuId);
      const name = menu ? menu.name : "알 수 없는 메뉴";
      const subtotal = menu ? menu.price * item.quantity : 0;
      return `
        <div class="item-row">
          <div>
            <div class="item-name">${name}</div>
            <div class="item-qty">${item.quantity}개</div>
          </div>
          <span class="item-subtotal">${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  content.innerHTML = `
    <section class="detail-card">
      <div class="detail-top">
        <div>
          <p class="eyebrow">Order Detail</p>
          <div class="order-id">${order.id}</div>
        </div>
        <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
      </div>
      <p class="order-date">${formatDate(order.createdAt)}</p>

      <h2 class="section-title">주문 항목</h2>
      <div class="item-list">${itemRows}</div>

      <div class="total-row">
        <span class="total-label">총 결제 금액</span>
        <span class="total-value">${formatPrice(getOrderTotalPrice(order))}</span>
      </div>
    </section>

    ${renderOrderItemLatteArtSection(order)}
  `;

  bindOrderItemLatteArtEvents();
}

function showLatteArtItemStatus(itemId, message) {
  const statusEl = document.querySelector(`.latte-art-upload-status[data-item-id="${itemId}"]`);
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = !message;
}

function bindOrderItemLatteArtEvents() {
  document.querySelectorAll(".latte-art-upload-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.itemId;
      const fileInput = document.querySelector(`.latte-art-video-input[data-item-id="${itemId}"]`);
      const file = fileInput.files[0];
      const item = currentOrder.items.find((i) => String(i.id) === itemId);

      if (!file) {
        showLatteArtItemStatus(itemId, "업로드할 영상 파일을 선택해주세요.");
        return;
      }
      if (!file.type.startsWith("video/")) {
        showLatteArtItemStatus(itemId, "video 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showLatteArtItemStatus(itemId, "파일 용량은 50MB 이하만 업로드할 수 있습니다.");
        return;
      }

      if (item && item.latteArtVideoUrl) {
        const confirmed = window.confirm("이미 업로드된 영상이 있습니다. 새 영상으로 교체할까요?");
        if (!confirmed) return;
      }

      btn.disabled = true;
      showLatteArtItemStatus(itemId, "업로드 중...");

      let updated = null;
      try {
        updated = await uploadOrderItemLatteArtVideo(itemId, file);
      } catch (err) {
        console.error("uploadOrderItemLatteArtVideo threw:", err);
      }

      btn.disabled = false;

      if (!updated) {
        showLatteArtItemStatus(itemId, "업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const refreshed = await getOrderById(currentOrder.id);
      renderDetail(refreshed);
    });
  });
}

async function init() {
  await getAllMenus();

  const order = orderId ? await getOrderById(orderId) : null;

  if (!order) {
    renderEmpty();
    return;
  }

  renderDetail(order);
}

init();
