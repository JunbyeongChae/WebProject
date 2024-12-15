const express = require('express');
const router = express.Router();
const { createUserWithEmail, signInWithEmail, signInWithGoogle } = require('../controllers/authController');

// 로그인 페이지
router.get('/login', (req, res) => {
  // 이미 로그인 상태라면 홈으로 리다이렉트
  if (req.session.user) {
    return res.redirect('/');
  }

  // 에러나 성공 메시지가 있을 경우 전달 가능
  const errorMessage = req.session.errorMessage || null;
  const successMessage = req.session.successMessage || null;
  delete req.session.errorMessage;
  delete req.session.successMessage;

  res.render('pages/login', {
    user: null,
    errorMessage: errorMessage,
    successMessage: successMessage
  });
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await signInWithEmail(email, password);
    // 로그인 성공 시 세션에 사용자 정보 저장
    req.session.user = { uid: user.uid, email: user.email, username: user.username };
    res.redirect('/');
  } catch (error) {
    console.error('로그인 실패:', error);
    req.session.errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
    res.redirect('/auth/login');
  }
});

// 회원가입 페이지
router.get('/signup', (req, res) => {
  // 이미 로그인 상태라면 홈으로 리다이렉트
  if (req.session.user) {
    return res.redirect('/');
  }

  // 에러나 성공 메시지가 있을 경우 전달 가능
  const errorMessage = req.session.errorMessage || null;
  const successMessage = req.session.successMessage || null;
  delete req.session.errorMessage;
  delete req.session.successMessage;

  res.render('pages/signup', {
    user: null,
    errorMessage: errorMessage,
    successMessage: successMessage
  });
});

// 회원가입 처리
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const newUser = await createUserWithEmail(email, password, username);
    req.session.successMessage = '회원가입에 성공했습니다. 로그인해주세요.';
    res.redirect('/auth/login');
  } catch (error) {
    console.error('회원가입 실패:', error);
    req.session.errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
    res.redirect('/auth/signup');
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 중 오류 발생:', err);
    }
    res.redirect('/');
  });
});

// 구글 소셜 로그인
router.get('/google', (req, res) => {
  // 구글 OAuth 로그인 페이지로 리다이렉트하는 로직 필요
  // OAuth2 클라이언트 사용 예: passport.js 또는 google-auth-library 등
  // 여기서는 예시로 '/auth/google/callback'으로 바로 리다이렉트한다고 가정
  res.redirect('/auth/google/callback');
});

router.get('/google/callback', async (req, res) => {
  try {
    // 구글 OAuth2 인증 완료 후 user 정보 획득 로직
    const user = await signInWithGoogle(req.query.code);
    req.session.user = { uid: user.uid, email: user.email, username: user.username };
    res.redirect('/');
  } catch (error) {
    console.error('구글 로그인 실패:', error);
    req.session.errorMessage = '구글 로그인에 실패했습니다. 다시 시도해주세요.';
    res.redirect('/auth/login');
  }
});

module.exports = router;
