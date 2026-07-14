// 관리자 페이지 왼쪽 가장자리 사이드 네비게이션.
// 호버(데스크톱) / 클릭·탭(터치) / 포커스(키보드)로 열리고, 바깥 클릭 시 닫힌다.
(function () {
  const scriptEl = document.currentScript;
  const depth = (scriptEl.getAttribute("src").match(/\.\.\//g) || []).length;
  const adminRoot = depth >= 2 ? "../" : "./";

  const links = [
    { href: `${adminRoot}menus/list.html`, icon: "🍰", label: "메뉴 관리" },
    { href: `${adminRoot}orders/list.html`, icon: "🧾", label: "주문 관리" },
    { href: `${adminRoot}home/list.html`, icon: "🏠", label: "홈페이지 관리" },
  ];

  // 현재 페이지와 같은 하위 폴더(menus/orders/home)로 가는 링크를 강조 표시한다.
  const currentSection = window.location.pathname.split("/").filter(Boolean).slice(-2, -1)[0];

  const wrapper = document.createElement("div");
  wrapper.className = "admin-side-nav";
  wrapper.innerHTML = `
    <button type="button" class="admin-side-nav-tab" aria-label="관리자 메뉴 열기" aria-expanded="false">☰ Admin</button>
    <nav class="admin-side-nav-panel" aria-label="관리자 메뉴">
      <p class="admin-side-nav-title">Admin Menu</p>
      ${links
        .map((link) => {
          const section = link.href.split("/").filter(Boolean).slice(-2, -1)[0];
          return `<a href="${link.href}"${section === currentSection ? ' class="is-current"' : ""}>${link.icon} ${link.label}</a>`;
        })
        .join("")}
    </nav>
  `;
  document.body.prepend(wrapper);

  const tab = wrapper.querySelector(".admin-side-nav-tab");
  tab.addEventListener("click", () => {
    const isOpen = wrapper.classList.toggle("is-open");
    tab.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      wrapper.classList.remove("is-open");
      tab.setAttribute("aria-expanded", "false");
    }
  });
})();
