// controllers/authController.js

// Firebase Auth 로직 제거, 가짜 인증 로직으로 대체 혹은 에러/빈 처리

async function createUserWithEmail(email, password, username) {
  // 실제 DB 연동 없이 바로 성공 또는 에러를 반환하는 가짜 로직
  return { uid: 'dummy_uid', email, username };
}

async function signInWithEmail(email, password) {
  // 실제 로그인 로직 없이 가짜 사용자 반환
  if (email === 'test@example.com' && password === 'password') {
    return { uid: 'dummy_uid', email, username: '테스트사용자' };
  }
  throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
}

async function signInWithGoogle(googleAuthCode) {
  // 구글 로그인 로직 제거, 가짜 사용자 반환
  return { uid: 'dummy_google_uid', email: 'googleuser@example.com', username: 'GoogleUser' };
}

module.exports = {
  createUserWithEmail,
  signInWithEmail,
  signInWithGoogle
};
