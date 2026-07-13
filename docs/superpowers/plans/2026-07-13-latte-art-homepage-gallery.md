# 15단계: 홈페이지 - 라떼아트 갤러리 & 헤더 메뉴 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인/주문 여부와 무관하게 누구나 홈페이지에서 실제 업로드된 라떼아트 영상을 볼 수 있게 한다. 헤더에 "라떼아트" 메뉴를 추가해 새 섹션으로 스크롤 이동하고, Supabase에서 영상이 업로드된 요청 중 최근 4개를 인스타그램 갤러리 스타일(자동재생/무음/반복)로 보여준다.

**Architecture:** `frontend/js/latte-art.js`에 읽기 전용 함수 `getRecentLatteArtVideos(limit)`를 추가하고, 홈페이지(`frontend/index.html`/`index.js`/`index.css`)에 새 섹션을 추가해 그 함수를 호출한다. 12~14단계에서 확립한 패턴을 그대로 따른다: Supabase 스크립트 로딩 순서, `escapeHtml` 사용, 에러 격리(조회 실패해도 홈페이지 나머지는 항상 정상 표시). **홈페이지는 인증이 전혀 없는 완전 공개 페이지이므로, 이 갤러리는 업로드된 모든 라떼아트 영상을 고객 동의 절차 없이 노출한다** — 이미 BLUEPRINT.md 15단계에 트레이드오프로 명시하고 사용자 승인을 받은 사항이다.

**Tech Stack:** Vanilla JS, `@supabase/supabase-js@2` (CDN, 12~14단계에서 검증된 로딩 방식 재사용), Supabase Postgres(`latte_art_orders`, 스키마 변경 없음 — 읽기 전용 쿼리만 추가).

## Global Constraints

- 이 프로젝트에는 자동화된 테스트가 없고, 이 환경에는 브라우저 자동화 도구도 DOM 라이브러리도 없다. 검증은 (a) 실제 Supabase 호출 부분은 Node `vm` + 실제 `@supabase/supabase-js` 패키지로 라이브 프로젝트에 대고 확인, (b) DOM 렌더링은 코드 트레이스 — 12~14단계와 동일한 방식.
- No build tool, no bundler. `<script>` 태그 순서: CDN UMD → `supabase-client.js` → `latte-art.js` → 기존 파일들(`data.js`, `utils.js`, `index.js`) — 12~14단계에서 확립한 순서 그대로.
- **에러 격리 필수**: 갤러리 조회가 실패해도 홈페이지의 나머지(Hero, Quick Menu, Popular Menu 등)는 항상 정상 렌더링되어야 한다. 13단계에서 이걸 빠뜨렸다가 최종 리뷰에서 잡힌 적이 있다 — 이번엔 처음부터 반영한다.
- **`init()`을 async로 바꾸지 않는다**: 기존 `index.js`의 `init()`은 동기 함수로 스크롤/리플 등 인터랙션 바인딩을 즉시 실행한다. 갤러리 fetch가 네트워크 왕복을 기다리는 동안 나머지 초기화(특히 `bindHeaderScrollEffect`/`bindRevealAnimation`/`bindButtonRipple`)가 지연되면 안 되므로, 갤러리 렌더링 함수는 `init()` 안에서 `await` 없이 "fire-and-forget"으로 호출한다(함수 자체는 `async`이고 내부에서 자체적으로 에러를 처리하므로 안전하다).
- 새 함수/섹션은 정확히 이 이름을 쓴다: `getRecentLatteArtVideos(limit)` (기본값 `4`), HTML id `latteArtGallery`(섹션)/`latteArtGalleryGrid`(그리드), CSS 클래스 `.latte-art-gallery-grid`/`.latte-art-gallery-card`.
- 영상 요소는 `autoplay muted loop playsinline` 속성을 모두 넣는다 — `muted` 없이는 대부분의 브라우저가 자동재생을 차단한다.
- 갤러리에 표시할 영상이 0개면 `.empty-state` 클래스(이미 프로젝트 전역에서 쓰이는 관례)로 안내 문구를 보여준다.

---

## Task 1: `frontend/js/latte-art.js` — `getRecentLatteArtVideos(limit)` 추가

**Files:**
- Modify: `frontend/js/latte-art.js` (파일 끝에 함수 추가)

**Interfaces:**
- Consumes: `getSupabaseClient()`, `LATTE_ART_TABLE` (기존, 같은 파일 안에 이미 정의됨)
- Produces: `getRecentLatteArtVideos(limit = 4)` — `async`, 성공 시 `latte_art_orders` 행 배열(최신 업로드 순), 실패 시 **빈 배열 `[]`** 반환(다른 두 함수와 달리 `null`이 아님 — 호출부가 바로 `.map()`/`.length`를 쓸 수 있게 하기 위한 의도적 차이. 아래 Step 1 코드 그대로 따를 것).

- [ ] **Step 1: `frontend/js/latte-art.js` 끝에 함수 추가**

```js

async function getRecentLatteArtVideos(limit = 4) {
  const { data, error } = await getSupabaseClient()
    .from(LATTE_ART_TABLE)
    .select("*")
    .not("video_url", "is", null)
    .order("video_uploaded_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentLatteArtVideos failed:", error);
    return [];
  }
  return data;
}
```

- [ ] **Step 2: 검증 — 실제 Supabase 호출**

12~14단계와 동일한 방식(Node `vm` + 실제 `@supabase/supabase-js` 패키지, `npm install @supabase/supabase-js --no-save`로 임시 설치, `package.json`은 건드리지 않음)으로 확인한다:

1. `mcp__supabase__execute_sql`로 영상이 있는 테스트 행을 2개 만든다(업로드 시각을 다르게 해서 정렬 확인 가능하게):
   ```sql
   insert into public.latte_art_orders (order_id, item_name, shape, note, video_url, video_uploaded_at)
   values
     ('TEST-VERIFY-5', '카페라떼', 'heart', null, 'https://example.com/a.mp4', now() - interval '1 hour'),
     ('TEST-VERIFY-6', '카푸치노', 'rosetta', null, 'https://example.com/b.mp4', now())
   returning *;
   ```
2. 영상 없는 행도 하나 만든다(제외되는지 확인용): `insert into public.latte_art_orders (order_id, item_name, shape, note) values ('TEST-VERIFY-7', '바닐라라떼', 'tulip', null) returning *;`
3. 실제 `getRecentLatteArtVideos(4)`를 호출해: (a) `TEST-VERIFY-7`(영상 없음)은 결과에 없는지, (b) `TEST-VERIFY-6`(더 최근 업로드)이 `TEST-VERIFY-5`보다 먼저 오는지 확인.
4. 정리: `execute_sql`로 `TEST-VERIFY-5`/`6`/`7` 세 행 모두 삭제, 삭제 확인.

**주의:** 이 태스크는 읽기 전용 조회 함수만 다루며 Storage를 전혀 건드리지 않는다. 검증 중 `mcp__supabase__apply_migration`이 필요할 것 같은 상황이 조금이라도 생기면 **직접 처리하지 말고 즉시 BLOCKED로 보고할 것.**

- [ ] **Step 3: 커밋**

```bash
git add frontend/js/latte-art.js
git commit -m "feat: 최근 업로드된 라떼아트 영상 조회 함수 추가"
```

---

## Task 2: `frontend/index.html` + `frontend/index.css` — 헤더 메뉴, 스크립트, 섹션 마크업/스타일

**Files:**
- Modify: `frontend/index.html`, `frontend/index.css`

**Interfaces:**
- Consumes: 없음
- Produces: `getSupabaseClient`/`getRecentLatteArtVideos` 전역 함수가 `index.js` 실행 전에 사용 가능해짐. DOM에 `#latteArtGallery`(섹션)/`#latteArtGalleryGrid`(그리드 컨테이너) id와 `.latte-art-gallery-grid`/`.latte-art-gallery-card` CSS 클래스 제공(Task 3이 이 id/클래스로 렌더링).

- [ ] **Step 1: 헤더 nav에 "라떼아트" 메뉴 추가**

`frontend/index.html`의 `<nav class="site-nav">` 블록을 찾아 `Event` 링크 뒤에 추가:

```html
      <nav class="site-nav">
        <a href="#popularMenu">Menu</a>
        <a href="menus/list.html">Store</a>
        <a href="#recommend">Event</a>
        <a href="#latteArtGallery">라떼아트</a>
      </nav>
```

- [ ] **Step 2: 스크립트 태그 3개 추가**

기존 `<script src="js/data.js"></script>` 줄 바로 앞에 추가:

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="js/supabase-client.js"></script>
  <script src="js/latte-art.js"></script>
```

전체 스크립트 섹션은 이렇게 된다:

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="js/supabase-client.js"></script>
  <script src="js/latte-art.js"></script>
  <script src="js/data.js"></script>
  <script src="js/utils.js"></script>
  <script src="index.js"></script>
```

(홈페이지는 `frontend/` 바로 아래에 있으므로 다른 하위 페이지들과 달리 `../js/...`가 아니라 `js/...` 상대경로를 쓴다 — 기존 `data.js`/`utils.js` 태그와 동일한 깊이.)

- [ ] **Step 3: `<!-- ===== Today's Recommendation ===== -->` 섹션과 `<!-- ===== Review ===== -->` 섹션 사이에 새 섹션 삽입**

```html
    <!-- ===== Latte Art Gallery ===== -->
    <section class="section latte-art-gallery container-wide" id="latteArtGallery">
      <div class="section-head reveal">
        <p class="section-eyebrow">Latte Art</p>
        <h2 class="section-title">고객님을 위한 라떼아트</h2>
        <p class="section-desc">바리스타가 실제로 완성한 라떼아트 영상을 확인해보세요.</p>
      </div>
      <div class="latte-art-gallery-grid" id="latteArtGalleryGrid"></div>
    </section>
```

- [ ] **Step 4: `frontend/index.css` 끝에 스타일 추가**

이미 `.section`/`.section-head`/`.section-eyebrow`/`.section-title`/`.section-desc`/`.empty-state`는 파일 상단에 공통 스타일로 정의되어 있으므로(다른 섹션들과 공유) 여기서는 그리드/카드만 추가한다. 기존 `.gallery-grid`(Instagram Gallery)의 2열→4열 반응형 패턴을 그대로 따른다:

```css

/* ===== Latte Art Gallery ===== */
.latte-art-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.latte-art-gallery-card {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: #000;
}

.latte-art-gallery-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 640px) {
  .latte-art-gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 5: 검증 (코드 리뷰 방식 — 브라우저 없음)**

`frontend/index.html`의 최종 `<script>` 순서가 Step 2의 6줄과 정확히 일치하는지 확인. `frontend/index.css`에 추가한 `var(--...)` 참조(`--space-sm`, `--radius-md`)가 `frontend/css/variables.css`에 정의되어 있는지 확인. 헤더 nav 링크가 `#latteArtGallery`(Step 3에서 넣은 섹션의 `id`)와 정확히 일치하는지 확인.

- [ ] **Step 6: 커밋**

```bash
git add frontend/index.html frontend/index.css
git commit -m "feat: 홈페이지에 라떼아트 갤러리 섹션과 헤더 메뉴 추가"
```

---

## Task 3: `frontend/index.js` — 갤러리 조회/렌더링 (에러 격리 포함)

**Files:**
- Modify: `frontend/index.js`

**Interfaces:**
- Consumes: `getRecentLatteArtVideos(limit)` (Task 1), `escapeHtml` (`frontend/js/utils.js`, 기존)
- Produces: 없음 (터미널 UI)

- [ ] **Step 1: `renderGallery` 함수 뒤에 새 함수 추가**

```js

// ===== 라떼아트 갤러리 =====
async function renderLatteArtGallery() {
  const gridEl = document.getElementById("latteArtGalleryGrid");

  let videos = [];
  try {
    videos = await getRecentLatteArtVideos(4);
  } catch (err) {
    console.error("getRecentLatteArtVideos threw:", err);
  }

  if (videos.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">곧 라떼아트 갤러리가 채워질 예정이에요.</p>`;
    return;
  }

  gridEl.innerHTML = videos
    .map(
      (video) => `
        <div class="latte-art-gallery-card">
          <video src="${escapeHtml(video.video_url)}" autoplay muted loop playsinline></video>
        </div>
      `
    )
    .join("");
}
```

중요한 부분 설명 (구현 시 그대로 옮길 것, 바꾸지 말 것):
- `try/catch`가 있는 이유: `getRecentLatteArtVideos`는 내부적으로 이미 `null`이 아니라 `[]`를 반환하도록 설계되어 있지만(Task 1 참고), `getSupabaseClient()` 자체가 throw하는 경우(예: CDN 로딩 실패)까지는 그 함수도 못 막는다 — 13단계 최종 리뷰에서 나온 것과 같은 종류의 위험이라 처음부터 방어한다. `catch`는 아무것도 하지 않고 넘어가며, 그 결과 `videos`는 초기값인 `[]`로 남아 자연스럽게 "곧 채워질 예정" 안내로 이어진다.
- `escapeHtml(video.video_url)`을 빼먹지 말 것 — 11/13/14단계에서 이미 확립된 패턴(고객 입력이 결합된 값을 `innerHTML`에 넣을 때는 항상 이스케이프).

- [ ] **Step 2: `init()`에서 fire-and-forget으로 호출**

기존 `init()` 함수를 다음으로 교체(다른 줄은 그대로, `renderLatteArtGallery();` 한 줄만 추가):

```js
function init() {
  renderFeaturedMenus();
  renderRecommendation();
  renderGallery();
  renderLatteArtGallery();
  updateCartBadge();
  bindHeaderScrollEffect();
  bindRevealAnimation();
  bindButtonRipple();
}
```

`init()` 자체는 여전히 동기 함수다 — `renderLatteArtGallery()` 앞에 `await`를 붙이지 않는다(Global Constraints 참고: 네트워크 왕복 때문에 나머지 초기화가 지연되면 안 됨). `renderLatteArtGallery`는 자체적으로 `async`이고 자기 안에서 에러를 다 처리하므로 fire-and-forget이 안전하다.

- [ ] **Step 3: 검증 — 실제 Supabase 호출 부분**

Task 1에서 이미 `getRecentLatteArtVideos` 자체는 실제 프로젝트에 대고 검증했으므로, 여기서는 "홈페이지가 실제로 그 함수를 쓰는 방식"이 회귀 없이 동작하는지만 가볍게 재확인한다: Node `vm`으로 실제 `frontend/js/latte-art.js`를 로드하고, 영상 있는 테스트 행 1개를 만들어 `getRecentLatteArtVideos(4)`가 그 행을 포함해서 돌려주는지 확인한 뒤 즉시 정리(행 삭제, 삭제 확인). Task 1과 마찬가지로, 검증 중 Storage/마이그레이션이 필요해 보이면 직접 처리하지 말고 BLOCKED로 보고할 것.

- [ ] **Step 4: 검증 — DOM 렌더링/에러 격리 (코드 트레이스)**

브라우저도 jsdom도 없으므로, 아래 시나리오를 실제 작성한 코드를 보며 손으로 따라가고 보고서에 근거(줄 인용)를 남긴다:

1. `getRecentLatteArtVideos`가 정상적으로 빈 배열을 반환(영상 없음) → `videos.length === 0` → "곧 라떼아트 갤러리가 채워질 예정이에요" 안내 표시.
2. `getRecentLatteArtVideos`가 1~4개 반환 → 그 개수만큼 `.latte-art-gallery-card`가 그리드에 렌더링, 각 `<video>`에 `autoplay muted loop playsinline` 속성이 모두 있는지 확인.
3. `getRecentLatteArtVideos` 호출 자체가 throw(예: `getSupabaseClient()`가 CDN 미로딩으로 throw) → `catch`가 잡아서 `videos`가 `[]`로 유지 → 시나리오 1과 동일하게 안내 문구로 귀결(에러 문구가 따로 없다는 게 의도된 설계 — Task 1의 "성공 없으면 빈 배열" 계약과 자연스럽게 합쳐짐).
4. `renderLatteArtGallery()`가 실패하거나 오래 걸려도 `init()`의 나머지 호출(`updateCartBadge`, `bindHeaderScrollEffect`, `bindRevealAnimation`, `bindButtonRipple`)은 `await` 없이 즉시 순서대로 실행되는지 코드상에서 확인(스크롤/리플 등 인터랙션이 네트워크 응답을 기다리지 않음).

- [ ] **Step 5: 커밋**

```bash
git add frontend/index.js
git commit -m "feat: 홈페이지 라떼아트 갤러리 조회/렌더링 (에러 격리 포함)"
```

---

## Task 4: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (15단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 15단계 체크박스 4개를 `- [x]`로 변경**
- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 15단계 체크 표시"
```
