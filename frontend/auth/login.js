// 로그인 폼과 안내 메시지 영역을 가져온다.
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// DB 연결 전, 화면 동작 확인용으로 미리 만들어둔 임시 테스트 계정
const DEMO_ACCOUNTS = [
  { userId: "admin", password: "admin1234", redirectTo: "../admin/index.html" },
  { userId: "customer", password: "customer1234", redirectTo: "../index.html" },
];

// 로그인 버튼(폼 제출)을 눌렀을 때 실행되는 함수
loginForm.addEventListener("submit", (event) => {
  // 폼의 기본 동작(페이지 새로고침)을 막는다.
  event.preventDefault();

  const formData = new FormData(loginForm);
  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("password") || "");

  const account = DEMO_ACCOUNTS.find(
    (item) => item.userId === userId && item.password === password
  );

  if (!account) {
    message.textContent = "아이디 또는 비밀번호가 일치하지 않습니다. (테스트 계정을 확인해주세요)";
    return;
  }

  message.textContent = "로그인되었습니다. 이동합니다...";
  window.location.href = account.redirectTo;
});
