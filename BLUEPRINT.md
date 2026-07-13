# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```
project1/
│
├── backend/                           # 향후 서버/API 구현 예정 (현재 없음)
│   └── README.md
│
├── frontend/                          # 정적 프런트엔드(HTML/CSS/JS + localStorage)
│   │
│   ├── index.html                     # 메인 (고객)
│   ├── index.css                      # 메인 페이지 스타일
│   ├── index.js                       # 메인 페이지 로직
│   │
│   ├── 🔑 로그인 / 회원가입 (DB 미연동, 화면만 구현)
│   │   └── auth/
│   │       ├── login.html             # 로그인
│   │       ├── login.js
│   │       ├── signup.html            # 회원가입
│   │       ├── signup.js
│   │       └── auth.css               # 로그인/회원가입 공통 스타일
│   │
│   ├── 👤 고객 - 메뉴
│   │   └── menus/
│   │       ├── list.html              # 메뉴 목록
│   │       ├── list.css
│   │       ├── list.js
│   │       ├── detail.html            # 메뉴 상세
│   │       ├── detail.css
│   │       └── detail.js
│   │
│   ├── 👤 고객 - 마이페이지
│   │   └── my/
│   │       ├── index.html             # 마이페이지 메인
│   │       ├── index.css
│   │       └── index.js
│   │
│   ├── 👤 고객 - 장바구니
│   │   └── basket/
│   │       ├── list.html              # 장바구니
│   │       ├── list.css
│   │       └── list.js
│   │
│   ├── 👤 고객 - 주문 내역
│   │   └── orders/
│   │       ├── list.html              # 주문 내역 목록
│   │       ├── list.css
│   │       ├── list.js
│   │       ├── detail.html            # 주문 상세
│   │       ├── detail.css
│   │       └── detail.js
│   │
│   ├── 🔴 관리자/사장
│   │   └── admin/
│   │       ├── index.html             # 대시보드
│   │       ├── index.css
│   │       ├── index.js
│   │       │
│   │       ├── menus/
│   │       │   ├── list.html          # 메뉴 목록
│   │       │   ├── list.css
│   │       │   ├── list.js
│   │       │   ├── detail.html        # 메뉴 상세
│   │       │   ├── detail.css
│   │       │   ├── detail.js
│   │       │   ├── create.html        # 메뉴 추가
│   │       │   ├── create.css
│   │       │   ├── create.js
│   │       │   ├── edit.html          # 메뉴 수정
│   │       │   ├── edit.css
│   │       │   └── edit.js
│   │       │
│   │       └── orders/
│   │           ├── list.html          # 주문 목록
│   │           ├── list.css
│   │           ├── list.js
│   │           ├── detail.html        # 주문 상세
│   │           ├── detail.css
│   │           ├── detail.js
│   │           ├── edit.html          # 주문 상태 수정
│   │           ├── edit.css
│   │           └── edit.js
│   │
│   └── 📦 공유 자원
│       ├── css/
│       │   └── variables.css          # CSS 변수 (전역)
│       └── js/
│           ├── data.js                # 메뉴/카테고리/주문 데이터
│           └── utils.js                # 공통 유틸리티
│
└── legacy-step2-backup/               # 2단계 작업 중 남은 예전 백업(중복, 미사용)
    ├── admin/menus/*
    └── js/data.js
```

## 👥 역할별 기능

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| **고객** | `/frontend/`, `/frontend/menus/`, `/frontend/my/`, `/frontend/basket/`, `/frontend/orders/`, `/frontend/auth/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역, 로그인/회원가입 |
| **관리자/사장** | `/frontend/admin/`, `/frontend/admin/menus/`, `/frontend/admin/orders/` | 대시보드, 메뉴 CRUD, 주문 관리 |

## 🎨 디자인

- **테마**: 라이트 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Glass morphism
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `frontend/css/`, `frontend/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리
- **backend/frontend 분리**: 서버 코드가 생기면 `backend/`에, 정적 자원은 전부 `frontend/`에 둔다

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `frontend/css/variables.css` — 전역 CSS 변수, 리셋
- [x] `frontend/js/data.js` — 메뉴/카테고리 데이터
- [x] `frontend/js/utils.js` — 공통 유틸리티 (카트, 포맷 등)

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `frontend/admin/menus/list.html` — 메뉴 목록
- [x] `frontend/admin/menus/list.css`
- [x] `frontend/admin/menus/list.js`
- [x] `frontend/admin/menus/detail.html` — 메뉴 상세
- [x] `frontend/admin/menus/detail.css`
- [x] `frontend/admin/menus/detail.js`
- [x] `frontend/admin/menus/create.html` — 메뉴 추가
- [x] `frontend/admin/menus/create.css`
- [x] `frontend/admin/menus/create.js`
- [x] `frontend/admin/menus/edit.html` — 메뉴 수정
- [x] `frontend/admin/menus/edit.css`
- [x] `frontend/admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `frontend/menus/list.html` — 메뉴 목록
- [x] `frontend/menus/list.css`
- [x] `frontend/menus/list.js`
- [x] `frontend/menus/detail.html` — 메뉴 상세
- [x] `frontend/menus/detail.css`
- [x] `frontend/menus/detail.js`

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `frontend/basket/list.html` — 장바구니
- [x] `frontend/basket/list.css`
- [x] `frontend/basket/list.js`

### 5단계: 고객 - 주문 관리 시스템

- [x] `frontend/orders/list.html` — 주문 내역 목록
- [x] `frontend/orders/list.css`
- [x] `frontend/orders/list.js`
- [x] `frontend/orders/detail.html` — 주문 상세
- [x] `frontend/orders/detail.css`
- [x] `frontend/orders/detail.js`
- [x] `frontend/js/data.js` — `createOrder`/`generateOrderId`로 실제 주문 생성 (장바구니 → 주문하기)
- [x] `frontend/basket/list.js` — "주문하기" 클릭 시 주문 생성 후 장바구니 비우고 주문 상세로 이동

### 6단계: 고객 - 메인 페이지

- [x] `frontend/index.html`
- [x] `frontend/index.css`
- [x] `frontend/index.js`

### 7단계: 고객 - 마이페이지

- [x] `frontend/my/index.html`
- [x] `frontend/my/index.css`
- [x] `frontend/my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [x] `frontend/admin/index.html` — 대시보드
- [x] `frontend/admin/index.css`
- [x] `frontend/admin/index.js`
- [x] `frontend/admin/orders/list.html` — 주문 목록
- [x] `frontend/admin/orders/list.css`
- [x] `frontend/admin/orders/list.js`
- [x] `frontend/admin/orders/detail.html` — 주문 상세
- [x] `frontend/admin/orders/detail.css`
- [x] `frontend/admin/orders/detail.js`
- [x] `frontend/admin/orders/edit.html` — 주문 상태 수정
- [x] `frontend/admin/orders/edit.css`
- [x] `frontend/admin/orders/edit.js`

### 9단계: 고객 - 로그인 / 회원가입 (DB 미연동)

- [x] `frontend/auth/login.html` — 로그인 (아이디/이메일, 비밀번호)
- [x] `frontend/auth/login.js` — 제출 시 안내 메시지만 표시 (실제 인증 없음)
- [x] `frontend/auth/signup.html` — 회원가입 (이름, 아이디/이메일, 비밀번호, 비밀번호 확인)
- [x] `frontend/auth/signup.js` — 제출 시 안내 메시지만 표시 (실제 저장 없음)
- [x] `frontend/auth/auth.css` — 로그인/회원가입 공통 스타일
- [x] 카페명(`Cafe Moment`) 상단 표시 및 클릭 시 `index.html` 이동 (메인/관리자/로그인/회원가입 공통)

### 10단계: 메인 페이지 UI/UX 리뉴얼 (Premium Minimal Cafe 스타일)

- [x] `frontend/css/variables.css` — 색상 팔레트(브라운/크림/우드)·타이포·여백·Pretendard 폰트 전면 교체 (전 페이지 공통 반영)
- [x] `frontend/js/data.js` — `MENUS`에 `rating`(별점) 필드 추가
- [x] `frontend/index.html` — Header(Sticky+Blur, Menu/About/Store/Event), Hero, Quick Menu, Popular Menu, Today's Recommendation, About Cafe, Review, Instagram Gallery, Footer 신규 구성
- [x] `frontend/index.css` — 신규 섹션 스타일, hover/스크롤 reveal/버튼 리플 애니메이션, 반응형(Desktop/Tablet/Mobile)
- [x] `frontend/index.js` — Popular Menu 카드(별점/카테고리/Add to Cart), Today's Recommendation·Instagram Gallery 렌더링, 헤더 스크롤 효과, 스크롤 reveal, 리플 이벤트 바인딩

### 11단계: 고객 - 라떼아트 모양 선택

> 라떼류 메뉴에 한해, 고객이 원하는 라떼아트 모양을 프리셋 또는 직접 입력으로 요청. 요청은 **장바구니 전체 단위로 1개만** 유지(여러 라떼아트 메뉴를 담아도 마지막 선택으로 교체).

- [ ] `frontend/js/data.js` — `LATTE_ART_SHAPES` 프리셋 목록(하트/로제타/튤립/곰돌이/기타) 추가, `MENUS`의 라떼류(카페라떼/카푸치노/바닐라라떼)에 `latteArtAvailable: true` 플래그 추가
- [ ] `frontend/js/utils.js` — 장바구니 단위 라떼아트 요청 저장/조회/삭제 함수 추가: `getLatteArtSelection` / `setLatteArtSelection` / `clearLatteArtSelection` (localStorage 키 `cafe-app:latteArtSelection`)
- [ ] `frontend/menus/detail.html`, `detail.css`, `detail.js` — `latteArtAvailable` 메뉴일 때 모양 선택 UI(프리셋 카드 + "기타" 선택 시 텍스트 입력) 노출. 장바구니 담기 시 현재 선택을 라떼아트 요청으로 저장(기존 요청이 있으면 교체 confirm)
- [ ] `frontend/basket/list.html`, `list.css`, `list.js` — "라떼아트 요청" 카드로 현재 요청(메뉴명/모양/설명) 표시, 삭제 가능

### 12단계: Supabase 연동 기반 구축

> 라떼아트 요청·영상은 관리자/고객이 서로 다른 브라우저에서 봐야 하므로 localStorage로는 공유가 안 됨. 이 기능에 한해서만 Supabase(DB + Storage)를 도입하고, 기존 주문/메뉴/인증은 그대로 localStorage 목업 유지.

- [ ] Supabase 프로젝트 생성. 테이블 `latte_art_orders` 생성: `order_id`(PK, text, 기존 로컬 주문 ID 그대로 사용) / `item_name`(text) / `shape`(text) / `note`(text, nullable) / `video_url`(text, nullable) / `video_uploaded_at`(timestamptz, nullable) / `created_at`(timestamptz)
- [ ] Storage 버킷 `latte-art-videos` 생성 및 접근 정책 설정
- [ ] `frontend/js/supabase-client.js` — Supabase JS client 초기화 (project URL, anon key)
- [ ] `frontend/js/latte-art.js` — `saveLatteArtRequest(orderId, request)` / `getLatteArtByOrderId(orderId)` / `uploadLatteArtVideo(orderId, file)` 공통 함수
- [ ] `frontend/basket/list.js` — 주문하기(`createOrder`) 성공 후 라떼아트 요청이 있으면 `saveLatteArtRequest` 호출, 로컬 선택 초기화

### 13단계: 관리자 - 라떼아트 영상 업로드

> 바리스타가 라떼아트를 만든 뒤 녹화한 영상을 주문에 연결해 업로드 (실시간 스트리밍이 아닌 녹화 업로드 방식).

- [ ] `frontend/admin/orders/detail.html`, `detail.css`, `detail.js` — 주문에 연결된 라떼아트 요청(모양/설명) 표시
- [ ] 영상 업로드 UI(파일 선택 + 업로드 버튼, 진행 상태 표시). `video/*` 타입 및 용량 상한(예: 50MB) 클라이언트 검증
- [ ] 업로드 성공 시 `uploadLatteArtVideo` 호출 → `video_url` / `video_uploaded_at` 갱신 및 화면 반영

### 14단계: 고객 - 라떼아트 영상 확인

- [ ] `frontend/orders/detail.html`, `detail.css`, `detail.js` — 주문에 라떼아트 요청이 있으면 요청 내용 표시. `video_url`이 있으면 `<video>` 재생, 없으면 "제작 중" 안내
- [ ] Supabase 조회 실패 시 해당 섹션만 안내 메시지로 대체(주문 상세 페이지 자체는 정상 표시되도록 에러 격리)

