// ===== 카테고리 =====
const CATEGORIES_TABLE = "categories";
let CATEGORIES = [];

async function getCategories() {
  const { data, error } = await getSupabaseClient().from(CATEGORIES_TABLE).select("*");
  if (error) {
    console.error("getCategories failed:", error);
    return CATEGORIES;
  }
  CATEGORIES = data;
  return CATEGORIES;
}

function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId) || null;
}

// ===== 라떼아트 프리셋 모양 =====
const LATTE_ART_SHAPES_TABLE = "latte_art_shapes";
let LATTE_ART_SHAPES = [];

async function getLatteArtShapes() {
  const { data, error } = await getSupabaseClient().from(LATTE_ART_SHAPES_TABLE).select("*");
  if (error) {
    console.error("getLatteArtShapes failed:", error);
    return LATTE_ART_SHAPES;
  }
  LATTE_ART_SHAPES = data;
  return LATTE_ART_SHAPES;
}

// ===== 메뉴 =====
const MENUS_TABLE = "menus";

// 관리자 화면 등에서 새로 만든 메뉴처럼 rating이 없는 경우를 대비한 기본값
const DEFAULT_MENU_RATING = 4.5;

let _menusCache = [];

function normalizeMenuRow(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    price: row.price,
    description: row.description,
    image: row.image,
    soldOut: row.sold_out,
    rating: row.rating,
    latteArtAvailable: row.latte_art_available,
    latteArtVideoUrl: row.latte_art_video_url,
  };
}

async function getAllMenus() {
  const { data, error } = await getSupabaseClient().from(MENUS_TABLE).select("*");
  if (error) {
    console.error("getAllMenus failed:", error);
    return _menusCache;
  }
  _menusCache = data.map(normalizeMenuRow);
  return _menusCache;
}

async function generateMenuId(name) {
  const base = String(name || "menu")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "menu";

  const { data, error } = await getSupabaseClient().from(MENUS_TABLE).select("id");
  const existingIds = error ? [] : data.map((row) => row.id);

  let nextId = base;
  let index = 2;

  while (existingIds.includes(nextId)) {
    nextId = `${base}-${index}`;
    index += 1;
  }

  return nextId;
}

async function createMenu(menuInput) {
  const id = menuInput.id || (await generateMenuId(menuInput.name));
  const row = {
    id,
    category_id: menuInput.categoryId,
    name: menuInput.name,
    price: Number(menuInput.price),
    description: menuInput.description || "",
    image: menuInput.image || "",
    sold_out: Boolean(menuInput.soldOut),
    rating: menuInput.rating ?? null,
    latte_art_available: Boolean(menuInput.latteArtAvailable),
    latte_art_video_url: null,
  };

  const { data, error } = await getSupabaseClient().from(MENUS_TABLE).insert(row).select().single();
  if (error) {
    console.error("createMenu failed:", error);
    return null;
  }

  await getAllMenus();
  return normalizeMenuRow(data);
}

async function updateMenu(menuId, menuInput) {
  const existing = getMenuById(menuId);
  if (!existing) return null;

  const row = {
    category_id: menuInput.categoryId ?? existing.categoryId,
    name: menuInput.name ?? existing.name,
    price: Number(menuInput.price ?? existing.price),
    description: menuInput.description ?? existing.description,
    image: menuInput.image ?? existing.image,
    sold_out: Boolean(menuInput.soldOut),
    latte_art_available: menuInput.latteArtAvailable ?? existing.latteArtAvailable,
    latte_art_video_url:
      menuInput.latteArtVideoUrl !== undefined ? menuInput.latteArtVideoUrl : existing.latteArtVideoUrl,
  };

  const { data, error } = await getSupabaseClient()
    .from(MENUS_TABLE)
    .update(row)
    .eq("id", menuId)
    .select()
    .single();

  if (error) {
    console.error("updateMenu failed:", error);
    return null;
  }

  await getAllMenus();
  return normalizeMenuRow(data);
}

async function deleteMenu(menuId) {
  const { error } = await getSupabaseClient().from(MENUS_TABLE).delete().eq("id", menuId);
  if (error) {
    console.error("deleteMenu failed:", error);
  }
  return getAllMenus();
}

async function toggleMenuSoldOut(menuId) {
  const menu = getMenuById(menuId);
  if (!menu) return null;
  return updateMenu(menuId, { soldOut: !menu.soldOut });
}

// ===== 라떼아트 메뉴 미리보기 영상 (관리자 전용, Storage) =====
const MENU_LATTE_ART_VIDEO_BUCKET = "menu-latte-art-videos";

async function uploadMenuLatteArtVideo(menuId, file) {
  const client = getSupabaseClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  // Storage 키는 한글 등 비-ASCII 문자를 허용하지 않으므로(메뉴 id에 한글이 올 수 있음)
  // 메뉴 id를 파일명에 쓰지 않고 무작위 식별자를 사용한다.
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage
    .from(MENU_LATTE_ART_VIDEO_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    console.error("uploadMenuLatteArtVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(MENU_LATTE_ART_VIDEO_BUCKET).getPublicUrl(filePath);

  const updated = await updateMenu(menuId, { latteArtVideoUrl: urlData.publicUrl });
  if (!updated) {
    console.error("uploadMenuLatteArtVideo db update failed");
    return null;
  }
  return updated;
}

async function deleteMenuLatteArtVideo(menuId) {
  const menu = getMenuById(menuId);
  if (!menu || !menu.latteArtVideoUrl) return null;

  const client = getSupabaseClient();
  const filePath = menu.latteArtVideoUrl.split(`${MENU_LATTE_ART_VIDEO_BUCKET}/`).pop();

  const { error: removeError } = await client.storage
    .from(MENU_LATTE_ART_VIDEO_BUCKET)
    .remove([filePath]);

  if (removeError) {
    console.error("deleteMenuLatteArtVideo storage remove failed:", removeError);
    return null;
  }

  const updated = await updateMenu(menuId, { latteArtVideoUrl: null });
  if (!updated) {
    console.error("deleteMenuLatteArtVideo db update failed (storage file already removed)");
    return null;
  }
  return updated;
}

function getMenuById(menuId) {
  return _menusCache.find((menu) => menu.id === menuId) || null;
}

function getMenusByCategory(categoryId) {
  if (!categoryId || categoryId === "all") {
    return _menusCache;
  }
  return _menusCache.filter((menu) => menu.categoryId === categoryId);
}

// ===== 주문 =====
const ORDER_STATUSES = ["주문접수", "준비중", "완료"];
const ORDERS_TABLE = "orders";
const ORDER_ITEMS_TABLE = "order_items";

function normalizeOrderRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    items: (row.order_items || []).map((item) => ({ menuId: item.menu_id, quantity: item.quantity })),
  };
}

async function getOrders() {
  const { data, error } = await getSupabaseClient()
    .from(ORDERS_TABLE)
    .select("id, created_at, status, order_items(menu_id, quantity)");

  if (error) {
    console.error("getOrders failed:", error);
    return [];
  }
  return data.map(normalizeOrderRow);
}

// 오늘 날짜 + 일련번호 조합으로 주문 ID를 만든다 (예: ORD-20260708-001)
async function generateOrderId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const { data, error } = await getSupabaseClient()
    .from(ORDERS_TABLE)
    .select("id")
    .like("id", `ORD-${datePart}-%`);

  const existingIds = error ? [] : data.map((row) => row.id);

  let sequence = 1;
  let nextId = `ORD-${datePart}-${String(sequence).padStart(3, "0")}`;

  while (existingIds.includes(nextId)) {
    sequence += 1;
    nextId = `ORD-${datePart}-${String(sequence).padStart(3, "0")}`;
  }

  return nextId;
}

// 장바구니 항목({menuId, quantity}[])을 받아 새 주문을 생성하고 저장한다.
async function createOrder(items) {
  const client = getSupabaseClient();
  const id = await generateOrderId();

  const { error: orderError } = await client
    .from(ORDERS_TABLE)
    .insert({ id, status: ORDER_STATUSES[0] });

  if (orderError) {
    console.error("createOrder (orders insert) failed:", orderError);
    return null;
  }

  const itemRows = items.map((item) => ({ order_id: id, menu_id: item.menuId, quantity: item.quantity }));
  const { error: itemsError } = await client.from(ORDER_ITEMS_TABLE).insert(itemRows);

  if (itemsError) {
    console.error("createOrder (order_items insert) failed:", itemsError);
    return null;
  }

  return getOrderById(id);
}

async function getOrderById(orderId) {
  const { data, error } = await getSupabaseClient()
    .from(ORDERS_TABLE)
    .select("id, created_at, status, order_items(menu_id, quantity)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("getOrderById failed:", error);
    return null;
  }
  return data ? normalizeOrderRow(data) : null;
}

function getOrderTotalPrice(order) {
  return order.items.reduce((total, item) => {
    const menu = getMenuById(item.menuId);
    if (!menu) return total;
    return total + menu.price * item.quantity;
  }, 0);
}

function getOrderSummaryText(order) {
  const firstMenu = getMenuById(order.items[0].menuId);
  const firstName = firstMenu ? firstMenu.name : "알 수 없는 메뉴";
  if (order.items.length > 1) {
    return `${firstName} 외 ${order.items.length - 1}건`;
  }
  return firstName;
}

async function updateOrderStatus(orderId, status) {
  const { error } = await getSupabaseClient().from(ORDERS_TABLE).update({ status }).eq("id", orderId);
  if (error) {
    console.error("updateOrderStatus failed:", error);
    return null;
  }
  return getOrderById(orderId);
}
