# 17단계: 홈페이지 - 바리스타 소개 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헤더에 "바리스타" 메뉴를 추가해(기존 "라떼아트" 영상 갤러리 링크와는 별개) 새 "바리스타 소개" 섹션으로 스크롤 이동한다. 라떼아트를 담당하는 바리스타의 사진(플레이스홀더 아이콘)과 이력/소개글을 보여준다.

**Architecture:** 순수 정적 HTML/CSS 추가 — JS 로직이나 데이터 조회가 전혀 필요 없다(Supabase도 아니고, 동적 렌더링도 아님). 15단계에서 만든 "Latte Art Gallery" 섹션(`#latteArtGallery`)은 그대로 두고, 그 바로 뒤에 새 섹션 `#baristaProfile`을 추가한다. 헤더 nav에 "바리스타" 링크를 하나 더 추가하되, 기존 "라떼아트" 링크는 그대로 둔다(두 링크가 공존).

**Tech Stack:** 정적 HTML/CSS. 코드 변경 없음.

## Global Constraints

- 바리스타 사진/이력은 실제 인물 정보가 없어 플레이스홀더로 채운다 — 사진은 이미지 파일이 아니라 이모지 아이콘을 원형 배경에 넣는 방식(이 프로젝트가 실제 이미지가 없을 때 이미 쓰고 있는 패턴 — `my/index.html`의 `.profile-avatar`, `index.js`의 Instagram 갤러리 아이콘 타일 참고). 이력/소개글도 예시 텍스트로 채우고, HTML 주석으로 "플레이스홀더, 실제 내용으로 교체 필요"라고 표시한다.
- 15단계의 "Latte Art Gallery" 섹션(`#latteArtGallery`, 헤더의 "라떼아트" 링크가 가리키는 곳)은 이 단계에서 전혀 수정하지 않는다 — 그 바로 뒤에 새 섹션만 추가한다.
- 새 섹션/링크는 정확히 이 id를 쓴다: 헤더 링크 `href="#baristaProfile"`, 섹션 `id="baristaProfile"`.
- `.section`/`.section-head`/`.section-eyebrow`/`.section-title`/`.section-desc`는 `frontend/index.css` 상단에 이미 공통 스타일로 정의되어 있다 — 재정의하지 않는다(15단계와 동일한 원칙).
- **로컬 서버 URL 규칙 (16단계에서 실제로 발견된 문제)**: `package.json`의 `start` 스크립트가 `serve frontend -l 3113`이라 로컬 서버는 `frontend/`를 루트로 서빙한다 — URL에 `/frontend/` 접두사를 붙이지 않는다(홈페이지는 `http://localhost:3113/` 또는 `http://localhost:3113/index.html`, `/frontend/index.html`이 아니다). 이 페이지는 쿼리 파라미터를 쓰지 않으므로 `serve`의 `.html`→확장자 없는 URL 리다이렉트가 쿼리 스트링을 날리는 버그(16단계에서 발견)는 영향 없지만, 일관성을 위해 검증 시 `/frontend/` 접두사만은 반드시 뺄 것.

---

## Task 1: `frontend/index.html` + `frontend/index.css` — 헤더 메뉴 + 바리스타 소개 섹션

**Files:**
- Modify: `frontend/index.html`, `frontend/index.css`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (정적 콘텐츠)

- [ ] **Step 1: 헤더 nav에 "바리스타" 메뉴 추가**

`frontend/index.html`의 `<nav class="site-nav">` 블록에서 "라떼아트" 링크 뒤에 추가:

```html
      <nav class="site-nav">
        <a href="#popularMenu">Menu</a>
        <a href="menus/list.html">Store</a>
        <a href="#recommend">Event</a>
        <a href="#latteArtGallery">라떼아트</a>
        <a href="#baristaProfile">바리스타</a>
      </nav>
```

- [ ] **Step 2: "Latte Art Gallery" 섹션과 "Review" 섹션 사이에 새 섹션 삽입**

```html
    <!-- ===== Barista Profile ===== -->
    <!-- 플레이스홀더: 실제 바리스타 사진/이력이 준비되면 아래 내용을 교체할 것 -->
    <section class="section barista-profile container-wide" id="baristaProfile">
      <div class="section-head reveal">
        <p class="section-eyebrow">Our Barista</p>
        <h2 class="section-title">라떼아트 담당 바리스타</h2>
        <p class="section-desc">정성을 담은 한 잔, 라떼아트로 완성합니다.</p>
      </div>
      <div class="barista-card glass reveal">
        <div class="barista-photo">🧑‍🍳</div>
        <div class="barista-info">
          <h3 class="barista-name">김라떼 바리스타</h3>
          <p class="barista-role">헤드 바리스타 · 라떼아트 전문</p>
          <ul class="barista-career">
            <li>2023 대한민국 라떼아트 챔피언십 우승</li>
            <li>2021 ~ Cafe Moment 헤드 바리스타</li>
            <li>2019 이탈리아 바리스타 아카데미 수료</li>
          </ul>
          <p class="barista-bio">"한 잔의 커피에도 정성을 담습니다. 고객님이 주문하신 라떼아트를 정성껏 만들어드릴게요."</p>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: `frontend/index.css` 끝에 스타일 추가**

```css

/* ===== Barista Profile ===== */
.barista-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.barista-photo {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
}

.barista-info {
  text-align: center;
}

.barista-name {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.barista-role {
  margin-top: var(--space-xs);
  color: var(--color-primary-light);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.barista-career {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  list-style: disc;
  padding-left: var(--space-lg);
  text-align: left;
  display: inline-block;
}

.barista-bio {
  margin-top: var(--space-md);
  color: var(--color-text);
  font-style: italic;
}

@media (min-width: 768px) {
  .barista-card {
    flex-direction: row;
    align-items: center;
  }

  .barista-info {
    text-align: left;
  }
}
```

- [ ] **Step 4: 검증 — 실제 브라우저(Playwright)**

`npm start`로 로컬 서버를 띄운 뒤 `http://localhost:3113/index.html`에 접속해서:
1. 헤더에 "라떼아트"와 "바리스타" 두 메뉴가 모두 보이는지 (기존 "라떼아트" 링크가 사라지지 않았는지)
2. "바리스타" 클릭 시 새 섹션으로 스크롤되는지
3. 바리스타 사진(아이콘)/이름/직함/경력/소개글이 정상 렌더링되는지, 좁은 화면(모바일 너비)과 넓은 화면(데스크톱 너비) 둘 다 스크린샷으로 확인
4. 기존 "Latte Art Gallery" 섹션(영상 갤러리)이 그대로 정상 작동하는지(이 단계에서 건드리지 않았으므로 회귀 없어야 함)

12~16단계에서 쓴 것과 동일한 Playwright 스크립트 패턴(`chromium.launch()` → `page.goto()` → `page.screenshot()` → 콘솔 에러 확인)을 사용할 것. 스크린샷은 실제로 열어서 눈으로 확인한다(빈 화면이면 실패).

- [ ] **Step 5: 커밋**

```bash
git add frontend/index.html frontend/index.css
git commit -m "feat: 홈페이지에 바리스타 소개 섹션과 헤더 메뉴 추가"
```

---

## Task 2: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (17단계 체크박스)

- [ ] **Step 1: `BLUEPRINT.md`의 17단계 체크박스 2개를 `- [x]`로 변경**
- [ ] **Step 2: 커밋**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 17단계 체크 표시"
```
