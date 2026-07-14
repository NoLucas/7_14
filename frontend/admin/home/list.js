const slotList = document.getElementById("slotList");
let slots = [];

function showSlotStatus(slot, message) {
  const statusEl = document.querySelector(`.slot-status[data-slot="${slot}"]`);
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = false;
}

function renderSlots() {
  slotList.innerHTML = slots
    .map((row) => {
      const preview = row.video_url
        ? `<video class="slot-video" src="${escapeHtml(row.video_url)}" controls></video>`
        : `<div class="slot-empty">비어있음</div>`;

      return `
        <article class="slot-card glass">
          <h2 class="section-title">슬롯 ${row.slot}</h2>
          ${preview}
          <div class="slot-upload">
            <input type="file" class="slot-file-input" data-slot="${row.slot}" accept="video/*" />
            <button type="button" class="slot-upload-btn" data-slot="${row.slot}">
              ${row.video_url ? "영상 교체" : "영상 업로드"}
            </button>
            ${
              row.video_url
                ? `<button type="button" class="action-button warn slot-delete-btn" data-slot="${row.slot}">삭제</button>`
                : ""
            }
          </div>
          <p class="slot-status" data-slot="${row.slot}" hidden></p>
        </article>
      `;
    })
    .join("");

  bindSlotEvents();
}

function bindSlotEvents() {
  document.querySelectorAll(".slot-upload-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const slot = Number(btn.dataset.slot);
      const fileInput = document.querySelector(`.slot-file-input[data-slot="${slot}"]`);
      const file = fileInput.files[0];

      if (!file) {
        showSlotStatus(slot, "업로드할 영상 파일을 선택해주세요.");
        return;
      }
      if (!file.type.startsWith("video/")) {
        showSlotStatus(slot, "video 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showSlotStatus(slot, "파일 용량은 50MB 이하만 업로드할 수 있습니다.");
        return;
      }

      btn.disabled = true;
      showSlotStatus(slot, "업로드 중...");

      let updated = null;
      try {
        updated = await updateHomeGalleryVideo(slot, file);
      } catch (err) {
        console.error("updateHomeGalleryVideo threw:", err);
      }

      btn.disabled = false;

      if (!updated) {
        showSlotStatus(slot, "업로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      slots = await getHomeGalleryVideos();
      renderSlots();
    });
  });

  document.querySelectorAll(".slot-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const slot = Number(btn.dataset.slot);
      const confirmed = window.confirm(`슬롯 ${slot}의 영상을 삭제할까요?`);
      if (!confirmed) return;

      btn.disabled = true;

      let updated = null;
      try {
        updated = await deleteHomeGalleryVideo(slot);
      } catch (err) {
        console.error("deleteHomeGalleryVideo threw:", err);
      }

      if (!updated) {
        btn.disabled = false;
        showSlotStatus(slot, "삭제에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      slots = await getHomeGalleryVideos();
      renderSlots();
    });
  });
}

async function init() {
  slots = await getHomeGalleryVideos();
  renderSlots();
}

init();
