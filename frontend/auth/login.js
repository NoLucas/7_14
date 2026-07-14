// 로그인 폼과 안내 메시지 영역을 가져온다.
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// 로그인 버튼(폼 제출)을 눌렀을 때 실행되는 함수
loginForm.addEventListener("submit", async (event) => {
  // 폼의 기본 동작(페이지 새로고침)을 막는다.
  event.preventDefault();

  const formData = new FormData(loginForm);
  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("password") || "");

  const session = await signInWithUsername(userId, password);

  if (!session) {
    message.textContent = "아이디 또는 비밀번호가 일치하지 않습니다. (테스트 계정을 확인해주세요)";
    return;
  }

  const profile = await getCurrentProfile();
  const params = new URLSearchParams(window.location.search);
  const redirectParam = params.get("redirect");
  const redirectTo = redirectParam || (profile && profile.role === "admin" ? "../admin/" : "../index.html");

  message.textContent = "로그인되었습니다. 이동합니다...";
  window.location.href = redirectTo;
});
