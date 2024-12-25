// routes/detailsroute.js
// 상세세페이지 라우트 - API 키 전달 추가 20241225 채준병

var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  const javascriptKey = process.env.KAKAO_JAVASCRIPT_KEY;

  if (!javascriptKey) {
    console.error("KAKAO_JAVASCRIPT_KEY가 정의되지 않았습니다.");
    return res.status(500).send("API 키가 누락되었습니다.");
  }

  res.render("pages/details", { javascriptKey }); // JavaScript 키를 템플릿에 전달
});

module.exports = router;