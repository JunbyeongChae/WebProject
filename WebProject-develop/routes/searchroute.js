// routes/searchroute.js
// 검색색페이지 라우트 - API 키 전달 추가 20241225 채준병

var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  const javascriptKey = process.env.KAKAO_JAVASCRIPT_KEY;
  if (!javascriptKey) {
    return res.status(500).send("API 키가 누락되었습니다.");
  }
  res.render("pages/search", { javascriptKey }); // JavaScript 키를 템플릿에 전달
});

module.exports = router;