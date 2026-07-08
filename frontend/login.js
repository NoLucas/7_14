// 로그인 폼과 안내 메시지 영역을 가져온다.
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// 로그인 버튼(폼 제출)을 눌렀을 때 실행되는 함수
loginForm.addEventListener("submit", (event) => {
  // 폼의 기본 동작(페이지 새로고침)을 막는다.
  event.preventDefault();

  // 아직 백엔드(DB)가 연결되지 않았으므로 실제 로그인 처리는 하지 않고
  // 화면 동작만 확인할 수 있도록 안내 메시지만 보여준다.
  message.textContent = "현재는 DB 연결 전 테스트 로그인입니다.";
});
