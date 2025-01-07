const express = require("express");
const { getStorage, ref, listAll, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const { firebase } = require("../config/apiKeys"); // apiKeys에서 firebase 설정을 가져옵니다.
const router = express.Router();

// Firebase 설정을 로드할 때, 설정이 제대로 불러와졌는지 확인
console.log('Firebase Config:', firebase); // 로그로 Firebase 설정값 확인

// Firebase 설정으로 앱 초기화
const app = initializeApp(firebase);
const storage = getStorage(app);

router.get("/search", async (req, res) => {
  try {
    const storageRef = ref(storage, "/"); // 최상단 디렉토리
    const result = await listAll(storageRef); // 모든 파일 가져오기

    // .json 파일만 필터링
    const jsonFiles = result.items.filter(item => item.name.endsWith(".json"));

    const results = [];
    for (const jsonFile of jsonFiles) {
      const url = await getDownloadURL(jsonFile); // 파일 URL 가져오기
      const response = await fetch(url); // JSON 파일 로드
      const data = await response.json(); // JSON 파싱

      const restaurantData = data.restaurants || [];
      results.push(...restaurantData); // 결과 배열에 추가
    }

    // 'results'를 EJS 템플릿에 전달
    res.render("pages/search", { results });
  } catch (error) {
    console.error("Firebase에서 데이터를 가져오는 데 실패했습니다:", error);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
});

module.exports = router;
