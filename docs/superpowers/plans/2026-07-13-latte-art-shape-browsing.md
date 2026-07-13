# 16단계: 메뉴 목록 - 라떼아트 모양 탐색 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라떼아트도 하나의 "메뉴"로 취급해, 메뉴 목록 페이지의 카테고리 탭에 "라떼아트" 탭을 추가한다. 탭을 고르면 프리셋 모양 4종(하트/로제타/튤립/곰돌이)이 커피 카드와 같은 비주얼로 보이고, 모양을 클릭하면 그 모양을 만들 수 있는 커피 3종(카페라떼/카푸치노/바닐라라떼)이 카드로 나온다. 커피를 클릭하면 기존 메뉴 상세 페이지로 이동하되 그 모양이 미리 선택된 채로 열린다.

**Architecture:** 이 기능은 Supabase를 전혀 쓰지 않는다 — `LATTE_ART_SHAPES`(로컬 상수)와 `MENUS`(로컬 데이터)만으로 동작하는 순수 탐색 UI다. 11단계에서 이미 구현된 모양 선택/저장 로직(`selectedLatteArtShape`, `applyLatteArtSelection` 등)은 건드리지 않고, `frontend/menus/detail.js`의 `init()`이 URL의 `shape` 쿼리 파라미터를 읽어 그 값으로 `selectedLatteArtShape`의 **초기값**만 세팅하도록 한 줄기를 추가한다. 새 페이지 `latte-art-detail.html`은 `frontend/menus/list.css`를 그대로 링크해서 `.menu-card`/`.menu-grid` 비주얼을 재사용한다(이 프로젝트의 다른 페이지들은 각자 페이지 CSS를 독립적으로 갖지만, 이 페이지는 `list.html`에서 바로 이어지는 상세 페이지라 카드 스타일을 그대로 재사용하는 게 더 일관적이다 — 의도된 예외).

**Tech Stack:** Vanilla JS, localStorage/정적 데이터만 사용(백엔드/Supabase 없음).

## Global Constraints

- 이 프로젝트에는 자동화된 테스트가 없다. 하지만 이번 단계부터는 **로컬에서 실제 브라우저로 검증한다** — 이 환경에 Playwright가 설치되어 있고 실제로 동작하는 것을 확인했다(스크래치패드에 `npm install playwright --no-save`로 설치, `npx playwright install chromium`으로 브라우저 확보, 배포된 사이트를 실제로 열어서 스크린샷까지 찍어봄). `npm start`로 로컬 서버(`http://localhost:3113`)를 띄우고 Playwright 스크립트로 실제 클릭/네비게이션을 확인하는 것이 이번 단계부터의 기본 검증 방법이다. 프로젝트 자체의 `package.json`에는 Playwright를 추가하지 않는다(스크래치패드에서 임시로 설치해서 검증만 하고, 검증 스크립트도 프로젝트 밖에 둔다).
- 11단계의 모양 선택 로직(`selectedLatteArtShape`, `latteArtNote`, `applyLatteArtSelection`, `isLatteArtValid` 등)은 이 단계에서 값을 변경하지 않는다 — `init()`에서 초기값만 세팅하고, 그 이후 로직/렌더링은 손대지 않는다.
- 라떼아트 모양 카드/상세 페이지의 커피 카드는 기존 `frontend/menus/list.css`의 `.menu-card`/`.menu-card-image`/`.menu-card-body`/`.menu-card-name`/`.menu-card-desc`/`.menu-card-price`/`.menu-grid`/`.empty-state` 클래스를 그대로 재사용한다 — 새로 정의하지 않는다.
- 새 함수/페이지는 정확히 이 이름을 쓴다: 카테고리 탭 가상 항목 id `latte-art`, 새 페이지 `frontend/menus/latte-art-detail.html`(쿼리 파라미터 `shape`), `frontend/menus/detail.js`가 읽는 쿼리 파라미터 `shape`.
- **로컬 서버 URL 규칙 (중요, 검증 중 실제로 발견된 문제)**: `package.json`의 `start` 스크립트가 `serve frontend -l 3113`이라 로컬 서버는 `frontend/`를 루트로 서빙한다 — URL에 `/frontend/` 접두사를 붙이면 안 된다(예: `http://localhost:3113/menus/list.html`, `/frontend/` 없이). **또한 `serve` 패키지가 `.html` 확장자가 붙은 URL을 확장자 없는 URL로 301 리다이렉트하는데, 이 리다이렉트 과정에서 쿼리 스트링(`?id=...`, `?shape=...`)이 통째로 사라지는 버그성 동작이 있다** — 실제로 Task 1 검증 중 이것 때문에 `?id=latte`가 날아가서 "메뉴를 찾을 수 없습니다"가 뜨는 걸 직접 겪었다. 그러니 Playwright로 `page.goto()`할 때 쿼리 파라미터가 있는 URL은 **반드시 `.html` 확장자를 빼고** 접속할 것(예: `http://localhost:3113/menus/detail?id=latte&shape=heart` — `detail.html`이 아니라 `detail`). 쿼리 파라미터가 없는 URL(`list.html` 등)은 `.html`을 붙여도 리다이렉트만 되고 문제없지만, 일관성을 위해 이 단계의 모든 검증에서는 확장자 없는 URL을 쓸 것. **이건 로컬 개발 서버(`serve`)만의 특성이고 실제 배포(GitHub Pages)나 앱 코드 자체의 문제가 아니다** — 앱 코드를 이 리다이렉트에 맞춰 고치려 하지 말 것.

---

## Task 1: `frontend/js/data.js` — `LATTE_ART_SHAPES`에 아이콘 추가

**Files:**
- Modify: `frontend/js/data.js:1-7`

**Interfaces:**
- Consumes: 없음
- Produces: `LATTE_ART_SHAPES` 각 항목에 `icon`(이모지 문자열) 필드 추가. 기존 `id`/`label` 필드는 그대로 유지 — 11단계 코드(`renderLatteArtPicker` 등)가 이 배열을 이미 쓰고 있으므로 필드를 지우거나 이름을 바꾸면 안 된다.

- [ ] **Step 1: `LATTE_ART_SHAPES` 배열을 다음으로 교체**

```js
// ===== 라떼아트 프리셋 모양 =====
const LATTE_ART_SHAPES = [
  { id: "heart", label: "하트", icon: "❤️" },
  { id: "rosetta", label: "로제타", icon: "🌿" },
  { id: "tulip", label: "튤립", icon: "🌷" },
  { id: "bear", label: "곰돌이", icon: "🐻" },
];
```

- [ ] **Step 2: 검증**

`npm start` 실행 후 `http://localhost:3113/menus/list`에서 개발자 도구 콘솔:

```js
LATTE_ART_SHAPES.map((s) => s.icon)  // ["❤️", "🌿", "🌷", "🐻"]
```

기존 11단계 UI(라떼류 메뉴 상세 페이지의 모양 선택 버튼)가 여전히 정상 작동하는지도 확인 — `http://localhost:3113/menus/detail?id=latte`에서 "하트" 버튼을 눌러 선택되는지 확인 (아이콘 필드 추가가 기존 버튼 렌더링을 깨지 않는지 확인). **실제로 Playwright로 열어서 확인할 것 — Task 1은 이미 이렇게 검증되어 통과했다 (icons: ["❤️","🌿","🌷","🐻"], heart button selected after click: true, console errors: none).**

- [ ] **Step 3: 커밋**

```bash
git add frontend/js/data.js
git commit -m "feat: 라떼아트 프리셋 모양에 아이콘 필드 추가"
```

---

## Task 2: `frontend/menus/list.html`, `list.css`, `list.js` — "라떼아트" 카테고리 탭

**Files:**
- Modify: `frontend/menus/list.css`, `frontend/menus/list.js` (`list.html`은 수정 없음 — 탭은 JS가 동적으로 렌더링)

**Interfaces:**
- Consumes: `LATTE_ART_SHAPES` (Task 1)
- Produces: 없음 (터미널 UI). `latte-art-detail.html?shape=<id>`로의 링크를 생성(Task 3이 그 페이지를 만듦).

- [ ] **Step 1: `frontend/menus/list.css` 끝에 스타일 추가**

```css

/* ===== Latte Art Shape Icon ===== */
.latte-art-shape-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}
```

- [ ] **Step 2: `frontend/menus/list.js`의 `renderCategoryTabs` 수정**

`allTabs` 정의 줄만 교체:

```js
  const allTabs = [{ id: "all", name: "전체" }, ...CATEGORIES, { id: "latte-art", name: "라떼아트" }];
```

- [ ] **Step 3: `frontend/menus/list.js`의 `renderMenuGrid`를 다음으로 교체**

```js
// ===== 메뉴 그리드 =====
function renderMenuGrid() {
  const gridEl = document.getElementById("menuGrid");

  if (selectedCategoryId === "latte-art") {
    renderLatteArtShapeGrid(gridEl);
    return;
  }

  const menus = getMenusByCategory(selectedCategoryId);

  if (menus.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">해당 카테고리에 메뉴가 없습니다.</p>`;
    return;
  }

  gridEl.innerHTML = menus
    .map(
      (menu) => `
        <a
          class="menu-card glass${menu.soldOut ? " sold-out" : ""}"
          href="detail.html?id=${encodeURIComponent(menu.id)}"
        >
          ${menu.soldOut ? `<span class="sold-out-badge">품절</span>` : ""}
          <div class="menu-card-image">
            <img src="../${menu.image}" alt="${menu.name}" loading="lazy" />
          </div>
          <div class="menu-card-body">
            <span class="menu-card-name">${menu.name}</span>
            <p class="menu-card-desc">${menu.description}</p>
            <span class="menu-card-price">${formatPrice(menu.price)}</span>
          </div>
        </a>
      `
    )
    .join("");
}

// ===== 라떼아트 모양 그리드 =====
function renderLatteArtShapeGrid(gridEl) {
  gridEl.innerHTML = LATTE_ART_SHAPES.map(
    (shape) => `
      <a class="menu-card glass" href="latte-art-detail.html?shape=${encodeURIComponent(shape.id)}">
        <div class="menu-card-image latte-art-shape-icon">${shape.icon}</div>
        <div class="menu-card-body">
          <span class="menu-card-name">${shape.label}</span>
          <p class="menu-card-desc">카페라떼, 카푸치노, 바닐라라떼에서 선택할 수 있는 라떼아트예요.</p>
        </div>
      </a>
    `
  ).join("");
}
```

(기존 `renderMenuGrid` 본문 중 `selectedCategoryId === "latte-art"` 분기 이후 부분은 원래 코드와 100% 동일 — 로직을 바꾸는 게 아니라 앞에 분기 하나만 추가하는 것.)

- [ ] **Step 4: 검증 — 실제 브라우저(Playwright)**

`npm start`로 로컬 서버를 띄운 뒤, 아래 스크립트를 프로젝트 밖(스크래치패드)에 저장하고 실행한다. Playwright가 스크래치패드에 없다면 `npm install playwright --no-save` 후 `npx playwright install chromium`으로 설치할 것 (프로젝트의 `package.json`은 건드리지 않는다).

```js
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3113/menus/list", { waitUntil: "networkidle" });
  await page.click('button.category-tab:has-text("라떼아트")');
  await page.waitForSelector('a[href*="latte-art-detail.html?shape=heart"]');
  const cardCount = await page.locator(".menu-grid .menu-card").count();
  console.log("라떼아트 탭 카드 개수 (4개여야 함):", cardCount);
  await page.screenshot({ path: "screenshot-latte-art-tab.png" });

  console.log("콘솔 에러:", await page.evaluate(() => window.__errors || "none captured, check console listener"));

  await browser.close();
})();
```

(실제로는 `page.on("console", ...)`/`page.on("pageerror", ...)`로 에러를 수집해서 출력할 것 — 위 스니펫은 뼈대만 제공, 12~15단계 검증 스크립트에서 쓴 패턴을 참고해서 완성할 것.) 스크린샷을 열어서 카드 4개(하트/로제타/튤립/곰돌이)가 실제로 보이는지 눈으로 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add frontend/menus/list.css frontend/menus/list.js
git commit -m "feat: 메뉴 목록에 라떼아트 모양 탐색 탭 추가"
```

---

## Task 3: `frontend/menus/latte-art-detail.html`, `latte-art-detail.css`, `latte-art-detail.js` — 모양별 상세 페이지

**Files:**
- Create: `frontend/menus/latte-art-detail.html`, `frontend/menus/latte-art-detail.css`, `frontend/menus/latte-art-detail.js`

**Interfaces:**
- Consumes: `LATTE_ART_SHAPES`(Task 1), `getAllMenus()`/`getCartTotalCount()`(기존 `frontend/js/data.js`/`utils.js`), `.menu-card` 등 `list.css`의 클래스
- Produces: `detail.html?id=<menuId>&shape=<shapeId>`로의 링크 (Task 4가 그 쿼리 파라미터를 읽음)

- [ ] **Step 1: `frontend/menus/latte-art-detail.html` 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>라떼아트 모양 - Cafe Moment</title>
  <link rel="stylesheet" href="../css/variables.css" />
  <link rel="stylesheet" href="list.css" />
  <link rel="stylesheet" href="latte-art-detail.css" />
</head>
<body>
  <header class="page-header glass">
    <a href="list.html" class="icon-btn" aria-label="목록으로">‹</a>
    <h1>라떼아트 모양</h1>
    <a href="../basket/list.html" class="icon-btn cart-btn" aria-label="장바구니">
      🛒
      <span class="cart-badge" id="cartBadge" hidden>0</span>
    </a>
  </header>

  <main class="container" id="latteArtDetail"></main>

  <script src="../js/data.js"></script>
  <script src="../js/utils.js"></script>
  <script src="latte-art-detail.js"></script>
</body>
</html>
```

`list.css`를 추가로 링크하는 것은 의도된 것이다 — `.menu-card`/`.menu-grid`/`.page-header`/`.icon-btn`/`.cart-btn`/`.cart-badge` 스타일을 재사용하기 위함이다(Global Constraints 참고). Supabase 관련 스크립트는 이 페이지에서 전혀 필요 없다(순수 로컬 데이터).

- [ ] **Step 2: `frontend/menus/latte-art-detail.css` 생성**

`list.css`가 이미 헤더/카드/그리드를 다 제공하므로, 여기서는 모양 소개 히어로 영역만 추가한다:

```css
/* ===== Latte Art Shape Hero ===== */
.latte-art-shape-hero {
  margin-top: var(--space-lg);
  padding: var(--space-xl);
  text-align: center;
}

.latte-art-shape-icon-large {
  font-size: 4rem;
  margin-bottom: var(--space-sm);
}

.latte-art-shape-name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.latte-art-shape-hint {
  margin-top: var(--space-sm);
  color: var(--color-text-muted);
}

.not-found {
  padding: var(--space-2xl) 0;
  text-align: center;
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: `frontend/menus/latte-art-detail.js` 생성**

```js
// ===== 상태 =====
let currentShape = null;

// ===== 초기화 =====
function init() {
  const params = new URLSearchParams(window.location.search);
  const shapeId = params.get("shape");
  currentShape = LATTE_ART_SHAPES.find((shape) => shape.id === shapeId) || null;

  render();
  updateCartBadge();
}

// ===== 렌더링 =====
function render() {
  const el = document.getElementById("latteArtDetail");

  if (!currentShape) {
    el.innerHTML = `<p class="not-found">모양을 찾을 수 없습니다.</p>`;
    return;
  }

  const eligibleMenus = getAllMenus().filter((menu) => menu.latteArtAvailable);

  const menuCards = eligibleMenus
    .map(
      (menu) => `
        <a
          class="menu-card glass${menu.soldOut ? " sold-out" : ""}"
          href="detail.html?id=${encodeURIComponent(menu.id)}&shape=${encodeURIComponent(currentShape.id)}"
        >
          ${menu.soldOut ? `<span class="sold-out-badge">품절</span>` : ""}
          <div class="menu-card-image">
            <img src="../${menu.image}" alt="${menu.name}" loading="lazy" />
          </div>
          <div class="menu-card-body">
            <span class="menu-card-name">${menu.name}</span>
            <p class="menu-card-desc">${menu.description}</p>
            <span class="menu-card-price">${formatPrice(menu.price)}</span>
          </div>
        </a>
      `
    )
    .join("");

  el.innerHTML = `
    <div class="latte-art-shape-hero glass">
      <div class="latte-art-shape-icon-large">${currentShape.icon}</div>
      <h2 class="latte-art-shape-name">${currentShape.label}</h2>
      <p class="latte-art-shape-hint">이 모양은 아래 커피에서 선택할 수 있어요.</p>
    </div>
    <div class="menu-grid">
      ${menuCards}
    </div>
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

- [ ] **Step 4: 검증 — 실제 브라우저(Playwright)**

`http://localhost:3113/menus/latte-art-detail?shape=heart`로 직접 접속해서:
1. "❤️ 하트" 히어로 영역이 보이는지
2. 아래에 카페라떼/카푸치노/바닐라라떼 3개 카드가 보이는지 (다른 메뉴는 안 보여야 함 — `latteArtAvailable`이 없는 메뉴는 제외되는지)
3. 카페라떼 카드를 클릭하면 `detail.html?id=latte&shape=heart`로 이동하는지

`?shape=nonexistent`처럼 잘못된 값으로 접속했을 때 "모양을 찾을 수 없습니다"가 뜨는지도 확인. Task 2의 검증과 마찬가지로 Playwright 스크립트로 실제 클릭/네비게이션 후 스크린샷을 남기고, 콘솔 에러가 없는지 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add frontend/menus/latte-art-detail.html frontend/menus/latte-art-detail.css frontend/menus/latte-art-detail.js
git commit -m "feat: 라떼아트 모양별 상세 페이지 추가"
```

---

## Task 4: `frontend/menus/detail.js` — `shape` 쿼리 파라미터로 초기 선택

**Files:**
- Modify: `frontend/menus/detail.js:7-15` (`init` 함수)

**Interfaces:**
- Consumes: `LATTE_ART_SHAPES`(Task 1), URL 쿼리 파라미터 `shape`(Task 3이 생성하는 링크에서 옴)
- Produces: 없음 (기존 `selectedLatteArtShape` 모듈 변수의 초기값만 세팅)

- [ ] **Step 1: `init` 함수를 다음으로 교체**

```js
// ===== 초기화 =====
function init() {
  const params = new URLSearchParams(window.location.search);
  const menuId = params.get("id");
  currentMenu = menuId ? getMenuById(menuId) : null;

  const shapeParam = params.get("shape");
  if (currentMenu && currentMenu.latteArtAvailable && shapeParam) {
    const isKnownShape = LATTE_ART_SHAPES.some((shape) => shape.id === shapeParam) || shapeParam === "custom";
    if (isKnownShape) {
      selectedLatteArtShape = shapeParam;
    }
  }

  renderMenuDetail();
  updateCartBadge();
}
```

`shapeParam === "custom"`인 경우도 허용하지만, 그 경우 `latteArtNote`는 빈 문자열로 유지된다(이미 모듈 최상단에서 `let latteArtNote = "";`로 초기화됨) — 그러면 "기타" 버튼이 선택된 채로 열리고 텍스트 입력창이 비어 있어 "장바구니 담기" 버튼이 비활성화된 상태로 시작한다. 이는 기존 `isLatteArtValid()` 로직이 이미 처리하는 정상 동작이라 추가로 손댈 것 없음.

- [ ] **Step 2: 검증 — 실제 브라우저(Playwright)**

`http://localhost:3113/menus/detail?id=latte&shape=heart`로 접속해서 "하트" 버튼이 이미 선택된(활성화 스타일) 상태로 렌더링되는지 확인. `?id=latte&shape=rosetta`, `?id=latte`(파라미터 없음, 기존 동작 그대로 아무것도 선택 안 됨), `?id=americano&shape=heart`(라떼아트 미지원 메뉴 — 섹션 자체가 안 보여야 함, 11단계 기존 동작과 동일)도 확인.

- [ ] **Step 3: 커밋**

```bash
git add frontend/menus/detail.js
git commit -m "feat: 메뉴 상세에서 shape 쿼리 파라미터로 라떼아트 모양 미리 선택"
```

---

## Task 5: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (16단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 16단계 체크박스 4개를 `- [x]`로 변경**
- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 16단계 체크 표시"
```
