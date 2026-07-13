# 히어로 섹션 실사 배경 이미지 적용

## 배경 / 목적

랜딩 페이지(`frontend/index.html`) 히어로 섹션이 현재 그라디언트 원형 아이콘(☕ 이모지) 비주얼로 구성되어 있다. 이를 실제 유럽풍 커피숍 사진으로 교체하고, 섹션 높이를 더 키워 더 임팩트 있는 첫인상을 제공한다.

## 범위

- 대상 파일: `frontend/index.html`(히어로 섹션 마크업), `frontend/index.css`(`.hero` 관련 스타일)
- 다른 섹션(Quick Menu 이하)은 변경하지 않는다.

## 결정 사항

1. **배경 이미지**
   - Unsplash 무료 스톡 이미지를 로컬 다운로드 없이 CSS에서 직접 하드링크한다.
   - 선택된 이미지: 어두운 빈티지 카페 내부, 천장에 네온사인 "CAFE" 간판과 조명이 있는 사진.
     `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80`
   - `.hero`의 `background-image`로 적용하며 `background-size: cover; background-position: center;`.

2. **오버레이**
   - 사진 위에 어두운 그라디언트 스크림을 추가해 텍스트 가독성을 확보한다(좌측이 더 진하고 우측으로 갈수록 옅어지는 형태).
   - 텍스트 계열 색상(`.hero-eyebrow`, `.hero-title`, `.hero-desc`)을 밝은 톤으로 조정해 어두운 배경 위에서도 잘 보이게 한다.

3. **레이아웃 변경**
   - 우측 원형 비주얼(`.hero-visual`, `.hero-visual-ring`, `.hero-visual-circle`)과 관련 애니메이션(`hero-float` 키프레임)을 완전히 제거한다.
   - `.hero-inner`는 기존 2단 그리드(텍스트 / 원형 비주얼)에서 텍스트만 담는 단일 컬럼(왼쪽 정렬)으로 변경한다. 960px 이상 미디어쿼리의 2단 그리드 규칙도 함께 제거한다.

4. **높이**
   - `.hero`의 `min-height`를 `88vh`에서 `94vh`로 확대한다.
   - 모바일(`max-width: 640px`) 브레이크포인트는 기존과 동일하게 `min-height: auto`를 유지한다(사진 배경이 콘텐츠 높이에 맞춰 자연스럽게 줄어듦).

## 완료 기준

- 히어로 섹션이 지정된 Unsplash 사진을 배경으로 표시한다.
- 텍스트(eyebrow, title, desc, 버튼)가 어두운 오버레이 위에서 명확히 읽힌다.
- 우측 원형 아이콘 비주얼과 관련 CSS/애니메이션이 코드에서 제거되어 있다.
- 데스크톱에서 히어로 섹션 높이가 이전보다 커진 것이 육안으로 확인된다(`94vh`).
- 모바일 레이아웃이 깨지지 않는다.
