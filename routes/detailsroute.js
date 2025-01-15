// routes/detailsroute.js
// 상세세페이지 라우트 - API 키 전달 추가 20241225 채준병
// 검색클릭시 - RID, region, category 주소로 이동하도록 변경 20250113 박제성

var express = require("express");
var router = express.Router();

router.get("/:RID", (req, res) => {
  const javascriptKey = process.env.KAKAO_JAVASCRIPT_KEY;
  const { RID } = req.params;
  const { region, category } = req.query; // region, category 쿼리 파라미터 가져오기

  if (!javascriptKey) {
    return res.status(500).send("API 키가 누락되었습니다.");
  }

  if (!RID) {
    return res.status(400).send("RID가 없습니다.");
  }

  // RID, region, category 값이 있을 때 처리하는 코드
  res.render("pages/details", {
    javascriptKey,
    RID,
    region, // region 쿼리 파라미터 전달
    category, // category 쿼리 파라미터 전달
  });
});

module.exports = router;
