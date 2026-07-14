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

// 라떼아트 모양 마스터 데이터에 실제 사진/영상을 채워 넣는다 (관리자 전용).
// 사진/영상 중 나중에 올린 것으로 대체되며(하나만 유지), 없으면 emoji로 대체 표시된다.
const LATTE_ART_SHAPE_MEDIA_BUCKET = "latte-art-shape-media";

async function updateLatteArtShapeMedia(shapeId, file) {
  const client = getSupabaseClient();
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    console.error("updateLatteArtShapeMedia: 지원하지 않는 파일 형식입니다.");
    return null;
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : isImage ? "png" : "mp4";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage.from(LATTE_ART_SHAPE_MEDIA_BUCKET).upload(filePath, file);
  if (uploadError) {
    console.error("updateLatteArtShapeMedia upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(LATTE_ART_SHAPE_MEDIA_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(LATTE_ART_SHAPES_TABLE)
    .update({
      image_url: isImage ? urlData.publicUrl : null,
      video_url: isVideo ? urlData.publicUrl : null,
    })
    .eq("id", shapeId)
    .select()
    .single();

  if (error) {
    console.error("updateLatteArtShapeMedia db update failed:", error);
    return null;
  }

  await getLatteArtShapes();
  return data;
}

async function deleteLatteArtShapeMedia(shapeId) {
  const client = getSupabaseClient();
  const shape = LATTE_ART_SHAPES.find((row) => row.id === shapeId);
  const mediaUrl = shape && (shape.video_url || shape.image_url);
  if (!mediaUrl) return null;

  const filePath = mediaUrl.split(`${LATTE_ART_SHAPE_MEDIA_BUCKET}/`).pop();
  const { error: removeError } = await client.storage.from(LATTE_ART_SHAPE_MEDIA_BUCKET).remove([filePath]);
  if (removeError) {
    console.error("deleteLatteArtShapeMedia storage remove failed:", removeError);
    return null;
  }

  const { data, error } = await client
    .from(LATTE_ART_SHAPES_TABLE)
    .update({ image_url: null, video_url: null })
    .eq("id", shapeId)
    .select()
    .single();

  if (error) {
    console.error("deleteLatteArtShapeMedia db update failed (storage file already removed):", error);
    return null;
  }

  await getLatteArtShapes();
  return data;
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

// ===== 라떼아트 메뉴 미리보기 영상 (메뉴당 여러 개, 관리자 전용 업로드/삭제) =====
const MENU_LATTE_ART_VIDEO_BUCKET = "menu-latte-art-videos";
const MENU_LATTE_ART_VIDEOS_TABLE = "menu_latte_art_videos";

async function getMenuLatteArtVideos(menuId) {
  const { data, error } = await getSupabaseClient()
    .from(MENU_LATTE_ART_VIDEOS_TABLE)
    .select("*")
    .eq("menu_id", menuId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMenuLatteArtVideos failed:", error);
    return [];
  }
  return data;
}

async function addMenuLatteArtVideo(menuId, file) {
  const client = getSupabaseClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  // Storage 키는 한글 등 비-ASCII 문자를 허용하지 않으므로(메뉴 id에 한글이 올 수 있음) 무작위 파일명을 쓴다.
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage
    .from(MENU_LATTE_ART_VIDEO_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    console.error("addMenuLatteArtVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(MENU_LATTE_ART_VIDEO_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(MENU_LATTE_ART_VIDEOS_TABLE)
    .insert({ menu_id: menuId, video_url: urlData.publicUrl })
    .select()
    .single();

  if (error) {
    console.error("addMenuLatteArtVideo db insert failed:", error);
    return null;
  }
  return data;
}

async function deleteMenuLatteArtVideoById(videoId) {
  const client = getSupabaseClient();

  const { data: video, error: fetchError } = await client
    .from(MENU_LATTE_ART_VIDEOS_TABLE)
    .select("video_url")
    .eq("id", videoId)
    .maybeSingle();

  if (fetchError || !video) {
    console.error("deleteMenuLatteArtVideoById lookup failed:", fetchError);
    return false;
  }

  const filePath = video.video_url.split(`${MENU_LATTE_ART_VIDEO_BUCKET}/`).pop();
  const { error: removeError } = await client.storage.from(MENU_LATTE_ART_VIDEO_BUCKET).remove([filePath]);

  if (removeError) {
    console.error("deleteMenuLatteArtVideoById storage remove failed:", removeError);
    return false;
  }

  const { error: deleteError } = await client.from(MENU_LATTE_ART_VIDEOS_TABLE).delete().eq("id", videoId);
  if (deleteError) {
    console.error("deleteMenuLatteArtVideoById db delete failed (storage file already removed):", deleteError);
    return false;
  }
  return true;
}

// ===== 홈페이지 라떼아트 갤러리 (고정 4슬롯, 관리자 전용 업로드/삭제) =====
const HOME_GALLERY_VIDEO_BUCKET = "home-gallery-videos";
const HOME_GALLERY_VIDEOS_TABLE = "home_gallery_videos";

async function getHomeGalleryVideos() {
  const { data, error } = await getSupabaseClient()
    .from(HOME_GALLERY_VIDEOS_TABLE)
    .select("*")
    .order("slot", { ascending: true });

  if (error) {
    console.error("getHomeGalleryVideos failed:", error);
    return [];
  }
  return data;
}

async function updateHomeGalleryVideo(slot, file) {
  const client = getSupabaseClient();

  const slots = await getHomeGalleryVideos();
  const existing = slots.find((row) => row.slot === slot);
  if (existing && existing.video_url) {
    const oldPath = existing.video_url.split(`${HOME_GALLERY_VIDEO_BUCKET}/`).pop();
    await client.storage.from(HOME_GALLERY_VIDEO_BUCKET).remove([oldPath]);
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage.from(HOME_GALLERY_VIDEO_BUCKET).upload(filePath, file);
  if (uploadError) {
    console.error("updateHomeGalleryVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(HOME_GALLERY_VIDEO_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(HOME_GALLERY_VIDEOS_TABLE)
    .update({ video_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("slot", slot)
    .select()
    .single();

  if (error) {
    console.error("updateHomeGalleryVideo db update failed:", error);
    return null;
  }
  return data;
}

async function deleteHomeGalleryVideo(slot) {
  const client = getSupabaseClient();

  const slots = await getHomeGalleryVideos();
  const existing = slots.find((row) => row.slot === slot);
  if (!existing || !existing.video_url) return null;

  const filePath = existing.video_url.split(`${HOME_GALLERY_VIDEO_BUCKET}/`).pop();
  const { error: removeError } = await client.storage.from(HOME_GALLERY_VIDEO_BUCKET).remove([filePath]);
  if (removeError) {
    console.error("deleteHomeGalleryVideo storage remove failed:", removeError);
    return null;
  }

  const { data, error } = await client
    .from(HOME_GALLERY_VIDEOS_TABLE)
    .update({ video_url: null, updated_at: new Date().toISOString() })
    .eq("slot", slot)
    .select()
    .single();

  if (error) {
    console.error("deleteHomeGalleryVideo db update failed (storage file already removed):", error);
    return null;
  }
  return data;
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
    paymentMethod: row.payment_method,
    items: (row.order_items || []).map((item) => ({
      id: item.id,
      menuId: item.menu_id,
      quantity: item.quantity,
      latteArtShape: item.latte_art_shape,
      latteArtNote: item.latte_art_note,
      latteArtVideoUrl: item.latte_art_video_url,
      latteArtVideoUploadedAt: item.latte_art_video_uploaded_at,
    })),
  };
}

const ORDER_SELECT_COLUMNS =
  "id, created_at, status, payment_method, order_items(id, menu_id, quantity, latte_art_shape, latte_art_note, latte_art_video_url, latte_art_video_uploaded_at)";

async function getOrders() {
  const { data, error } = await getSupabaseClient().from(ORDERS_TABLE).select(ORDER_SELECT_COLUMNS);

  if (error) {
    console.error("getOrders failed:", error);
    return [];
  }
  return data.map(normalizeOrderRow);
}

// 장바구니 항목({menuId, quantity, latteArtShape?, latteArtNote?}[])과 결제방법을 받아 새 주문을 생성하고 저장한다.
// 주문 ID는 RPC(generate_order_id)로 생성한다 — 본인 주문만 조회 가능하도록 RLS를 강화했기 때문에,
// 클라이언트가 직접 기존 주문 목록을 조회해 중복을 피하는 방식은 더 이상 신뢰할 수 없다.
async function createOrder(items, paymentMethod) {
  const client = getSupabaseClient();

  const { data: id, error: idError } = await client.rpc("generate_order_id");
  if (idError || !id) {
    console.error("createOrder (generate_order_id) failed:", idError);
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();
  const userId = session ? session.user.id : null;

  const { error: orderError } = await client
    .from(ORDERS_TABLE)
    .insert({ id, status: ORDER_STATUSES[0], payment_method: paymentMethod, user_id: userId });

  if (orderError) {
    console.error("createOrder (orders insert) failed:", orderError);
    return null;
  }

  const itemRows = items.map((item) => ({
    order_id: id,
    menu_id: item.menuId,
    quantity: item.quantity,
    latte_art_shape: item.latteArtShape ?? null,
    latte_art_note: item.latteArtNote ?? null,
  }));
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
    .select(ORDER_SELECT_COLUMNS)
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

// ===== 주문 항목별 라떼아트 영상 (관리자 전용, 카페라떼 잔 단위 개인 맞춤 영상) =====
// 메뉴/홈페이지 관리에서 쓰는 라떼아트 관련 테이블과는 별개의, 주문 건별 데이터다.
const ORDER_LATTE_ART_VIDEO_BUCKET = "order-latte-art-videos";

async function uploadOrderItemLatteArtVideo(orderItemId, file) {
  const client = getSupabaseClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await client.storage.from(ORDER_LATTE_ART_VIDEO_BUCKET).upload(filePath, file);
  if (uploadError) {
    console.error("uploadOrderItemLatteArtVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(ORDER_LATTE_ART_VIDEO_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(ORDER_ITEMS_TABLE)
    .update({
      latte_art_video_url: urlData.publicUrl,
      latte_art_video_uploaded_at: new Date().toISOString(),
    })
    .eq("id", orderItemId)
    .select()
    .single();

  if (error) {
    console.error("uploadOrderItemLatteArtVideo db update failed:", error);
    return null;
  }
  return data;
}
