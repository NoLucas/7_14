// 로그인 폼은 "아이디"만 입력받으므로, Supabase Auth가 요구하는 이메일 형식으로 내부 변환한다.
const AUTH_EMAIL_DOMAIN = "cafe-moment.local";

function usernameToEmail(username) {
  return `${username}@${AUTH_EMAIL_DOMAIN}`;
}

async function signInWithUsername(username, password) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    console.error("signInWithUsername failed:", error);
    return null;
  }
  return data.session;
}

async function signOutCurrentUser() {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) {
    console.error("signOutCurrentUser failed:", error);
  }
}

// 현재 로그인된 사용자의 프로필(아이디/역할)을 반환. 로그인 안 되어 있으면 null.
async function getCurrentProfile() {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();

  if (!session) return null;

  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("id, username, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile failed:", error);
    return null;
  }
  return data;
}

// 관리자 전용 페이지 가드: admin이 아니면 로그인 페이지로 리다이렉트하고 null 반환.
async function requireAdminOrRedirect(loginPagePath) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    window.location.href = loginPagePath;
    return null;
  }
  return profile;
}
