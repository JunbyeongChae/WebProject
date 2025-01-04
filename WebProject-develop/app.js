const express = require("express");
const path = require("path");
const app = express();

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 라우트 설정
app.get("/", (req, res) => res.render("pages/home")); // 홈 화면
app.get("/signup", (req, res) => res.render("pages/signup")); // 회원가입 화면
app.get("/details", (req, res) => res.render("pages/details")); // 상세조회 화면
app.get("/mypage", (req, res) => res.render("pages/mypage")); // 마이페이지 화면
app.get("/login", (req, res) => res.render("pages/login")); // 로그인 화면
app.get("/search", (req, res) => res.render("pages/search")); // 검색 결과 화면

module.exports = app;
