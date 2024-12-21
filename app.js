require("dotenv").config(); //dotenv를 config > firebase.js에서 사용하기 위한 require. "심유정"
const express = require("express");
const path = require("path");
const app = express();

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));
// config 내에 있는 firebase.js에서 export한 app을 사용하기 위한 정적 파일 제공 "심유정"
app.use("/config", express.static(path.join(__dirname, "config")));

//firebase.js로 env의 키값 전달 "심유정"
app.get("/config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  });
});

// 라우트 설정
app.get("/", (req, res) => res.render("pages/home")); // 홈 화면
app.get("/signup", (req, res) => res.render("pages/signup")); // 회원가입 화면
app.get("/details", (req, res) => res.render("pages/details")); // 상세조회 화면
app.get("/mypage", (req, res) => res.render("pages/mypage")); // 마이페이지 화면
app.get("/login", (req, res) => res.render("pages/login")); // 로그인 화면
app.get("/search", (req, res) => res.render("pages/search")); // 검색 결과 화면

module.exports = app;
