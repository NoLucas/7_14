const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const menuId = params.get("id");

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>메뉴를 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

let currentMenu = null;
let currentVideos = [];

function renderMenuLatteArtSection() {
  if (!currentMenu.latteArtAvailable) return "";

  const videoItems = currentVideos.length
    ? currentVideos
        .map(
          (video) => `
            <div class="latte-art-video-item">
              <video class="latte-art-video" src="${escapeHtml(video.video_url)}" controls></video>
              <button type="button" class="action-button warn" data-action="delete-video" data-id="${video.id}">영상 삭제</button>
            </div>
          `
        )
        .join("")
    : `<p class="latte-art-status">아직 등록된 영상이 없습니다.</p>`;

  return `
    <section class="latte-art-card">
      <h2 class="section-title">라떼아트 영상 (${currentVideos.length}개)</h2>
      <div class="latte-art-video-list">${videoItems}</div>
      <div class="latte-art-upload">
        <input type="file" id="latteArtVideoInput" accept="video/*" />
        <button type="button" id="latteArtUploadBtn">영상 추가</button>
      </div>
      <p class="latte-art-upload-status" id="latteArtUploadStatus" hidden></p>
    </section>
  `;
}

function showLatteArtUploadStatus(message) {
  const statusEl = document.getElementById("latteArtUploadStatus");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = false;
}

function bindMenuLatteArtEvents() {
  const uploadBtn = document.getElementById("latteArtUploadBtn");
  if (uploadBtn) {
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

      let added = null;
      try {
        added = await addMenuLatteArtVideo(currentMenu.id, file);
      } catch (err) {
        console.error("addMenuLatteArtVideo threw:", err);
      }

      uploadBtn.disabled = false;

      if (!added) {
        showLatteArtUploadStatus("업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      currentVideos = await getMenuLatteArtVideos(currentMenu.id);
      renderDetail(currentMenu);
    });
  }

  document.querySelectorAll('[data-action="delete-video"]').forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", async () => {
      const confirmed = window.confirm("이 영상을 삭제할까요?");
      if (!confirmed) return;

      deleteBtn.disabled = true;

      let ok = false;
      try {
        ok = await deleteMenuLatteArtVideoById(deleteBtn.dataset.id);
      } catch (err) {
        console.error("deleteMenuLatteArtVideoById threw:", err);
      }

      if (!ok) {
        deleteBtn.disabled = false;
        showLatteArtUploadStatus("삭제에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      currentVideos = await getMenuLatteArtVideos(currentMenu.id);
      renderDetail(currentMenu);
    });
  });
}

function renderDetail(menu) {
  currentMenu = menu;
  const category = getCategoryById(menu.categoryId);
  editLink.href = `./edit.html?id=${encodeURIComponent(menu.id)}`;

  content.innerHTML = `
    <section class="detail-card">
      <div class="detail-top">
        <div>
          <p class="eyebrow">Menu Detail</p>
          <div class="title-row">
            <h1>${menu.name}</h1>
            <span class="badge category">${category ? category.name : "미분류"}</span>
            ${menu.soldOut ? '<span class="badge soldout">품절</span>' : ""}
          </div>
          <p class="description">${menu.description || "설명이 아직 등록되지 않았습니다."}</p>
        </div>
        <div class="price">${formatPrice(menu.price)}</div>
      </div>

      <div class="detail-grid">
        <article class="info-box">
          <span>메뉴 ID</span>
          <strong>${menu.id}</strong>
        </article>
        <article class="info-box">
          <span>이미지 경로</span>
          <strong>${menu.image || "미등록"}</strong>
        </article>
        <article class="info-box">
          <span>판매 상태</span>
          <strong>${menu.soldOut ? "품절" : "판매 중"}</strong>
        </article>
        <article class="info-box">
          <span>라떼아트</span>
          <strong>${menu.latteArtAvailable ? "가능" : "불가"}</strong>
        </article>
      </div>
    </section>

    ${renderMenuLatteArtSection()}
  `;

  bindMenuLatteArtEvents();
}

async function init() {
  await Promise.all([getAllMenus(), getCategories()]);
  const menu = menuId ? getMenuById(menuId) : null;

  if (!menu) {
    renderEmpty();
    return;
  }

  if (menu.latteArtAvailable) {
    currentVideos = await getMenuLatteArtVideos(menu.id);
  }
  renderDetail(menu);
}

init();
