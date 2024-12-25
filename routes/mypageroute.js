// routes/mypageroute.js
// 마이페이지 라우트 - API 키 전달 추가 20241225 채준병

var express = require("express");
var router = express.Router();

/* 마이페이지 화면 */
router.get("/", (req, res) => { // "/mypage" 경로 처리
  const javascriptKey = process.env.KAKAO_JAVASCRIPT_KEY; // JavaScript 키 가져오기

  if (!javascriptKey) {
    console.error("KAKAO_JAVASCRIPT_KEY가 정의되지 않았습니다.");
    return res.status(500).send("API 키가 누락되었습니다.");
  }
  res.render("pages/mypage", { javascriptKey }); // 클라이언트 템플릿에 전달
});

module.exports = router;