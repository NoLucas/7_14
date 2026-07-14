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

## 🛠️ 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| 프런트엔드 | HTML / CSS / Vanilla JavaScript | 프레임워크 없이 정적 페이지로 구현 |
| 로컬 데이터 저장 | `localStorage` | 장바구니(`cart`), 라떼아트 요청 임시 선택(`latteArtSelection`)만 유지(19단계에서 로그인 관련 목업도 제거됨) |
| 백엔드/DB | [Supabase](https://supabase.com) (Postgres + Storage + Auth) | 카테고리/메뉴/라떼아트 프리셋 모양/주문(+주문 항목)/라떼아트 요청·영상을 관계형 테이블로 관리(18단계), 로그인 계정은 Supabase Auth(`auth.users`) + `public.profiles`(role 구분)로 관리(19단계). 클라이언트에서 `@supabase/supabase-js` (CDN, `frontend/js/supabase-client.js` · `frontend/js/auth-client.js`)로 직접 접근, 관리자 쓰기 작업은 RLS로 `is_admin()`에게만 허용 |
| 폰트 | Pretendard | `frontend/css/variables.css`에서 전역 적용 |
| 개발 서버 | [`serve`](https://www.npmjs.com/package/serve) (npm 패키지) | `npm start` → `frontend/`를 정적 서빙 (포트 3113) |
| 버전 관리 | Git / GitHub | |

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

- [x] `frontend/js/data.js` — `LATTE_ART_SHAPES` 프리셋 목록(하트/로제타/튤립/곰돌이/기타) 추가, `MENUS`의 라떼류(카페라떼/카푸치노/바닐라라떼)에 `latteArtAvailable: true` 플래그 추가
- [x] `frontend/js/utils.js` — 장바구니 단위 라떼아트 요청 저장/조회/삭제 함수 추가: `getLatteArtSelection` / `setLatteArtSelection` / `clearLatteArtSelection` (localStorage 키 `cafe-app:latteArtSelection`)
- [x] `frontend/menus/detail.html`, `detail.css`, `detail.js` — `latteArtAvailable` 메뉴일 때 모양 선택 UI(프리셋 카드 + "기타" 선택 시 텍스트 입력) 노출. 장바구니 담기 시 현재 선택을 라떼아트 요청으로 저장(기존 요청이 있으면 교체 confirm)
- [x] `frontend/basket/list.html`, `list.css`, `list.js` — "라떼아트 요청" 카드로 현재 요청(메뉴명/모양/설명) 표시, 삭제 가능

### 12단계: Supabase 연동 기반 구축

> 라떼아트 요청·영상은 관리자/고객이 서로 다른 브라우저에서 봐야 하므로 localStorage로는 공유가 안 됨. 이 기능에 한해서만 Supabase(DB + Storage)를 도입하고, 기존 주문/메뉴/인증은 그대로 localStorage 목업 유지.

- [x] Supabase 프로젝트 생성. 테이블 `latte_art_orders` 생성: `order_id`(PK, text, 기존 로컬 주문 ID 그대로 사용) / `item_name`(text) / `shape`(text) / `note`(text, nullable) / `video_url`(text, nullable) / `video_uploaded_at`(timestamptz, nullable) / `created_at`(timestamptz)
- [x] Storage 버킷 `latte-art-videos` 생성 및 접근 정책 설정
- [x] `frontend/js/supabase-client.js` — Supabase JS client 초기화 (project URL, anon key)
- [x] `frontend/js/latte-art.js` — `saveLatteArtRequest(orderId, request)` / `getLatteArtByOrderId(orderId)` / `uploadLatteArtVideo(orderId, file)` 공통 함수
- [x] `frontend/basket/list.js` — 주문하기(`createOrder`) 성공 후 라떼아트 요청이 있으면 `saveLatteArtRequest` 호출, 로컬 선택 초기화

**⚠️ 알려진 이슈 (최종 리뷰에서 발견, 의도적으로 미해결)**

- **`order_id` 충돌 가능성** — `latte_art_orders.order_id`는 브라우저별 로컬 `generateOrderId()`(`ORD-YYYYMMDD-NNN`, 당일 순번)를 그대로 공유 테이블의 PK로 사용한다. 서로 다른 기기의 고객이 같은 날 같은 순번을 생성하면 나중 주문의 `saveLatteArtRequest` insert가 PK 충돌로 실패해 조용히 `null`을 반환하고(체크아웃 자체는 정상 진행), 해당 고객의 라떼아트 요청이 유실된다. 포트폴리오/데모 규모상 실제 동시 충돌 가능성이 낮다고 보고 현재는 그대로 두기로 결정함 — 실사용 트래픽이 생기면 서로게이트 PK 등으로 재검토 필요.
- **`uploadLatteArtVideo`의 에러 계약 미검증** — `frontend/js/latte-art.js`의 다른 두 함수(`saveLatteArtRequest`/`getLatteArtByOrderId`)와 달리, `client.storage...upload()` 호출은 이론상 `{data, error}`를 반환하지 않고 reject할 수 있어 "절대 throw하지 않는다"는 파일 전체의 계약을 깰 가능성이 있다. 12단계 시점에는 이 함수를 호출하는 곳이 없어 실질적 영향은 없음 — **13단계에서 실제 업로드 UI를 연결할 때 try/catch로 감싸거나 동작을 재검증할 것.**
- **커스텀 모양 + 빈 설명 처리** — 고객이 "기타"를 선택하고 설명을 비워둔 채 저장되면(11단계 UI는 버튼 비활성화로 막지만, 향후 경로 변경 시 재발 가능) `shape: "custom"`, `note: null`로 저장된다. 13/14단계 화면에서 표시할 내용이 없을 수 있음 — 표시 로직에서 폴백 문구를 고려할 것.

### 13단계: 관리자 - 라떼아트 영상 업로드

> 바리스타가 라떼아트를 만든 뒤 녹화한 영상을 주문에 연결해 업로드 (실시간 스트리밍이 아닌 녹화 업로드 방식).

- [x] `frontend/admin/orders/detail.html`, `detail.css`, `detail.js` — 주문에 연결된 라떼아트 요청(모양/설명) 표시
- [x] 영상 업로드 UI(파일 선택 + 업로드 버튼, 진행 상태 표시). `video/*` 타입 및 용량 상한(예: 50MB) 클라이언트 검증
- [x] 업로드 성공 시 `uploadLatteArtVideo` 호출 → `video_url` / `video_uploaded_at` 갱신 및 화면 반영

**⚠️ 알려진 이슈 (최종 리뷰에서 발견)**

- **`order_id` 충돌 위험의 새로운 파급 범위** — 12단계에서 이미 받아들인 위험("서로 다른 기기의 고객이 같은 날 같은 순번을 생성하면 나중 주문의 요청이 조용히 유실됨")이, 13단계에서 `order_id`로 실제 조회(`getLatteArtByOrderId`)를 처음 수행하면서 파급 범위가 넓어졌다. 겹침이 발생하면 관리자가 해당 주문을 열었을 때 다른 고객의 라떼아트 요청/영상이 표시되거나, 업로드한 영상이 엉뚱한 주문에 연결될 수 있다. **14단계로 인해 이 파급 범위가 한 번 더 넓어졌다**: 이제 고객도 `frontend/orders/detail.html`에서 동일한 `order_id`로 조회하므로, 겹침이 발생하면 고객이 자기 주문 상세에서 **다른 고객의** 라떼아트 요청/영상을 보게 될 수 있다 — 관리자 쪽 데이터 혼선을 넘어 고객 간 개인정보 노출 성격의 문제로 바뀐다. 발생 확률 자체는 12단계와 동일(포트폴리오/데모 규모상 낮음)하지만, "조용한 유실" → "관리자 화면의 데이터 혼선" → "고객에게 노출되는 개인정보 문제"로 결과의 심각도가 단계적으로 커졌다는 점을 기록해 둔다. 여전히 수정하지 않기로 함 — 실사용 트래픽이 생기면 반드시 서로게이트 PK 등으로 재검토할 것.
- **영상 재업로드 시 이전 파일이 Storage에 남음** — `uploadLatteArtVideo`는 매번 새 파일명(`${orderId}-${Date.now()}.${ext}`)으로 업로드하고 `video_url`만 갱신하므로, "영상 교체"를 여러 번 하면 이전 파일들이 버킷에 계속 쌓인다. `anon`에게 Storage 삭제 정책이 없어 정리 경로도 없음(13단계 개발 중 실제로 이 문제로 임시 정책을 추가/제거한 적 있음). 포트폴리오/데모 규모상 당장 문제 되지 않아 후순위로 미룸 — 실사용 시 주기적 정리 작업 또는 삭제 정책 추가 필요.

### 14단계: 고객 - 라떼아트 영상 확인

- [x] `frontend/orders/detail.html`, `detail.css`, `detail.js` — 주문에 라떼아트 요청이 있으면 요청 내용 표시. `video_url`이 있으면 `<video>` 재생, 없으면 "제작 중" 안내
- [x] Supabase 조회 실패 시 해당 섹션만 안내 메시지로 대체(주문 상세 페이지 자체는 정상 표시되도록 에러 격리)

### 15단계: 홈페이지 - 라떼아트 갤러리 & 헤더 메뉴

> 로그인/주문 여부와 무관하게 누구나 홈페이지에서 실제 업로드된 라떼아트 영상을 볼 수 있게 한다. 헤더에 "라떼아트" 메뉴를 추가해 새 섹션으로 스크롤 이동(기존 Menu/Event 앵커 링크와 동일 방식). Supabase에서 영상이 업로드된 요청 중 최근 4개를 가져와 인스타그램 갤러리와 같은 스타일(자동재생/무음/반복)로 표시. 4개 미만이면 있는 만큼만, 0개면 안내 문구. **알려진 트레이드오프**: `latte_art_orders`에 고객 이름 등 개인정보는 없지만, 고객 동의 없이 업로드된 주문 영상이 모두 공개 갤러리 대상이 됨(포트폴리오/데모 규모상 허용하기로 결정, 관리자 승인/공개 토글 없음).

- [x] `frontend/js/latte-art.js` — `getRecentLatteArtVideos(limit)` 함수 추가: `video_url`이 있는 요청을 `video_uploaded_at` 내림차순으로 조회
- [x] `frontend/index.html` — 헤더 nav에 "라떼아트" 메뉴 추가(`#latteArtGallery` 앵커), Supabase 스크립트 태그 추가, 갤러리 섹션 마크업 추가
- [x] `frontend/index.css` — 갤러리 그리드/카드 스타일 (기존 Instagram Gallery 섹션과 동일한 반응형 패턴: 모바일 2열 → 데스크톱 4열)
- [x] `frontend/index.js` — 갤러리 조회/렌더링, Supabase 실패 시 섹션만 안내로 대체(에러 격리, 홈페이지 전체는 항상 정상 표시)

### 16단계: 메뉴 목록 - 라떼아트 모양 탐색

> 라떼아트도 하나의 "메뉴"로 취급해, 메뉴 목록 페이지 카테고리 탭(전체/커피/티/에이드/디저트)에 "라떼아트" 탭을 추가한다. 이 탭을 고르면 커피 카드와 같은 스타일로 프리셋 모양 4종(하트/로제타/튤립/곰돌이)이 보이고, 모양을 고르면 그 모양을 만들 수 있는 커피 3종(카페라떼/카푸치노/바닐라라떼)이 나온다. 커피를 고르면 기존 메뉴 상세 페이지로 이동하되 그 모양이 미리 선택된 채로 열린다(장바구니 담기 전 다른 모양으로 바꿀 수 있음). 11단계에서 이미 구현된 모양 선택/저장 로직은 건드리지 않고, 그 앞에 "탐색" 경로만 새로 만든다.

- [x] `frontend/js/data.js` — `LATTE_ART_SHAPES` 각 항목에 `icon`(이모지) 필드 추가
- [x] `frontend/menus/list.html`, `list.css`, `list.js` — 카테고리 탭에 "라떼아트" 가상 탭 추가, 선택 시 모양 카드 그리드 렌더링(기존 메뉴 카드와 동일한 비주얼)
- [x] `frontend/menus/latte-art-detail.html`, `latte-art-detail.css`, `latte-art-detail.js` — 모양별 상세 페이지 신규 추가: 모양 아이콘/이름 + 지원 커피 3종 카드(`detail.html?id=X&shape=Y`로 연결)
- [x] `frontend/menus/detail.js` — URL의 `shape` 쿼리 파라미터를 읽어 라떼아트 모양을 미리 선택한 상태로 렌더링

### 17단계: 홈페이지 - 바리스타 소개

> 헤더에 "바리스타" 메뉴를 추가해(기존 "라떼아트" 갤러리 링크와는 별개) 새 "바리스타 소개" 섹션으로 스크롤 이동한다. 라떼아트를 담당하는 바리스타의 사진(플레이스홀더 아이콘)과 이력/소개글을 보여준다. 15단계에서 만든 영상 갤러리 섹션은 그대로 유지되며, 헤더에서 별도 링크로 연결되진 않지만 스크롤하면 자연스럽게 보인다. **알려진 사항**: 바리스타 사진/이력은 실제 인물 정보가 아직 없어 플레이스홀더(아이콘 + 예시 텍스트)로 채워짐 — 실제 내용이 준비되면 교체 필요. **특히 "2023 대한민국 라떼아트 챔피언십 우승" 같은 경력 항목은 실제 검증 가능한 사실처럼 읽히는 가짜 수상 이력이므로, 진짜 공개 배포 전에는 반드시 실제 내용으로 교체하거나 삭제할 것** — 최종 리뷰에서 지적된 사항.

- [x] `frontend/index.html` — 헤더 nav에 "바리스타" 메뉴 추가(`#baristaProfile` 앵커), 바리스타 소개 섹션 마크업 추가(사진 아이콘 + 이름/직함/경력/소개글, 플레이스홀더 내용)
- [x] `frontend/index.css` — 바리스타 소개 섹션 스타일 (사진+텍스트 카드 레이아웃, 반응형)

### 18단계: 데이터 저장소를 JSON/더미데이터 → Supabase(관계형 DB)로 전면 이전

> UI/UX는 변경하지 않고, `frontend/js/data.js`에 하드코딩되어 있던 `CATEGORIES`/`MENUS`/`LATTE_ART_SHAPES`/`ORDER_SEED`(localStorage 목업 포함)를 Supabase Postgres 테이블로 옮긴다. 데이터 형식·내용은 그대로 유지하되, 관계형으로 재설계(`menus.category_id` → `categories.id`, `order_items.order_id` → `orders.id`, `order_items.menu_id` → `menus.id` FK).

- [x] Supabase 테이블 생성: `categories`(4행) / `menus`(10행, `category_id` FK) / `latte_art_shapes`(4행) / `orders`(3행, 기존 `ORDER_SEED`) / `order_items`(5행, 주문별 `{menuId, quantity}` 정규화). 각 테이블 RLS 활성화 + `anon` 역할에 select/insert/update/delete 정책 부여(기존 `latte_art_orders` 테이블과 동일한 패턴, 실 인증 없는 앱 구조 유지)
- [x] 이전 전 JSON/더미데이터 레코드 수와 Supabase 테이블 행 수 일치 확인(4/10/4/3/5) 후 `frontend/js/data.js`의 하드코딩 배열과 localStorage 시드 로직(`MENU_STORAGE_KEY`, `ORDER_SEED`, `seedMenusIfOutdated` 등) 완전 삭제
- [x] `frontend/js/data.js` — `getCategories`/`getAllMenus`/`getLatteArtShapes`/`getOrders`/`getOrderById`/`createOrder`/`updateOrderStatus`/`createMenu`/`updateMenu`/`deleteMenu`/`toggleMenuSoldOut`를 Supabase 쿼리 기반 비동기 함수로 재작성. 메뉴/카테고리/라떼아트 모양은 페이지 로드 시 1회 fetch 후 모듈 캐시에 저장해, `getMenuById`/`getCategoryById`/`getMenusByCategory` 등 동기 조회 함수는 그대로 유지(호출부 대량 수정 최소화)
- [x] `frontend/js/supabase-client.js` CDN 스크립트 태그를 이전까지 라떼아트 기능에서만 쓰던 페이지 외에 데이터 조회가 필요한 모든 페이지(메뉴/장바구니/주문/마이페이지/관리자 전체, 총 16개 HTML)에 추가
- [x] 메뉴/카테고리/주문/장바구니/관리자 CRUD 관련 12개 JS 파일의 `init()`/이벤트 핸들러를 `async`로 전환하고 데이터 조회 함수 호출부에 `await` 추가 (장바구니 로컬 상태와 라떼아트 임시 선택은 기존 `localStorage` 방식 그대로 유지 — 실사용자 식별자가 없어 DB로 옮길 근거가 없다고 판단)
- [x] 검증: Supabase REST API에 `anon` 키로 실제 select/insert/update/delete 왕복 테스트(주문 생성 흐름 시뮬레이션) 및 모든 수정 JS 파일 `node --check` 구문 검증 통과. 로컬 브라우저 수동 QA는 미실시(헤드리스 브라우저 도구 없음) — 최초 배포/사용 전 실제 브라우저로 메뉴 목록/상세, 장바구니 담기~주문, 관리자 메뉴·주문 CRUD, 라떼아트 플로우를 한 번씩 직접 확인할 것

### 19단계: 로그인 계정 데이터를 Supabase Auth로 이관 + 관리자 RLS 강화

> `frontend/auth/login.js`에 하드코딩되어 있던 평문 비밀번호 데모 계정(`admin`/`admin1234`, `customer`/`customer1234`) 2건을 Supabase Auth로 이관한다. 회원가입(`signup.js`)은 원래도 실제 저장 로직이 없던 화면이라 이관 대상 데이터가 없어 그대로 둠(실제 가입 기능 구현은 이번 범위 밖으로 판단, 필요 시 별도 요청 필요). 로그인 시 실제 Supabase 세션이 생기는 것과 관리자 페이지 접근 제어 신설은 사전 보고 후 사용자 승인을 받고 진행함.

- [x] `public.profiles`(id→`auth.users` FK, `username` unique, `role` check(customer/admin)) 테이블 + RLS(본인 또는 admin만 select, insert/update는 트리거 전용) 생성
- [x] `handle_new_user()` 트리거로 `auth.users` insert 시 `profiles` 자동 생성, `is_admin()` SECURITY DEFINER 함수로 RLS 재귀 없이 관리자 여부 확인
- [x] 데모 계정 2건을 합성 이메일(`<id>@cafe-moment.local`)로 `auth.users`에 `pgcrypto`(`crypt`/`gen_salt('bf')`) 해싱하여 시딩 — 평문 비밀번호는 어디에도 남기지 않음
- [x] `menus`/`categories`/`orders`/`order_items`/`latte_art_orders`의 쓰기(insert/update/delete) RLS를 `is_admin()`에게만 허용하도록 강화(고객 체크아웃에 필요한 `orders`/`order_items` insert는 비로그인 상태로 유지). 강화 과정에서 "UPDATE는 SELECT 정책으로 행이 보여야 대상을 찾을 수 있다"는 Postgres RLS 특성 때문에 `authenticated` 역할에 SELECT 정책이 없어 관리자 UPDATE가 0건 처리되는 문제를 발견해 SELECT 정책에 `authenticated` 역할을 추가로 반영
- [x] `frontend/js/auth-client.js` 신규 — `signInWithUsername`/`signOutCurrentUser`/`getCurrentProfile`/`requireAdminOrRedirect` (아이디 입력 → 합성 이메일 변환 내부 처리, 화면 입력 필드는 기존과 동일)
- [x] `frontend/auth/login.js` — `DEMO_ACCOUNTS` 배열 제거, Supabase Auth 로그인으로 교체(레디이렉트 경로는 role에 따라 기존과 동일하게 admin/고객 홈으로 분기)
- [x] `frontend/admin/*` 8개 HTML 전체에 `requireAdminOrRedirect` 가드 스크립트 추가 — 로그인 안 했거나 role이 admin이 아니면 로그인 페이지로 리다이렉트(기존에는 이런 접근 제어가 전혀 없었음)
- [x] 검증: admin/customer 계정으로 실제 Supabase Auth 로그인(REST `/auth/v1/token`) 성공 확인, `is_admin()` 기반 RLS로 admin 쓰기 성공·customer/anon 쓰기 차단을 REST API로 각각 재현 확인, 전체 테이블 행 수 원상 확인(4/10/4/3/5, profiles 2), `DEMO_ACCOUNTS` 참조 전체 삭제 확인

**⚠️ 보고 사항**
- 관리자 페이지 가드는 클라이언트 스크립트로 리다이렉트하는 방식이라, 페이지 콘텐츠가 아주 잠깐 그려진 뒤 리다이렉트될 수 있음(로딩 오버레이 추가는 화면 요소 변경이라 이번 범위에서 제외). 실제 데이터 접근 차단은 DB의 RLS가 담당하므로 보안상 문제는 아니지만 UX상 알아둘 것
- 로그아웃 버튼은 추가하지 않음(UI 변경 금지 지침) — 다른 계정으로 로그인하면 세션이 자동 교체됨

**🐛 실제 브라우저 검증 중 발견/수정한 버그 (19단계 자체 코드, `npm start` 환경 한정)**
- `frontend/auth/login.js`가 관리자 로그인 후 `"../admin/index.html"`로 리다이렉트했는데, `serve` 패키지의 clean-url 기능이 이를 `/admin`(끝 슬래시 없음)으로 한 번 더 리다이렉트한다. 이 상태에서 `admin/index.html`의 `<script src="./index.js">`가 `/admin/index.js`가 아니라 `/index.js`(고객 홈페이지 스크립트)로 잘못 해석되어, 관리자 대시보드가 항상 "전체 주문 0 / 총 매출 0원"으로 보이는 실제 버그가 있었음(로그인 자체과 데이터는 정상, 대시보드 렌더링만 깨짐)
- 조치: 리다이렉트 대상을 `"../admin/"`(끝 슬래시 포함)으로 수정해 `serve`의 추가 리다이렉트가 발생하지 않도록 함. 헤드리스 브라우저로 재검증해 정상 표시(전체 주문 3, 품절 메뉴 0) 확인
- Playwright(Chromium)로 실제 브라우저 전체 플로우 검증 완료: 홈/메뉴 목록·상세/장바구니 담기/주문하기(체크아웃)/주문 내역/관리자 비로그인 접근 차단/고객 계정의 관리자 접근 차단/관리자 로그인·대시보드·메뉴 목록 이동, 콘솔 에러 없음 확인. 테스트 중 생성된 임시 주문·품절 토글은 삭제해 데이터 원상 복구함

