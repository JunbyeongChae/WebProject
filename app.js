require("dotenv").config();
const express = require("express");
const path = require("path");
const apiKeysRouter = require("./config/apiKeys"); // 라우터 불러오기

const app = express();

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// API 키 관련 라우터 설정
app.use("/config", apiKeysRouter);

// 라우트 설정
app.get("/", (req, res) => res.render("pages/home")); // 홈 화면
app.get("/signup", (req, res) => res.render("pages/signup")); // 회원가입 화면
/* app.get("/details", (req, res) => res.render("pages/details")); // 상세조회 화면 */
/* app.get("/mypage", (req, res) => res.render("pages/mypage")); // 마이페이지 화면 */
app.get("/login", (req, res) => res.render("pages/login")); // 로그인 화면
/* app.get("/search", (req, res) => res.render("pages/search")); // 검색 결과 화면 */

/* 241224 박제성 카카오 인증을위한 라우터 처리 */
/* 기존 라우트 문구 주석 처리  */
// 마이페이지 라우트
app.get("/mypage", (req, res) => {
  res.render("pages/mypage", { kakaoApiKey: process.env.KAKAO_API_KEY });
});
// 검색 페이지 라우트
app.get("/search", (req, res) => {
  res.render("pages/search", { kakaoApiKey: process.env.KAKAO_API_KEY });
});
// 상세보기 페이지 라우트
app.get("/details", (req, res) => {
  res.render("pages/details", { kakaoApiKey: process.env.KAKAO_API_KEY });
});
/* 241224 카카오 인증을위한 라우터 처리 부분 끝*/

module.exports = app;
