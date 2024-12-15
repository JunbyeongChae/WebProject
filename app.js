require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const searchRouter = require('./routes/search');
const detailsRouter = require('./routes/details');
const favoritesRouter = require('./routes/favorites');

const PORT = process.env.PORT || 3000;

// 뷰 엔진 및 뷰 디렉토리 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 요청 바디 파싱
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Firebase 관련 설정 제거

// 라우트 등록
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);
app.use('/details', detailsRouter);
app.use('/favorites', favoritesRouter);

// 에러 핸들러
app.use((req, res, next) => {
  res.status(404).render('pages/error', { message: '페이지를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/error', { message: '서버 에러가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;