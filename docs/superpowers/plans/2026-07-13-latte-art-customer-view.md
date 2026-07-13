# 14단계: 고객 - 라떼아트 영상 확인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 고객이 자신의 주문 상세 페이지에서 라떼아트 요청 내용을 보고, 관리자가 업로드한 영상이 있으면 재생해서 볼 수 있게 한다. 아직 업로드 전이면 "제작 중" 안내를, Supabase 조회 자체가 실패하면 그 사실을 안내하되 — 어느 경우든 주문 기본 정보(품목/금액/상태)는 항상 정상적으로 보여야 한다.

**Architecture:** `frontend/orders/detail.js`를 async 초기화로 바꾸고 12단계의 `getLatteArtByOrderId`를 호출한다. 13단계(관리자 페이지) 최종 리뷰에서 발견된 실수 — Supabase 조회를 `try/catch` 없이 await해서 클라이언트 초기화 자체가 실패하면 페이지 전체가 빈 화면이 되던 문제 — 를 이번엔 처음부터 반영해서 피한다. 업로드 UI는 없다(읽기 전용) — 13단계 관리자 페이지의 읽기 전용 버전이라고 보면 된다.

**Tech Stack:** Vanilla JS, `@supabase/supabase-js@2` (CDN, 12/13단계에서 검증된 로딩 방식 재사용), Supabase Postgres(`latte_art_orders`, 스키마 변경 없음).

## Global Constraints

- 이 프로젝트에는 자동화된 테스트가 없고, 이 환경에는 브라우저 자동화 도구도 DOM 라이브러리도 없다. 검증은 (a) 실제 Supabase 호출 부분은 Node `vm` + 실제 `@supabase/supabase-js` 패키지로 라이브 프로젝트에 대고 확인, (b) DOM 렌더링은 코드 트레이스 — 13/12단계와 동일한 방식.
- No build tool, no bundler. `<script>` 태그 순서: CDN UMD → `supabase-client.js` → `latte-art.js` → 기존 파일들(`data.js`, `utils.js`, `detail.js`) — 12/13단계에서 확립한 순서 그대로.
- **에러 격리가 이 단계의 핵심 요구사항이다** (BLUEPRINT.md 14단계에 명시): `getLatteArtByOrderId` 호출은 반드시 `try/catch`로 감싸고, 실패해도 `renderOrderDetail()`은 항상 정상적으로 호출되어 주문 기본 정보를 보여줘야 한다. 13단계에서 이걸 빠뜨렸다가 최종 리뷰에서 잡혔다 — 이번엔 처음부터 넣는다.
- **"조회 실패"와 "요청 없음"을 구분하는 방법에 대한 결정 사항**: `getLatteArtByOrderId`는 12단계 계약상 내부 오류(예: DB 쿼리 에러)와 "해당 order_id에 요청 없음"을 똑같이 `null` 반환으로 처리한다(함수 자체를 바꾸지 않음 — 12단계에서 이미 리뷰 통과한 계약이라 이 단계에서 변경 대상 아님). 따라서 이 페이지가 실제로 구분할 수 있는 것은 "Supabase 클라이언트 자체를 못 만들거나 네트워크 요청이 throw된 경우"(→ `catch` 블록 → 명시적 에러 안내 문구)뿐이고, "요청이 원래 없음"과 "내부 쿼리 에러로 null이 반환된 경우"는 둘 다 섹션을 아예 안 보여주는 것으로 처리한다. 이건 사용자 경험상 더 안전한 선택(대다수 주문은 라떼아트 요청이 없으므로, 애매한 실패를 "요청 없음"처럼 조용히 처리하는 게 매번 에러 배너를 띄우는 것보다 낫다) — 이 방식을 그대로 구현할 것.
- 라떼아트 요청이 없는 주문(대다수)에서는 새 섹션이 아예 렌더링되지 않아야 한다 — 기존 주문 상세 화면에 영향 없음.
- 업로드 UI 없음 — 이 페이지는 읽기 전용이다.

---

## Task 1: `frontend/orders/detail.html` + `detail.css` — 스크립트 로딩 + 스타일

**Files:**
- Modify: `frontend/orders/detail.html`, `frontend/orders/detail.css`

**Interfaces:**
- Consumes: 없음
- Produces: `getSupabaseClient`, `getLatteArtByOrderId` 전역 함수가 `detail.js` 실행 전에 사용 가능해짐. CSS 클래스 `.latte-art-section`, `.section-title`, `.latte-art-request-detail`, `.latte-art-video`, `.latte-art-status` (Task 2가 이 클래스명으로 마크업을 만듦).

- [ ] **Step 1: `frontend/orders/detail.html`에 스크립트 태그 3개 추가**

기존 `<script src="../js/data.js"></script>` 줄 바로 앞에 추가:

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="../js/supabase-client.js"></script>
  <script src="../js/latte-art.js"></script>
```

전체 스크립트 섹션은 이렇게 된다:

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="../js/supabase-client.js"></script>
  <script src="../js/latte-art.js"></script>
  <script src="../js/data.js"></script>
  <script src="../js/utils.js"></script>
  <script src="detail.js"></script>
```

- [ ] **Step 2: `frontend/orders/detail.css` 끝에 라떼아트 섹션 스타일 추가**

이 파일은 관리자 페이지(`admin/orders/detail.css`)와 달리 `.glass` 유틸리티 클래스를 HTML에서 직접 조합해서 쓰는 방식이다(예: `<div class="order-item-list glass">`) — 배경/테두리/블러/그림자는 `.glass`가 이미 담당하므로, 여기서는 레이아웃 속성만 추가한다:

```css

/* ===== Latte Art Section ===== */
.latte-art-section {
  margin-top: var(--space-lg);
  padding: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.latte-art-request-detail {
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.latte-art-video {
  width: 100%;
  max-height: 360px;
  border-radius: var(--radius-md);
  background: #000;
}

.latte-art-status {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
```

- [ ] **Step 3: 검증 (코드 리뷰 방식 — 브라우저 없음)**

`frontend/orders/detail.html`의 최종 `<script>` 순서가 위 6줄과 정확히 일치하는지 확인. `frontend/orders/detail.css`에 추가한 모든 `var(--...)` 참조(`--space-lg`, `--font-size-md`, `--space-sm`, `--space-md`, `--radius-md`, `--color-text-muted`, `--font-size-sm`)가 `frontend/css/variables.css`에 실제로 정의되어 있는지 하나씩 대조 확인.

- [ ] **Step 4: 커밋**

```bash
git add frontend/orders/detail.html frontend/orders/detail.css
git commit -m "feat: 고객 주문 상세에 라떼아트 섹션 스크립트/스타일 추가"
```

---

## Task 2: `frontend/orders/detail.js` — 라떼아트 요청/영상 표시 (에러 격리 포함)

**Files:**
- Modify: `frontend/orders/detail.js` (전체 재작성)

**Interfaces:**
- Consumes: `getLatteArtByOrderId(orderId)` (12단계, `frontend/js/latte-art.js`), `LATTE_ART_SHAPES` (11단계, `frontend/js/data.js`), `escapeHtml` (11단계, `frontend/js/utils.js`), CSS 클래스 (Task 1)
- Produces: 없음 (터미널 UI)

- [ ] **Step 1: `frontend/orders/detail.js` 전체를 다음으로 교체**

```js
// ===== 상태 =====
let currentOrder = null;
let currentLatteArt = null;
let latteArtFetchFailed = false;

// ===== 초기화 =====
async function init() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  currentOrder = orderId ? getOrderById(orderId) : null;

  if (currentOrder) {
    try {
      currentLatteArt = await getLatteArtByOrderId(currentOrder.id);
    } catch (err) {
      console.error("getLatteArtByOrderId threw:", err);
      latteArtFetchFailed = true;
    }
  }

  renderOrderDetail();
  updateCartBadge();
}

// ===== 라떼아트 섹션 렌더링 =====
function renderLatteArtSection() {
  if (latteArtFetchFailed) {
    return `
      <div class="latte-art-section glass">
        <h2 class="section-title">라떼아트 요청</h2>
        <p class="latte-art-status">라떼아트 정보를 불러올 수 없습니다.</p>
      </div>
    `;
  }

  if (!currentLatteArt) return "";

  const shapeInfo = LATTE_ART_SHAPES.find((shape) => shape.id === currentLatteArt.shape);
  const detailText =
    currentLatteArt.shape === "custom"
      ? currentLatteArt.note || "설명 없음"
      : shapeInfo
      ? shapeInfo.label
      : currentLatteArt.shape;

  const videoSection = currentLatteArt.video_url
    ? `<video class="latte-art-video" src="${escapeHtml(currentLatteArt.video_url)}" controls></video>`
    : `<p class="latte-art-status">라떼아트 영상을 제작 중이에요. 완성되면 이곳에서 볼 수 있어요.</p>`;

  return `
    <div class="latte-art-section glass">
      <h2 class="section-title">라떼아트 요청</h2>
      <p class="latte-art-request-detail">${escapeHtml(detailText)}</p>
      ${videoSection}
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

    ${renderLatteArtSection()}
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
```

중요한 부분 설명 (구현 시 그대로 옮길 것, 바꾸지 말 것):
- `if (currentOrder) { try { ... } }` — `currentOrder`가 없으면(잘못된 주문 ID) Supabase 호출 자체를 시도하지 않는다. 13단계 관리자 페이지와 동일한 가드.
- `try/catch`가 `getLatteArtByOrderId` 호출 전체를 감싸는 것은 13단계 최종 리뷰에서 발견된 문제(Supabase 클라이언트 생성 자체가 throw하면 `await`가 전체 페이지 렌더링을 막아버림)를 처음부터 방지하기 위함이다. `catch` 블록은 `latteArtFetchFailed = true`만 설정하고 그 외에는 아무것도 하지 않는다 — `renderOrderDetail()`은 무조건 호출된다.
- `renderOrderDetail()`은 `currentOrder`가 없을 때를 제외하면 항상 실행되고, 그 안에서 `renderLatteArtSection()`을 호출한다 — Supabase 쪽이 어떻게 되든 주문 품목/금액/상태는 항상 보인다.
- `latteArtFetchFailed`와 `currentLatteArt`(둘 다 없음/null)를 구분해서 다르게 렌더링한다: 전자는 명시적 에러 문구, 후자는 섹션 자체를 안 보여줌(요청이 원래 없는 대다수 주문에 해당). 이건 의도된 설계이지 실수가 아니다 — Global Constraints에 이유가 적혀 있다.
- `escapeHtml`은 `detailText`(고객이 "기타" 선택 시 입력한 자유 텍스트 — 11단계에서 XSS로 판명된 필드와 동일)와 `video_url`에 적용한다. 관리자 페이지와 달리 `item_name`은 이 페이지 마크업에 넣지 않으므로(고객은 이미 위에 주문 품목 목록을 보고 있음) 해당 이스케이프는 필요 없다 — 빠진 게 아니라 애초에 안 쓰는 값이다.

- [ ] **Step 2: 검증 — 실제 Supabase 호출 부분**

12/13단계와 동일한 방식(Node `vm` + 실제 `@supabase/supabase-js` 패키지, `npm install @supabase/supabase-js --no-save`로 임시 설치, `package.json`에는 추가하지 않음)으로 확인한다:

1. `mcp__supabase__execute_sql`로 테스트용 라떼아트 요청 행을 하나 만든다(영상 없는 상태): `insert into public.latte_art_orders (order_id, item_name, shape, note) values ('TEST-VERIFY-4', '카페라떼', 'heart', null) returning *;`
2. 실제 `getLatteArtByOrderId("TEST-VERIFY-4")`를 호출해 방금 만든 행이 그대로 돌아오는지 확인(영상 없는 케이스 재확인 — 13단계에서 이미 검증된 함수라 회귀만 확인하면 충분).
3. 정리: `execute_sql`로 `TEST-VERIFY-4` 행 삭제, 삭제 확인.

**주의:** 이 태스크는 `mcp__supabase__apply_migration`을 호출하지 않는다 — 13단계에서 서브에이전트가 정리를 위해 임시로 프로덕션 정책을 추가/삭제했던 것과 같은 상황이 생기면(예: 업로드 테스트가 필요해서 storage 오브젝트를 만들었는데 지울 방법이 없는 경우) **직접 처리하지 말고 즉시 BLOCKED로 보고할 것.** 이 태스크는 `getLatteArtByOrderId`(읽기 전용 조회)만 호출하므로 애초에 storage 오브젝트를 만들 필요가 없다 — 만약 검증 도중 그런 상황이 생긴다면 계획을 잘못 이해한 것이니 멈추고 물어볼 것.

- [ ] **Step 3: 검증 — DOM 렌더링/에러 격리 (코드 트레이스)**

브라우저도 jsdom도 없으므로, 아래 시나리오를 실제 작성한 코드를 보며 손으로 따라가고 보고서에 근거(줄 인용)를 남긴다:

1. `currentOrder`가 `null`(잘못된 주문 ID) → `getLatteArtByOrderId`를 아예 호출하지 않고 → `renderOrderDetail()`이 "주문을 찾을 수 없습니다" 표시 후 즉시 `return` → `renderLatteArtSection()`은 호출조차 안 됨 (기존 동작과 동일).
2. `currentLatteArt`가 `null`이고 `latteArtFetchFailed`가 `false`(라떼아트 요청 없는 일반 주문, 대다수 케이스) → `renderLatteArtSection()`이 `""` 반환 → 기존 주문 상세 화면과 완전히 동일하게 보임.
3. `latteArtFetchFailed`가 `true`(예: `getSupabaseClient()`가 throw) → 주문 품목/금액/상태는 정상 표시되고, 그 아래에 "라떼아트 정보를 불러올 수 없습니다" 문구만 추가로 보임 — **페이지 전체가 깨지지 않는지 반드시 확인** (이게 이 태스크의 핵심 요구사항).
4. `currentLatteArt`가 있고 `video_url`이 없음 → "제작 중" 안내 문구.
5. `currentLatteArt.video_url`이 있음 → `<video controls>` 태그로 재생 가능하게 표시.
6. 업로드 관련 UI(파일 입력, 버튼)가 이 페이지에는 전혀 없는지 확인(13단계 관리자 페이지와의 유일한 기능 차이).

- [ ] **Step 4: 커밋**

```bash
git add frontend/orders/detail.js
git commit -m "feat: 고객 주문 상세에서 라떼아트 요청/영상 확인 (에러 격리 포함)"
```

---

## Task 3: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (14단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 14단계 체크박스 2개를 `- [x]`로 변경**
- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 14단계 체크 표시"
```
