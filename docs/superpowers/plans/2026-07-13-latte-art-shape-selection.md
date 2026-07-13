# 11단계: 고객 - 라떼아트 모양 선택 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라떼류 메뉴 상세 페이지에서 고객이 라떼아트 모양(프리셋 또는 직접 입력)을 선택해 장바구니 담기에 반영하고, 장바구니 페이지에서 현재 요청을 확인/삭제할 수 있게 한다.

**Architecture:** 순수 프런트엔드(HTML/CSS/JS) + localStorage. 라떼아트 요청은 개별 장바구니 아이템이 아니라 **장바구니 전체에 딸린 단일 값**(`cafe-app:latteArtSelection`)으로 관리한다. Supabase 연동(12단계)은 이 계획의 범위 밖이며, 이 단계는 그 전제 작업만 완성한다.

**Tech Stack:** Vanilla JS, localStorage. 빌드 도구/프레임워크 없음.

## Global Constraints

- 이 프로젝트에는 자동화된 테스트가 없다(`package.json`의 `test` 스크립트는 placeholder로 항상 실패함). 각 태스크의 "테스트" 단계는 `npm start`로 띄운 로컬 서버(`http://localhost:3113`)에서 브라우저로 직접 조작해 검증하는 것으로 대체한다.
- 코로케이션 원칙 준수: HTML과 같은 디렉토리에 css/js를 평탄하게 둔다 (`BLUEPRINT.md` 참고).
- 기존 코드 스타일을 따른다: 각 렌더 함수는 `innerHTML` 전체 교체 후 이벤트 재바인딩, `window.confirm`으로 파괴적 액션 확인, CSS는 `frontend/css/variables.css`의 변수만 사용.
- `MENUS` 시드 데이터를 바꾸면 반드시 `MENU_SEED_VERSION`을 올려야 브라우저에 이미 저장된 캐시가 갱신된다 (`frontend/js/data.js` 참고).

---

## Task 1: 데이터 - 라떼아트 프리셋 모양 + 메뉴 플래그

**Files:**
- Modify: `frontend/js/data.js:1-8` (새 프리셋 섹션 삽입), `frontend/js/data.js:21-30` (카페라떼), `frontend/js/data.js:31-40` (카푸치노), `frontend/js/data.js:41-50` (바닐라라떼), `frontend/js/data.js:120` (`MENU_SEED_VERSION`)

**Interfaces:**
- Produces: `LATTE_ART_SHAPES` (`{ id: string, label: string }[]`, "기타"는 포함하지 않음 — UI에서 별도 처리), `MENUS[].latteArtAvailable` (`boolean`, 카페라떼/카푸치노/바닐라라떼만 `true`)

- [ ] **Step 1: `frontend/js/data.js` 최상단에 라떼아트 프리셋 섹션 추가**

`// ===== 카테고리 =====` 섹션 바로 앞(파일 맨 위)에 삽입:

```js
// ===== 라떼아트 프리셋 모양 =====
const LATTE_ART_SHAPES = [
  { id: "heart", label: "하트" },
  { id: "rosetta", label: "로제타" },
  { id: "tulip", label: "튤립" },
  { id: "bear", label: "곰돌이" },
];

```

- [ ] **Step 2: 라떼류 메뉴 3개에 `latteArtAvailable: true` 추가**

`latte`, `cappuccino`, `vanilla-latte` 항목의 `rating` 줄 다음에 `latteArtAvailable: true,`를 추가한다. 예를 들어 `latte` 항목은:

```js
  {
    id: "latte",
    categoryId: "coffee",
    name: "카페라떼",
    price: 5000,
    description: "부드러운 우유와 에스프레소의 조화",
    image: "images/menus/latte.png",
    soldOut: false,
    rating: 4.9,
    latteArtAvailable: true,
  },
```

`cappuccino`, `vanilla-latte`도 동일하게 `rating` 다음 줄에 `latteArtAvailable: true,`를 추가한다. `americano`, `earl-grey` 등 나머지 메뉴는 건드리지 않는다(플래그 없음 = `undefined` = falsy).

- [ ] **Step 3: `MENU_SEED_VERSION`을 `"3"`으로 올린다**

```js
const MENU_SEED_VERSION = "3";
```

이렇게 해야 이미 브라우저에 저장된 이전 메뉴 캐시(2번 버전)가 `latteArtAvailable` 필드 없이 남아있지 않고 새로 시드된다.

- [ ] **Step 4: 브라우저에서 확인**

`npm start` 실행 후 `http://localhost:3113/frontend/menus/list.html` 접속. 브라우저 개발자 도구 콘솔에서 다음을 실행:

```js
getMenuById("latte").latteArtAvailable   // true
getMenuById("americano").latteArtAvailable // undefined
LATTE_ART_SHAPES.length                  // 4
```

세 값이 위와 같이 나오면 통과. (만약 이전 캐시 때문에 `latte`가 `undefined`로 나오면 `localStorage.clear()` 후 새로고침 — `MENU_SEED_VERSION` 변경이 누락된 것이므로 Step 3을 다시 확인)

- [ ] **Step 5: 커밋**

```bash
git add frontend/js/data.js
git commit -m "feat: 라떼아트 프리셋 모양과 대상 메뉴 플래그 추가"
```

---

## Task 2: 유틸 - 장바구니 단위 라떼아트 선택 저장/조회/삭제

**Files:**
- Modify: `frontend/js/utils.js` (파일 끝, 89번 줄 `getCartTotalPrice` 함수 뒤에 추가)

**Interfaces:**
- Consumes: 없음 (localStorage만 사용하는 독립 유틸)
- Produces: `getLatteArtSelection()` → `{ menuId: string, menuName: string, shape: string, note: string } | null`, `setLatteArtSelection(selection)` → 저장된 `selection` 반환, `clearLatteArtSelection()` → 반환값 없음, 상수 `LATTE_ART_STORAGE_KEY`

- [ ] **Step 1: `frontend/js/utils.js` 끝에 라떼아트 선택 유틸 추가**

파일 마지막(`getCartTotalPrice` 함수 뒤)에 추가:

```js

// ===== 라떼아트 요청 유틸리티 (장바구니 단위, localStorage 기반) =====
const LATTE_ART_STORAGE_KEY = "cafe-app:latteArtSelection";

function getLatteArtSelection() {
  const raw = localStorage.getItem(LATTE_ART_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLatteArtSelection(selection) {
  localStorage.setItem(LATTE_ART_STORAGE_KEY, JSON.stringify(selection));
  return selection;
}

function clearLatteArtSelection() {
  localStorage.removeItem(LATTE_ART_STORAGE_KEY);
}
```

- [ ] **Step 2: 브라우저 콘솔에서 확인**

`http://localhost:3113/frontend/menus/list.html`에서 개발자 도구 콘솔:

```js
getLatteArtSelection()  // null
setLatteArtSelection({ menuId: "latte", menuName: "카페라떼", shape: "heart", note: "" })
getLatteArtSelection()  // { menuId: "latte", menuName: "카페라떼", shape: "heart", note: "" }
clearLatteArtSelection()
getLatteArtSelection()  // null
```

네 결과가 순서대로 위와 같이 나오면 통과.

- [ ] **Step 3: 커밋**

```bash
git add frontend/js/utils.js
git commit -m "feat: 장바구니 단위 라떼아트 요청 저장/조회/삭제 유틸 추가"
```

---

## Task 3: 메뉴 상세 - 라떼아트 모양 선택 UI

**Files:**
- Modify: `frontend/menus/detail.css` (파일 끝에 추가), `frontend/menus/detail.js` (전역)

**Interfaces:**
- Consumes: `LATTE_ART_SHAPES`, `MENUS[].latteArtAvailable` (Task 1), `getLatteArtSelection()` / `setLatteArtSelection()` (Task 2)
- Produces: `setLatteArtSelection`에 저장되는 selection 객체 `{ menuId, menuName, shape, note }` (Task 4가 이 모양을 그대로 읽음)

- [ ] **Step 1: `frontend/menus/detail.css` 끝에 라떼아트 피커 스타일 추가**

```css

/* ===== Latte Art Picker ===== */
.latte-art-picker {
  margin-top: var(--space-xl);
}

.latte-art-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.latte-art-shapes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.latte-art-shape-btn {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.latte-art-shape-btn:hover {
  background: var(--color-surface-alt);
}

.latte-art-shape-btn.selected {
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.latte-art-note {
  display: block;
  width: 100%;
  min-height: 72px;
  margin-top: var(--space-md);
  padding: var(--space-md);
  font-family: inherit;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
}
```

- [ ] **Step 2: `frontend/menus/detail.js` 상태 변수 추가**

파일 맨 위(`let currentMenu = null;` / `let quantity = 1;` 다음)에 추가:

```js
let selectedLatteArtShape = null; // 프리셋 id, "custom", 또는 null
let latteArtNote = "";
```

- [ ] **Step 3: `renderMenuDetail`에 라떼아트 피커 삽입**

기존 `renderMenuDetail` 함수의 템플릿에서, `${soldOut ? "" : renderQuantityStepper()}` 다음 줄에 라떼아트 피커 호출을 추가:

```js
  detailEl.innerHTML = `
    <div class="menu-detail-image">
      <img src="../${currentMenu.image}" alt="${currentMenu.name}" loading="lazy" />
    </div>
    <div class="menu-detail-body">
      ${category ? `<span class="menu-detail-category">${category.name}</span>` : ""}
      <h2 class="menu-detail-name">${currentMenu.name}</h2>
      <p class="menu-detail-price">${formatPrice(currentMenu.price)}</p>
      <p class="menu-detail-desc">${currentMenu.description}</p>
      ${soldOut ? "" : renderQuantityStepper()}
      ${!soldOut && currentMenu.latteArtAvailable ? renderLatteArtPicker() : ""}
    </div>
    ${soldOut ? "" : renderActionBar()}
  `;

  if (!soldOut) {
    bindQuantityEvents();
    bindAddToCartEvent();
    if (currentMenu.latteArtAvailable) {
      bindLatteArtEvents();
    }
  }
```

- [ ] **Step 4: `renderLatteArtPicker` 함수 추가**

`renderQuantityStepper` 함수 뒤에 추가:

```js
function renderLatteArtPicker() {
  const presetButtons = LATTE_ART_SHAPES.map(
    (shape) => `
      <button
        type="button"
        class="latte-art-shape-btn ${selectedLatteArtShape === shape.id ? "selected" : ""}"
        data-shape="${shape.id}"
      >
        ${shape.label}
      </button>
    `
  ).join("");

  return `
    <div class="latte-art-picker">
      <h3 class="latte-art-title">라떼아트 요청 (선택)</h3>
      <div class="latte-art-shapes">
        ${presetButtons}
        <button
          type="button"
          class="latte-art-shape-btn ${selectedLatteArtShape === "custom" ? "selected" : ""}"
          data-shape="custom"
        >
          기타
        </button>
      </div>
      ${
        selectedLatteArtShape === "custom"
          ? `<textarea id="latteArtNote" class="latte-art-note" maxlength="100" placeholder="원하는 모양을 설명해주세요">${latteArtNote}</textarea>`
          : ""
      }
    </div>
  `;
}
```

- [ ] **Step 5: `bindLatteArtEvents`, `isLatteArtValid` 함수 추가**

`bindQuantityEvents`/`updateQuantityDisplay` 근처(장바구니 담기 섹션 앞)에 추가:

```js
// ===== 라떼아트 선택 =====
function bindLatteArtEvents() {
  document.querySelectorAll(".latte-art-shape-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedLatteArtShape = btn.dataset.shape;
      if (selectedLatteArtShape !== "custom") {
        latteArtNote = "";
      }
      renderMenuDetail();
    });
  });

  const noteInput = document.getElementById("latteArtNote");
  if (noteInput) {
    noteInput.addEventListener("input", () => {
      latteArtNote = noteInput.value;
      const addToCartBtn = document.getElementById("addToCartBtn");
      if (addToCartBtn) {
        addToCartBtn.disabled = !isLatteArtValid();
      }
    });
  }
}

function isLatteArtValid() {
  if (selectedLatteArtShape === "custom") {
    return latteArtNote.trim().length > 0;
  }
  return true;
}
```

`noteInput`의 `input` 이벤트에서는 `renderMenuDetail()`을 호출하지 않는다 — 전체 재렌더링을 하면 `<textarea>`가 매 타이핑마다 새로 그려져서 포커스/커서 위치를 잃기 때문이다. 버튼 클릭(`.latte-art-shape-btn`)은 텍스트 입력 중이 아니므로 전체 재렌더링해도 문제없다.

- [ ] **Step 6: `renderActionBar`에 유효성 검사 반영**

기존 `renderActionBar`를 다음으로 교체:

```js
function renderActionBar() {
  const disabled = currentMenu.latteArtAvailable && !isLatteArtValid();
  return `
    <div class="action-bar glass">
      <span class="action-bar-total" id="actionBarTotal">${formatPrice(currentMenu.price * quantity)}</span>
      <button class="add-to-cart-btn" id="addToCartBtn" ${disabled ? "disabled" : ""}>장바구니 담기</button>
    </div>
  `;
}
```

- [ ] **Step 7: `bindAddToCartEvent`에서 라떼아트 요청 저장 연동**

기존 `bindAddToCartEvent` 함수 내부, `addToCart(currentMenu.id, quantity);` 줄 바로 앞에 추가:

```js
function bindAddToCartEvent() {
  const addToCartBtn = document.getElementById("addToCartBtn");

  addToCartBtn.addEventListener("click", () => {
    if (currentMenu.latteArtAvailable && selectedLatteArtShape) {
      applyLatteArtSelection();
    }

    addToCart(currentMenu.id, quantity);
    updateCartBadge();

    const originalText = addToCartBtn.textContent;
    addToCartBtn.textContent = "담았습니다!";
    addToCartBtn.disabled = true;

    setTimeout(() => {
      addToCartBtn.textContent = originalText;
      addToCartBtn.disabled = !isLatteArtValid();
    }, 1200);
  });
}
```

(`setTimeout` 콜백의 `addToCartBtn.disabled = false;`를 `addToCartBtn.disabled = !isLatteArtValid();`로 바꿨다 — 토스트가 사라진 뒤에도 "기타" 선택 + 빈 설명 상태면 다시 비활성화되어야 한다.)

- [ ] **Step 8: `applyLatteArtSelection` 함수 추가**

`bindAddToCartEvent` 함수 뒤에 추가:

```js
function applyLatteArtSelection() {
  const nextSelection = {
    menuId: currentMenu.id,
    menuName: currentMenu.name,
    shape: selectedLatteArtShape,
    note: selectedLatteArtShape === "custom" ? latteArtNote.trim() : "",
  };

  const existing = getLatteArtSelection();
  const isSameRequest =
    existing &&
    existing.menuId === nextSelection.menuId &&
    existing.shape === nextSelection.shape &&
    existing.note === nextSelection.note;

  if (existing && !isSameRequest) {
    const confirmed = window.confirm(
      `이미 "${existing.menuName}"에 라떼아트 요청이 있어요. "${nextSelection.menuName}" 요청으로 교체할까요?`
    );
    if (!confirmed) {
      return;
    }
  }

  setLatteArtSelection(nextSelection);
}
```

- [ ] **Step 9: 브라우저에서 확인**

`http://localhost:3113/frontend/menus/detail.html?id=latte` 접속:
1. "라떼아트 요청 (선택)" 제목과 하트/로제타/튤립/곰돌이/기타 버튼 5개가 보인다.
2. "하트" 클릭 → 버튼이 선택 상태(배경색 채워짐)로 바뀐다.
3. "장바구니 담기" 클릭 → "담았습니다!" 토스트가 뜬다.
4. 개발자 도구 콘솔에서 `getLatteArtSelection()` 실행 → `{ menuId: "latte", menuName: "카페라떼", shape: "heart", note: "" }`가 나온다.
5. "기타" 버튼 클릭 → 텍스트 입력창이 나타나고, 비어 있는 동안 "장바구니 담기" 버튼이 비활성화(회색, 클릭 불가)된다.
6. 텍스트 입력창에 "토끼 모양으로요"라고 입력 → 버튼이 다시 활성화된다. 타이핑 중 입력창 포커스가 유지되는지 확인(재렌더링으로 포커스가 끊기면 실패).
7. "장바구니 담기" 클릭 → 이미 "하트" 요청이 있었으므로 confirm 창이 뜬다. 확인을 누르면 `getLatteArtSelection()`이 `shape: "custom", note: "토끼 모양으로요"`로 바뀐다.
8. `http://localhost:3113/frontend/menus/detail.html?id=americano` 접속 → 라떼아트 섹션이 아예 보이지 않는다(아메리카노는 `latteArtAvailable` 없음).

전부 확인되면 통과.

- [ ] **Step 10: 커밋**

```bash
git add frontend/menus/detail.css frontend/menus/detail.js
git commit -m "feat: 메뉴 상세에 라떼아트 모양 선택 UI 추가"
```

---

## Task 4: 장바구니 - 라떼아트 요청 표시/삭제 + 체크아웃 시 초기화

**Files:**
- Modify: `frontend/basket/list.html:27-29`, `frontend/basket/list.css` (파일 끝에 추가), `frontend/basket/list.js`

**Interfaces:**
- Consumes: `getLatteArtSelection()` / `clearLatteArtSelection()` (Task 2), selection 객체 `{ menuId, menuName, shape, note }` (Task 3), `LATTE_ART_SHAPES` (Task 1), `getCart()` (기존 `utils.js`)
- Produces: 없음 (터미널 UI)

- [ ] **Step 1: `frontend/basket/list.html`에 라떼아트 요청 섹션 추가**

`<section class="basket-summary glass" id="basketSummary">...</section>` 블록과 `<section id="basketContent"></section>` 사이에 삽입:

```html
    <section class="latte-art-request glass" id="latteArtRequest" hidden></section>

```

- [ ] **Step 2: `frontend/basket/list.css` 끝에 스타일 추가**

```css

/* ===== Latte Art Request ===== */
.latte-art-request {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
  border-radius: var(--radius-lg);
}

.latte-art-request-label {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.latte-art-request-detail {
  font-weight: 700;
}

.latte-art-request-remove {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--color-border);
  color: var(--color-danger);
}
```

- [ ] **Step 3: `frontend/basket/list.js`에 라떼아트 요청 렌더링 추가**

`renderBasketPage` 함수 맨 앞줄에 호출 추가 (함수 첫 줄, `const contentEl = ...` 이전):

```js
function renderBasketPage() {
  reconcileLatteArtSelection();
  renderLatteArtRequest();

  const contentEl = document.getElementById("basketContent");
  const cartItems = buildCartViewModels();
  // ... (이하 기존 코드 그대로)
```

- [ ] **Step 4: `reconcileLatteArtSelection`, `renderLatteArtRequest` 함수 추가**

`buildCartViewModels` 함수 앞에 추가:

```js
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
      <p class="latte-art-request-detail">${selection.menuName} · ${detailText}</p>
    </div>
    <button class="latte-art-request-remove" id="removeLatteArtBtn" type="button" aria-label="라떼아트 요청 삭제">✕</button>
  `;

  document.getElementById("removeLatteArtBtn").addEventListener("click", () => {
    clearLatteArtSelection();
    renderBasketPage();
  });
}
```

- [ ] **Step 5: 체크아웃 시 라떼아트 선택 초기화**

`bindBasketEvents` 함수 안의 `checkoutBtn` 클릭 핸들러를 다음으로 교체:

```js
    checkoutBtn.addEventListener("click", () => {
      const validItems = buildCartViewModels().filter((item) => item.menu);
      if (validItems.length === 0) {
        return;
      }

      const confirmed = window.confirm("장바구니에 담긴 메뉴로 주문할까요?");
      if (!confirmed) {
        return;
      }

      const newOrder = createOrder(validItems);
      clearCart();
      clearLatteArtSelection();
      window.location.href = `../orders/detail.html?id=${encodeURIComponent(newOrder.id)}`;
    });
```

(이 단계에서는 라떼아트 요청을 Supabase에 저장하지 않는다 — 그건 12단계 범위다. 여기서는 로컬 선택만 정리해서 다음 주문에 이전 요청이 새어나가지 않게 한다.)

- [ ] **Step 6: 브라우저에서 확인**

1. `http://localhost:3113/frontend/menus/detail.html?id=latte`에서 "하트" 선택 후 장바구니 담기.
2. `http://localhost:3113/frontend/basket/list.html` 접속 → 상단에 "라떼아트 요청 / 카페라떼 · 하트" 카드가 보인다.
3. ✕ 버튼 클릭 → 카드가 사라진다. `getLatteArtSelection()`이 `null`.
4. 다시 라떼 상세로 가서 "로제타" 선택 후 담기 → 장바구니에서 카드가 "카페라떼 · 로제타"로 보인다.
5. 장바구니에서 카페라떼 항목을 삭제(휴지통/삭제 버튼) → 페이지가 다시 그려지면서 라떼아트 요청 카드도 자동으로 사라진다(정합성 유지 확인).
6. 다시 라떼 상세에서 "튤립" 선택 후 담기 → 장바구니에서 "주문하기" 클릭 → 주문 상세로 이동 후, 장바구니로 돌아가면 라떼아트 요청 카드가 없다(체크아웃 시 초기화 확인).

전부 확인되면 통과.

- [ ] **Step 7: 커밋**

```bash
git add frontend/basket/list.html frontend/basket/list.css frontend/basket/list.js
git commit -m "feat: 장바구니에 라떼아트 요청 카드 표시 및 정합성 유지 추가"
```

---

## Task 5: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (11단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 11단계 체크박스 4개를 `- [x]`로 변경**

- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 11단계 체크 표시"
```
