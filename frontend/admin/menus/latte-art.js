const shapeList = document.getElementById("shapeList");

function renderMediaPreview(shape) {
  if (shape.video_url) {
    return `<video class="shape-media" src="${escapeHtml(shape.video_url)}" controls></video>`;
  }
  if (shape.image_url) {
    return `<img class="shape-media" src="${escapeHtml(shape.image_url)}" alt="${escapeHtml(shape.label)}" />`;
  }
  return `<div class="shape-emoji">${shape.icon}</div>`;
}

function showShapeStatus(shapeId, message) {
  const statusEl = document.querySelector(`.shape-status[data-shape-id="${shapeId}"]`);
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = !message;
}

function renderShapes() {
  shapeList.innerHTML = LATTE_ART_SHAPES.map((shape) => {
    const hasMedia = Boolean(shape.video_url || shape.image_url);
    return `
      <article class="shape-card glass">
        <h2 class="section-title">${shape.icon} ${escapeHtml(shape.label)}</h2>
        ${renderMediaPreview(shape)}
        <div class="shape-upload">
          <input type="file" class="shape-file-input" data-shape-id="${shape.id}" accept="image/*,video/*" />
          <button type="button" class="shape-upload-btn" data-shape-id="${shape.id}">
            ${hasMedia ? "미디어 교체" : "미디어 업로드"}
          </button>
          ${
            hasMedia
              ? `<button type="button" class="action-button warn shape-delete-btn" data-shape-id="${shape.id}">삭제</button>`
              : ""
          }
        </div>
        <p class="shape-status" data-shape-id="${shape.id}" hidden></p>
      </article>
    `;
  }).join("");

  bindShapeEvents();
}

function bindShapeEvents() {
  document.querySelectorAll(".shape-upload-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const shapeId = btn.dataset.shapeId;
      const fileInput = document.querySelector(`.shape-file-input[data-shape-id="${shapeId}"]`);
      const file = fileInput.files[0];

      if (!file) {
        showShapeStatus(shapeId, "업로드할 사진 또는 영상 파일을 선택해주세요.");
        return;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        showShapeStatus(shapeId, "이미지 또는 영상 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showShapeStatus(shapeId, "파일 용량은 50MB 이하만 업로드할 수 있습니다.");
        return;
      }

      btn.disabled = true;
      showShapeStatus(shapeId, "업로드 중...");

      let updated = null;
      try {
        updated = await updateLatteArtShapeMedia(shapeId, file);
      } catch (err) {
        console.error("updateLatteArtShapeMedia threw:", err);
      }

      btn.disabled = false;

      if (!updated) {
        showShapeStatus(shapeId, "업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      renderShapes();
    });
  });

  document.querySelectorAll(".shape-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const shapeId = btn.dataset.shapeId;
      const confirmed = window.confirm("이 미디어를 삭제할까요? (이모티콘 표시로 되돌아갑니다)");
      if (!confirmed) return;

      btn.disabled = true;

      let updated = null;
      try {
        updated = await deleteLatteArtShapeMedia(shapeId);
      } catch (err) {
        console.error("deleteLatteArtShapeMedia threw:", err);
      }

      if (!updated) {
        btn.disabled = false;
        showShapeStatus(shapeId, "삭제에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      renderShapes();
    });
  });
}

async function init() {
  await getLatteArtShapes();
  renderShapes();
}

init();
