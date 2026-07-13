const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

let currentOrder = null;
let currentLatteArt = null;

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

function renderLatteArtSection() {
  if (!currentLatteArt) return "";

  const shapeInfo = LATTE_ART_SHAPES.find((shape) => shape.id === currentLatteArt.shape);
  const detailText =
    currentLatteArt.shape === "custom"
      ? currentLatteArt.note || "설명 없음"
      : shapeInfo
      ? shapeInfo.label
      : currentLatteArt.shape;

  const videoSection = currentLatteArt.video_url
    ? `
      <video class="latte-art-video" src="${escapeHtml(currentLatteArt.video_url)}" controls></video>
      <p class="latte-art-uploaded-at">업로드됨: ${formatDate(currentLatteArt.video_uploaded_at)}</p>
    `
    : `<p class="latte-art-status">아직 영상이 업로드되지 않았습니다.</p>`;

  return `
    <section class="latte-art-card">
      <h2 class="section-title">라떼아트 요청</h2>
      <p class="latte-art-request-detail">${escapeHtml(currentLatteArt.item_name)} · ${escapeHtml(detailText)}</p>
      ${videoSection}
      <div class="latte-art-upload">
        <input type="file" id="latteArtVideoInput" accept="video/*" />
        <button type="button" id="latteArtUploadBtn">${currentLatteArt.video_url ? "영상 교체" : "영상 업로드"}</button>
      </div>
      <p class="latte-art-upload-status" id="latteArtUploadStatus" hidden></p>
    </section>
  `;
}

function renderDetail(order) {
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

    ${renderLatteArtSection()}
  `;

  bindLatteArtUploadEvents();
}

function showLatteArtUploadStatus(message) {
  const statusEl = document.getElementById("latteArtUploadStatus");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = false;
}

function bindLatteArtUploadEvents() {
  const uploadBtn = document.getElementById("latteArtUploadBtn");
  if (!uploadBtn) return;

  uploadBtn.addEventListener("click", async () => {
    const fileInput = document.getElementById("latteArtVideoInput");
    const file = fileInput.files[0];

    if (!file) {
      showLatteArtUploadStatus("업로드할 영상 파일을 선택해주세요.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      showLatteArtUploadStatus("video 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showLatteArtUploadStatus("파일 용량은 50MB 이하만 업로드할 수 있습니다.");
      return;
    }

    uploadBtn.disabled = true;
    showLatteArtUploadStatus("업로드 중...");

    let updated = null;
    try {
      updated = await uploadLatteArtVideo(currentOrder.id, file);
    } catch (err) {
      console.error("uploadLatteArtVideo threw:", err);
    }

    uploadBtn.disabled = false;

    if (!updated) {
      showLatteArtUploadStatus("업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    currentLatteArt = updated;
    renderDetail(currentOrder);
  });
}

async function init() {
  currentOrder = orderId ? getOrderById(orderId) : null;

  if (!currentOrder) {
    renderEmpty();
    return;
  }

  currentLatteArt = await getLatteArtByOrderId(currentOrder.id);
  renderDetail(currentOrder);
}

init();
