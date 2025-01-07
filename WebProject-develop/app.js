require("dotenv").config();
const express = require("express");
const path = require("path");
const apiKeysRouter = require("./config/apiKeys"); // 라우터 불러오기
const mypageRouter = require("./routes/mypageroute"); // mypageroute.js 불러오기
const authRouter = require("./routes/authroute"); // auth.js 추가
const searchRouter = require("./routes/searchroute"); // 검색 라우트
const detailsRouter = require("./routes/detailsroute"); // 상세보기 라우트

const app = express();
const cors = require("cors");

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// API 키 관련 라우터 설정
app.use("/config", apiKeysRouter);

app.use(cors());

// 라우터파일 연결로 수정 - 20241225 채준병
app.use("/", authRouter); // auth.js 연결
app.use("/mypage", mypageRouter);// mypageroute.js 연결
app.use("/search", searchRouter); // /search 경로
app.use("/details", detailsRouter); // /details 경로

module.exports = app;