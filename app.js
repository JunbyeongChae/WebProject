require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

// 라우터 불러오기
const apiKeysRouter = require("./config/apiKeys");
const mypageRouter = require("./routes/mypageroute");
const authRouter = require("./routes/authroute");
const searchRouter = require("./routes/searchroute");
const detailsRouter = require("./routes/detailsroute");

const app = express();

// CORS 설정
// 모든 출처 허용 (개발 환경)
app.use(cors());

// 동적 CORS 설정 (필요 시 사용)
// const allowedOrigins = ['http://localhost:4000', 'http://localhost:3000'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// }));

// JSON 요청 본문 파싱
app.use(express.json());

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

/* // 기본 라우트
app.get('/api/data', (req, res) => {
  res.send('서버가 정상적으로 실행 중입니다.');
});
 */
// API 키 관련 라우터 설정
app.use("/config", apiKeysRouter);

// 추가 라우터 연결
app.use("/", authRouter); // auth.js 연결
app.use("/mypage", mypageRouter); // mypageroute.js 연결
app.use("/search", searchRouter); // /search 경로
app.use("/details", detailsRouter); // /details 경로

/* // 서버 실행
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 */
module.exports = app;
