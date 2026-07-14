// ===== 포맷 유틸리티 =====
function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function getStatusClass(status) {
  if (status === "완료") return "status-done";
  if (status === "준비중") return "status-preparing";
  return "status-received";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 라떼아트 모양의 실제 사진/영상이 등록되어 있으면 그것을, 없으면 이모티콘을 대신 표시한다.
function renderLatteArtShapeMedia(shape) {
  if (shape.video_url) {
    return `<video src="${escapeHtml(shape.video_url)}" autoplay muted loop playsinline></video>`;
  }
  if (shape.image_url) {
    return `<img src="${escapeHtml(shape.image_url)}" alt="${escapeHtml(shape.label)}" />`;
  }
  return shape.icon;
}

// ===== 장바구니 유틸리티 (localStorage 기반) =====
const CART_STORAGE_KEY = "cafe-app:cart";

function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function addToCart(menuId, quantity = 1) {
  const cartItems = getCart();
  const existing = cartItems.find((item) => item.menuId === menuId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({ menuId, quantity });
  }

  saveCart(cartItems);
  return cartItems;
}

function updateCartItemQuantity(menuId, quantity) {
  let cartItems = getCart();

  if (quantity <= 0) {
    cartItems = cartItems.filter((item) => item.menuId !== menuId);
  } else {
    const existing = cartItems.find((item) => item.menuId === menuId);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  saveCart(cartItems);
  return cartItems;
}

function removeFromCart(menuId) {
  const cartItems = getCart().filter((item) => item.menuId !== menuId);
  saveCart(cartItems);
  return cartItems;
}

function clearCart() {
  saveCart([]);
}

function getCartTotalCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotalPrice(getMenuByIdFn) {
  return getCart().reduce((total, item) => {
    const menu = getMenuByIdFn(item.menuId);
    if (!menu) return total;
    return total + menu.price * item.quantity;
  }, 0);
}

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
