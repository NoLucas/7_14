// ===== 카테고리 =====
const CATEGORIES = [
  { id: "coffee", name: "커피" },
  { id: "tea", name: "티" },
  { id: "ade", name: "에이드" },
  { id: "dessert", name: "디저트" },
];

// ===== 메뉴 =====
const MENUS = [
  {
    id: "americano",
    categoryId: "coffee",
    name: "아메리카노",
    price: 4500,
    description: "깔끔하고 깊은 풍미의 에스프레소 베이스 커피",
    image: "",
    soldOut: false,
  },
  {
    id: "latte",
    categoryId: "coffee",
    name: "카페라떼",
    price: 5000,
    description: "부드러운 우유와 에스프레소의 조화",
    image: "",
    soldOut: false,
  },
  {
    id: "cappuccino",
    categoryId: "coffee",
    name: "카푸치노",
    price: 5000,
    description: "풍성한 우유 거품이 매력적인 커피",
    image: "",
    soldOut: false,
  },
  {
    id: "vanilla-latte",
    categoryId: "coffee",
    name: "바닐라라떼",
    price: 5500,
    description: "달콤한 바닐라 시럽을 더한 라떼",
    image: "",
    soldOut: false,
  },
  {
    id: "earl-grey",
    categoryId: "tea",
    name: "얼그레이",
    price: 4800,
    description: "은은한 베르가못 향의 홍차",
    image: "",
    soldOut: false,
  },
  {
    id: "peppermint",
    categoryId: "tea",
    name: "페퍼민트",
    price: 4800,
    description: "상쾌한 향의 허브티",
    image: "",
    soldOut: false,
  },
  {
    id: "lemon-ade",
    categoryId: "ade",
    name: "레몬에이드",
    price: 5500,
    description: "상큼한 레몬으로 만든 탄산 에이드",
    image: "",
    soldOut: false,
  },
  {
    id: "grapefruit-ade",
    categoryId: "ade",
    name: "자몽에이드",
    price: 5800,
    description: "새콤달콤한 자몽 과육이 가득한 에이드",
    image: "",
    soldOut: false,
  },
  {
    id: "cheesecake",
    categoryId: "dessert",
    name: "치즈케이크",
    price: 6500,
    description: "진한 크림치즈의 부드러운 케이크",
    image: "",
    soldOut: false,
  },
  {
    id: "croissant",
    categoryId: "dessert",
    name: "크루아상",
    price: 4200,
    description: "겹겹이 바삭한 버터 크루아상",
    image: "",
    soldOut: false,
  },
];

function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId) || null;
}

function getMenuById(menuId) {
  return MENUS.find((menu) => menu.id === menuId) || null;
}

function getMenusByCategory(categoryId) {
  if (!categoryId || categoryId === "all") {
    return MENUS;
  }
  return MENUS.filter((menu) => menu.categoryId === categoryId);
}
