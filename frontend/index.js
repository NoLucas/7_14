// ===== 갤러리용 아이콘 (실제 사진 대신 사용하는 목업 데이터) =====
const GALLERY_ICONS = ["☕", "🥐", "🍰", "🌿", "📖", "🕯️", "🧋", "🍮"];

// ===== 별점 표시 유틸 =====
function renderRatingStars(rating) {
  const value = Number(rating) || DEFAULT_MENU_RATING;
  return `★ ${value.toFixed(1)}`;
}

// ===== 인기 메뉴 =====
function renderFeaturedMenus() {
  const scrollEl = document.getElementById("featuredScroll");
  const menus = getPopularMenus();

  if (menus.length === 0) {
    scrollEl.innerHTML = `<p class="empty-state">준비된 메뉴가 없습니다.</p>`;
    return;
  }

  scrollEl.innerHTML = menus
    .map((menu) => {
      const category = getCategoryById(menu.categoryId);

      return `
        <article class="menu-card${menu.soldOut ? " sold-out" : ""}">
          <a class="menu-card-image" href="menus/detail.html?id=${encodeURIComponent(menu.id)}">
            <img src="${menu.image}" alt="${menu.name}" loading="lazy" />
          </a>
          <div class="menu-card-body">
            ${category ? `<span class="menu-card-category">${category.name}</span>` : ""}
            <a href="menus/detail.html?id=${encodeURIComponent(menu.id)}" class="menu-card-name">
              ${menu.name}
            </a>
            <span class="menu-card-rating">${renderRatingStars(menu.rating)}</span>
            <div class="menu-card-footer">
              <span class="menu-card-price">${formatPrice(menu.price)}</span>
              ${
                menu.soldOut
                  ? ""
                  : `<button class="add-cart-btn" type="button" data-menu-id="${menu.id}">Add to Cart</button>`
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bindAddToCartButtons(scrollEl);
}

// 인기 메뉴로 노출할 목록: 오늘의 추천(별점 상위 3개)과 겹치지 않게 나머지 중 평점순으로 고른다
function getPopularMenus() {
  const recommendedIds = new Set(getRecommendedMenus().map((menu) => menu.id));

  return getMenusByCategory()
    .filter((menu) => !recommendedIds.has(menu.id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
}

// ===== 오늘의 추천 메뉴 =====
function getRecommendedMenus() {
  return getMenusByCategory()
    .filter((menu) => !menu.soldOut)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);
}

function renderRecommendation() {
  const gridEl = document.getElementById("recommendGrid");
  const menus = getRecommendedMenus();

  if (menus.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">준비된 메뉴가 없습니다.</p>`;
    return;
  }

  gridEl.innerHTML = menus
    .map((menu) => {
      const category = getCategoryById(menu.categoryId);

      return `
        <a class="recommend-card" href="menus/detail.html?id=${encodeURIComponent(menu.id)}">
          <div class="recommend-card-image">
            <img src="${menu.image}" alt="${menu.name}" loading="lazy" />
          </div>
          <div class="recommend-card-body">
            ${category ? `<span class="recommend-card-category">${category.name}</span>` : ""}
            <h3 class="recommend-card-name">${menu.name}</h3>
            <p class="recommend-card-desc">${menu.description}</p>
            <span class="recommend-card-price">${formatPrice(menu.price)}</span>
          </div>
        </a>
      `;
    })
    .join("");
}

// ===== Instagram 갤러리 (목업) =====
function renderGallery() {
  const gridEl = document.getElementById("galleryGrid");

  gridEl.innerHTML = GALLERY_ICONS.map(
    (icon) => `
      <div class="gallery-tile">
        <span>${icon}</span>
      </div>
    `
  ).join("");
}

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

// ===== 장바구니 담기 (인기 메뉴 카드 버튼) =====
function bindAddToCartButtons(scopeEl) {
  scopeEl.querySelectorAll(".add-cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.menuId, 1);
      updateCartBadge();

      const originalText = button.textContent;
      button.textContent = "담았습니다!";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1200);
    });
  });
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

// ===== 헤더 스크롤 효과 =====
// 스크롤을 조금이라도 내리면 헤더에 유리질감(blur)을 더해 상단바가 또렷해지도록 한다.
function bindHeaderScrollEffect() {
  const header = document.querySelector(".site-header");

  const applyScrollState = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", applyScrollState, { passive: true });
  applyScrollState();
}

// ===== 스크롤 등장(Reveal) 애니메이션 =====
function bindRevealAnimation() {
  const targets = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((target) => observer.observe(target));
}

// ===== 버튼 리플 효과 =====
// 클릭한 위치에서 원이 퍼졌다 사라지는 잔잔한 피드백만 추가한다 (과한 애니메이션 지양).
function bindButtonRipple() {
  document.querySelectorAll(".btn-ripple").forEach((button) => {
    button.addEventListener("click", (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);

      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
}

// ===== 초기화 =====
async function init() {
  await Promise.all([getAllMenus(), getCategories()]);
  renderFeaturedMenus();
  renderRecommendation();
  renderGallery();
  renderLatteArtGallery();
  updateCartBadge();
  bindHeaderScrollEffect();
  bindRevealAnimation();
  bindButtonRipple();
}

init();
