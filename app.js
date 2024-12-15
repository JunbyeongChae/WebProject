require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const searchRouter = require("./routes/search");
const detailsRouter = require("./routes/details");
const favoritesRouter = require("./routes/favorites");

const PORT = parseInt(process.env.PORT || 4000, 10);

// 뷰 엔진 및 뷰 디렉토리 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));

// 요청 바디 파싱
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// 라우트 등록
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/details", detailsRouter);
app.use("/favorites", favoritesRouter);

// 에러 핸들러
app.use((req, res, next) => {
  res
    .status(404)
    .render("pages/error", { message: "페이지를 찾을 수 없습니다." });
});

app.use((err, req, res, next) => {
  console.error(`[Error]: ${err.message}`);
  res.status(err.status || 500).render("pages/error", {
    message:
      process.env.NODE_ENV === "production"
        ? "서버 에러가 발생했습니다."
        : err.message,
  });
});

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is in use. Trying another port...`);
    const newPort = PORT + 1;
    app.listen(newPort, () => {
      console.log(`Server is running on http://localhost:${newPort}`);
    });
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});

module.exports = app;
