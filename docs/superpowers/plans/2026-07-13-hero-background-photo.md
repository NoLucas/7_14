# 히어로 섹션 실사 배경 이미지 적용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 랜딩 페이지(`frontend/index.html`) 히어로 섹션의 우측 원형 아이콘 비주얼을 제거하고, 유럽풍 커피숍 실사 사진을 전체 배경(full-bleed)으로 적용하며 섹션 높이를 키운다.

**Architecture:** 정적 HTML/CSS 변경. `frontend/index.html`에서 `.hero-visual` 마크업을 제거하고, `frontend/index.css`의 `.hero` 관련 규칙을 배경 이미지 + 오버레이 그라디언트 + 확대된 높이로 교체한다. 별도 빌드/번들 과정이 없으므로 브라우저에서 직접 눈으로 확인한다.

**Tech Stack:** 순수 HTML/CSS (프레임워크 없음), `serve` 패키지로 정적 서빙.

## Global Constraints

- 배경 이미지는 로컬 다운로드 없이 Unsplash URL을 CSS에서 직접 하드링크한다: `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80`
- `.hero`의 `min-height`는 `88vh` → `94vh`로 변경한다.
- 모바일(`max-width: 640px`) 브레이크포인트는 기존과 동일하게 `min-height: auto`를 유지한다.
- 우측 원형 비주얼(`.hero-visual`, `.hero-visual-ring`, `.hero-visual-circle`)과 `hero-float` 키프레임은 완전히 삭제한다.
- 이 프로젝트에는 자동화된 프론트엔드 테스트가 없다(`package.json`의 `test` 스크립트는 placeholder). 따라서 각 태스크의 검증은 `npm start`로 로컬 서버(`http://localhost:3113/frontend/index.html`)를 띄워 브라우저에서 육안으로 확인하는 방식으로 진행한다.

---

### Task 1: 히어로 배경 사진 + 오버레이 + 높이 확대 적용, 원형 비주얼 제거

**Files:**
- Modify: `frontend/index.html:36-53` (히어로 섹션 마크업)
- Modify: `frontend/index.css:163-306` (`.hero` 관련 규칙 전체)

**Interfaces:**
- 없음 (다른 섹션/스크립트와 상호작용하지 않는 순수 마크업+스타일 변경). `index.js`의 `.reveal` 스크롤 애니메이션 로직은 `.hero-content.reveal` 클래스가 그대로 유지되므로 영향받지 않는다.

- [ ] **Step 1: `frontend/index.html`에서 `.hero-visual` 블록 제거**

`frontend/index.html`의 현재 히어로 섹션(35~53번째 줄):

```html
    <!-- ===== Hero ===== -->
    <section class="hero">
      <div class="hero-inner container-wide">
        <div class="hero-content reveal">
          <p class="hero-eyebrow">Today's Signature</p>
          <h1 class="hero-title">오늘도 좋은 하루,<br />커피 한 잔과 함께</h1>
          <p class="hero-desc">
            매일 아침 직접 로스팅한 원두로<br />
            가장 좋은 커피를 제공합니다.
          </p>
          <a href="menus/list.html" class="btn-primary btn-ripple">메뉴 보러가기</a>
        </div>

        <div class="hero-visual reveal" aria-hidden="true">
          <div class="hero-visual-ring"></div>
          <div class="hero-visual-circle">☕</div>
        </div>
      </div>
    </section>
```

다음으로 교체한다 (`hero-visual` 블록 삭제):

```html
    <!-- ===== Hero ===== -->
    <!-- 배경: 유럽풍 커피숍 실사 사진(index.css .hero 참고), 어두운 오버레이 위에 텍스트 배치 -->
    <section class="hero">
      <div class="hero-inner container-wide">
        <div class="hero-content reveal">
          <p class="hero-eyebrow">Today's Signature</p>
          <h1 class="hero-title">오늘도 좋은 하루,<br />커피 한 잔과 함께</h1>
          <p class="hero-desc">
            매일 아침 직접 로스팅한 원두로<br />
            가장 좋은 커피를 제공합니다.
          </p>
          <a href="menus/list.html" class="btn-primary btn-ripple">메뉴 보러가기</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: `frontend/index.css`에서 `.hero` 관련 규칙을 배경 사진 버전으로 교체**

`frontend/index.css`의 163번째 줄부터 306번째 줄까지(`/* ===== Hero ===== */`부터 `max-width: 640px` 미디어쿼리 닫는 `}`까지, `.btn-primary`/`.ripple` 규칙 제외하고 `.hero`, `.hero-inner`, `.hero-eyebrow`, `.hero-title`, `.hero-desc`, `.hero-visual*`, `@keyframes hero-float`, `@media (min-width: 960px) { .hero-inner ... }`, `@media (max-width: 640px) { .hero ... }` 블록)를 아래 내용으로 교체한다:

```css
/* ===== Hero ===== */
/* 배경: 유럽풍 빈티지 카페 실사 사진(Unsplash) + 좌측이 진한 어두운 그라디언트 오버레이 */
.hero {
  padding: 0 var(--space-xl);
  min-height: 94vh;
  display: flex;
  align-items: center;
  background-image: linear-gradient(
      90deg,
      rgba(20, 14, 10, 0.8) 0%,
      rgba(20, 14, 10, 0.5) 55%,
      rgba(20, 14, 10, 0.28) 100%
    ),
    url("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80");
  background-size: cover;
  background-position: center;
}

.hero-inner {
  display: block;
  max-width: 640px;
}

.hero-eyebrow {
  font-size: var(--font-size-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-light);
}

.hero-title {
  margin-top: var(--space-md);
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1.28;
  color: var(--color-text-inverse);
}

.hero-desc {
  margin-top: var(--space-lg);
  font-size: var(--font-size-md);
  line-height: 1.7;
  color: rgba(253, 250, 246, 0.86);
}

@media (max-width: 640px) {
  .hero {
    min-height: auto;
    padding-top: var(--space-2xl);
    padding-bottom: var(--space-2xl);
  }

  .hero-title {
    font-size: 2.25rem;
  }
}
```

이 교체로 다음이 함께 제거된다: `.hero-visual`, `.hero-visual-ring`, `.hero-visual-circle`, `@keyframes hero-float`, `@media (min-width: 960px) { .hero-inner { grid-template-columns: 1fr 1fr; } }`.

- [ ] **Step 3: 로컬 서버로 육안 확인**

Run: `npm start`
Expected: 콘솔에 `Accepting connections at http://localhost:3113` 같은 메시지 출력.

브라우저에서 `http://localhost:3113/frontend/index.html` 접속.

확인 항목:
- 히어로 섹션 배경에 어두운 빈티지 카페(네온 "CAFE" 간판) 사진이 보인다.
- 텍스트("Today's Signature", 제목, 설명, "메뉴 보러가기" 버튼)가 사진 위에서 또렷하게 읽힌다.
- 우측에 있던 원형 ☕ 아이콘이 더 이상 보이지 않는다.
- 브라우저 창을 세로로 좁혀 640px 이하로 만들었을 때 히어로가 자연스럽게 콘텐츠 높이에 맞춰 줄어든다(레이아웃 깨짐 없음).
- 브라우저 개발자도구(F12)를 열어 콘솔에 에러가 없는지 확인한다.

서버는 `Ctrl+C`로 종료한다.

- [ ] **Step 4: 커밋**

```bash
git add frontend/index.html frontend/index.css
git commit -m "feat: 히어로 섹션에 유럽풍 커피숍 배경 사진 적용, 높이 확대"
```

---

## Self-Review Notes

- **스펙 커버리지:** 배경 이미지 하드링크(✅ Step 2), 오버레이(✅ Step 2 그라디언트), 원형 비주얼 제거(✅ Step 1, 2), 높이 94vh(✅ Step 2), 모바일 `min-height: auto` 유지(✅ Step 2), 완료 기준 4항목 모두 Step 3 육안 확인 항목에 반영됨.
- **플레이스홀더 스캔:** 없음 — 모든 코드 블록이 실제로 붙여넣을 수 있는 완전한 내용.
- **일관성:** HTML에서 제거하는 마크업과 CSS에서 제거하는 규칙 이름이 정확히 일치(`hero-visual`, `hero-visual-ring`, `hero-visual-circle`, `hero-float`).
