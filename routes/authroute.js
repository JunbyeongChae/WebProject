// routes/auth.js

//2024-12-19 이희범
var express = require("express");
var router = express.Router();

/* GET users listing. */

// Arrow function으로 수정 - 20241225 채준병
/* 홈 화면 */
router.get("/", (req, res, next) => {
  res.render("pages/home");
});

/* 회원가입 화면 */
router.get("/signup", (req, res, next) => {
  res.render("pages/signup");
});

/* 로그인 화면 */
router.get("/login", (req, res, next) => {
  res.render("pages/login");
});

module.exports = router;


