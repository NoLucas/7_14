# 13단계: 관리자 - 라떼아트 영상 업로드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 주문 상세 페이지에서, 해당 주문에 라떼아트 요청이 있으면 요청 내용(모양/설명)을 보여주고 바리스타가 촬영한 영상을 업로드할 수 있게 한다. 업로드 성공 시 Supabase에 `video_url`/`video_uploaded_at`이 반영되고 화면에도 즉시 보인다. 이미 업로드된 영상도 언제든 재업로드(교체)할 수 있다.

**Architecture:** `frontend/admin/orders/detail.js`를 async 초기화로 바꾸고, 12단계에서 만든 `getLatteArtByOrderId`/`uploadLatteArtVideo`를 호출한다. 화면에 렌더링할 라떼아트 정보가 없으면(해당 주문이 라떼아트 대상이 아니면) 섹션 자체를 렌더링하지 않는다. 12단계 최종 리뷰에서 남긴 알려진 이슈("`uploadLatteArtVideo`의 `storage.upload()`가 이론상 reject할 수 있어 '절대 throw하지 않는다'는 계약이 깨질 수 있음")를 여기서 실제로 처리한다 — 업로드 호출을 `try/catch`로 감싼다.

**Tech Stack:** Vanilla JS, `@supabase/supabase-js@2` (CDN, 12단계에서 이미 검증된 로딩 방식 그대로 재사용), Supabase Postgres + Storage (12단계에서 만든 `latte_art_orders` 테이블/`latte-art-videos` 버킷 그대로 사용, 스키마 변경 없음).

## Global Constraints

- 이 프로젝트에는 자동화된 테스트가 없고, 이 환경에는 브라우저 자동화 도구도 DOM 라이브러리(jsdom 등)도 없다. 검증은 두 갈래로 한다: (a) Supabase를 실제로 호출하는 로직(`getLatteArtByOrderId`, `uploadLatteArtVideo` 호출부)은 12단계처럼 Node에서 실제 `@supabase/supabase-js` 패키지로 실제 프로젝트에 대고 검증, (b) DOM 렌더링/이벤트 바인딩은 코드 트레이스로 검증 (11단계 Task 3와 동일한 방식).
- No build tool, no bundler. 새 `<script>` 태그는 12단계에서 확립한 순서(CDN UMD → `supabase-client.js` → `latte-art.js` → 기존 파일들)를 그대로 따른다.
- 파일 검증: `video/*` MIME 타입, 50MB 용량 상한 — 클라이언트 단 체크. (Storage 버킷 자체에도 12단계 최종 리뷰에서 동일한 제한이 걸려 있음 — 서버 측 방어선은 이미 있고, 이건 사용자 경험을 위한 클라이언트 측 사전 체크.)
- `getLatteArtByOrderId`/`uploadLatteArtVideo`의 함수 시그니처, 반환값 계약(`null` on error/no data)은 12단계에서 이미 확정되어 리뷰 통과함 — 이 단계에서 그 함수들 자체를 변경하지 않는다.
- 라떼아트 요청이 없는 주문(대부분의 주문)에서는 새 섹션이 아예 렌더링되지 않아야 한다 — 기존 주문 상세 화면에 영향 없음.

---

## Task 1: `frontend/admin/orders/detail.html` + `detail.css` — 스크립트 로딩 + 스타일

**Files:**
- Modify: `frontend/admin/orders/detail.html`, `frontend/admin/orders/detail.css`

**Interfaces:**
- Consumes: 없음 (순수 정적 리소스 추가)
- Produces: `getSupabaseClient`, `getLatteArtByOrderId`, `uploadLatteArtVideo` 전역 함수가 `detail.js` 실행 전에 사용 가능해짐 (Task 2가 이 순서에 의존). CSS 클래스 `.latte-art-card`, `.latte-art-request-detail`, `.latte-art-video`, `.latte-art-uploaded-at`, `.latte-art-status`, `.latte-art-upload`, `.latte-art-upload-status` (Task 2가 이 클래스명으로 마크업을 만듦).

- [ ] **Step 1: `frontend/admin/orders/detail.html`에 스크립트 태그 3개 추가**

기존 `<script src="../../js/data.js"></script>` 줄 바로 앞에 추가 (12단계에서 확립한 순서와 동일 — CDN 라이브러리가 `supabase-client.js`보다 먼저, `latte-art.js`는 `data.js`보다 먼저):

```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
    <script src="../../js/supabase-client.js"></script>
    <script src="../../js/latte-art.js"></script>
```

전체 스크립트 섹션은 이렇게 된다:

```html
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
    <script src="../../js/supabase-client.js"></script>
    <script src="../../js/latte-art.js"></script>
    <script src="../../js/data.js"></script>
    <script src="../../js/utils.js"></script>
    <script src="./detail.js"></script>
```

- [ ] **Step 2: `frontend/admin/orders/detail.css` 끝에 라떼아트 섹션 스타일 추가**

```css

/* ===== Latte Art Section ===== */
.latte-art-card {
  margin-top: var(--space-lg);
  padding: var(--space-xl);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.latte-art-request-detail {
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.latte-art-video {
  width: 100%;
  max-height: 360px;
  border-radius: var(--radius-md);
  background: #000;
  margin-bottom: var(--space-sm);
}

.latte-art-uploaded-at,
.latte-art-status {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.latte-art-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
}

.latte-art-upload input[type="file"] {
  flex: 1;
  min-width: 0;
}

.latte-art-upload button {
  padding: 0.85rem 1.15rem;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.latte-art-upload button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.latte-art-upload-status {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: 검증 (코드 리뷰 방식 — 브라우저 없음)**

`frontend/admin/orders/detail.html`의 최종 `<script>` 순서가 위 6줄과 정확히 일치하는지 확인. `frontend/admin/orders/detail.css`에 추가한 모든 `var(--...)` 참조가 `frontend/css/variables.css`에 실제로 정의되어 있는지 하나씩 대조 확인(`--space-lg`, `--space-xl`, `--space-md`, `--space-sm`, `--glass-bg`, `--glass-border`, `--glass-blur`, `--radius-lg`, `--radius-md`, `--radius-full`, `--shadow-md`, `--color-text-muted`, `--font-size-sm`, `--color-primary`, `--color-text-inverse`). 정의되지 않은 변수가 있으면 스타일이 조용히 깨지므로 반드시 하나하나 확인할 것.

- [ ] **Step 4: 커밋**

```bash
git add frontend/admin/orders/detail.html frontend/admin/orders/detail.css
git commit -m "feat: 관리자 주문 상세에 라떼아트 섹션 스크립트/스타일 추가"
```

---

## Task 2: `frontend/admin/orders/detail.js` — 라떼아트 요청 표시 + 영상 업로드

**Files:**
- Modify: `frontend/admin/orders/detail.js` (전체 재작성)

**Interfaces:**
- Consumes: `getLatteArtByOrderId(orderId)` / `uploadLatteArtVideo(orderId, file)` (12단계, `frontend/js/latte-art.js`), `LATTE_ART_SHAPES` (11단계, `frontend/js/data.js`), `escapeHtml` (11단계, `frontend/js/utils.js`), CSS 클래스 (Task 1)
- Produces: 없음 (터미널 UI)

- [ ] **Step 1: `frontend/admin/orders/detail.js` 전체를 다음으로 교체**

```js
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
```

중요한 부분 설명 (구현 시 그대로 옮길 것, 바꾸지 말 것):
- `uploadLatteArtVideo` 호출을 `try/catch`로 감싼 것은 12단계 최종 리뷰에서 남긴 알려진 이슈("storage `.upload()`가 이론상 reject할 수 있음")를 여기서 처리하기 위함이다. `catch` 블록은 `updated`를 `null`인 채로 두어(초기값 유지), 아래 `if (!updated)` 분기가 "실패" 상태를 정상적으로 처리하게 만든다.
- `renderLatteArtSection()`이 `currentLatteArt`가 없을 때 빈 문자열을 반환하므로, 라떼아트 요청이 없는 주문(대다수)에서는 새 섹션이 아예 안 보인다 — 기존 주문 상세 화면과 100% 동일하게 유지된다.
- `escapeHtml`은 `currentLatteArt.item_name`(11단계 메뉴 상세에서 온 값, 관리 대상 메뉴 이름이라 낮은 위험) / `detailText`(고객이 "기타" 선택 시 직접 입력한 자유 텍스트 — 11단계에서 XSS로 판명되어 이스케이프 처리된 것과 동일한 필드) / `video_url`(우리 코드가 만든 값이지만 원본 파일명 일부를 포함하므로 방어적으로 이스케이프)에 모두 적용한다. 하나라도 빠뜨리지 말 것.

- [ ] **Step 2: 검증 — 실제 Supabase 호출 부분**

12단계와 동일한 방식(Node `vm` + 실제 `@supabase/supabase-js` 패키지, `npm install @supabase/supabase-js --no-save`로 임시 설치, `package.json`에는 추가하지 않음)으로 실제 원격 프로젝트에 대고 확인한다:

1. `mcp__supabase__execute_sql`로 테스트용 라떼아트 요청 행을 하나 직접 만든다: `insert into public.latte_art_orders (order_id, item_name, shape, note) values ('TEST-VERIFY-3', '카페라떼', 'heart', null) returning *;`
2. 실제 `frontend/js/latte-art.js`의 `getLatteArtByOrderId("TEST-VERIFY-3")`를 real Supabase client로 호출해, 방금 만든 행이 그대로 돌아오는지 확인.
3. 실제 `uploadLatteArtVideo("TEST-VERIFY-3", <작은 테스트 Blob/파일>)`을 호출해 성공적으로 `video_url`/`video_uploaded_at`이 채워진 행이 돌아오는지 확인 (12단계 Task 4에서 이미 검증된 경로이므로, 여기서는 "관리자 페이지가 실제로 사용하는 것과 동일한 호출 패턴"이라는 것만 재확인하면 충분 — 새로운 실패 모드를 찾는 게 목적이 아니라 회귀가 없는지 확인하는 것).
4. 정리: `execute_sql`로 `TEST-VERIFY-3` 행 삭제, 업로드된 테스트 오브젝트도 `storage.objects`에서 삭제 확인.

- [ ] **Step 3: 검증 — DOM 렌더링/이벤트 바인딩 (코드 트레이스)**

브라우저도 jsdom도 없으므로, 아래 시나리오를 실제 작성한 코드를 보며 손으로 따라가고 보고서에 근거(줄 인용)를 남긴다:

1. `currentLatteArt`가 `null`인 주문(라떼아트 요청 없음) → `renderLatteArtSection()`이 `""`를 반환 → `content.innerHTML`에 빈 문자열이 붙을 뿐 아무 것도 추가로 안 보임 → `bindLatteArtUploadEvents()`가 `document.getElementById("latteArtUploadBtn")`을 못 찾아 `null` 체크로 조용히 리턴 (에러 없음).
2. `currentLatteArt`가 있고 `video_url`이 없는 경우 → "아직 영상이 업로드되지 않았습니다" 문구 + "영상 업로드" 버튼 라벨.
3. `currentLatteArt.video_url`이 있는 경우 → `<video>` 태그로 재생 + "영상 교체" 버튼 라벨 (재업로드 허용 요건 확인).
4. 업로드 버튼 클릭 시: 파일 미선택 → 안내 메시지, `video/*` 아닌 타입 → 안내 메시지, 50MB 초과 → 안내 메시지 — 셋 다 `uploadLatteArtVideo` 호출 전에 `return`하는지 확인.
5. 업로드 성공 시 `currentLatteArt`가 갱신되고 `renderDetail(currentOrder)`가 다시 호출되어, 이번엔 `video_url`이 채워진 상태로 다시 렌더링되는지(버튼 라벨이 "영상 교체"로 바뀌는지) 확인.
6. 업로드 실패(`updated`가 `null`)시 `currentLatteArt`를 건드리지 않고 실패 메시지만 표시하는지, 그리고 `uploadBtn.disabled`가 다시 `false`로 풀리는지 확인 (사용자가 재시도할 수 있어야 함).

- [ ] **Step 4: 커밋**

```bash
git add frontend/admin/orders/detail.js
git commit -m "feat: 관리자 주문 상세에서 라떼아트 요청 표시 및 영상 업로드"
```

---

## Task 3: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (13단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 13단계 체크박스 3개를 `- [x]`로 변경**
- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 13단계 체크 표시"
```
