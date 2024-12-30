import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Firebase 설정 하드코딩
const firebaseConfig = {
  apiKey: "AIzaSyAfGyZZrTil91DY1vvcjSBWs4sEVzCmiTw",
  authDomain: "kosmo-exp-2024.firebaseapp.com",
  databaseURL:
    "https://kosmo-exp-2024-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "256155535167",
  projectId: "kosmo-exp-2024",
  storageBucket: "kosmo-exp-2024.firebasestorage.app",
  appId: "1:256155535167:web:85958fee516b7c745df58a",
};

// Firebase 앱 초기화
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(async () => {
      console.log("Kakao 객체:", kakao);

      // Firebase 초기화
      const app = initializeApp(firebaseConfig); // Firebase 앱 초기화
      const storage = getStorage(app); // Firebase Storage 초기화

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 5,
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);
      console.log("검색 페이지 지도 초기화 완료");

      // 마커 이미지 설정
      const imageSrc = "/images/Map_pin.png"; // 사용자 정의 마커 이미지 경로
      const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
      const imageOption = { offset: new kakao.maps.Point(20, 40) }; // 중심 좌표

      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );
      const geocoder = new kakao.maps.services.Geocoder(); // Kakao Geocoder 초기화

      // 기존 마커들을 저장할 배열
      let markers = [];
      let infoWindow = null; // 기존 정보 창을 관리할 변수

      // 콤보박스 선택 이벤트 처리
      const regionSelect = document.getElementById("regionSelect");
      const categorySelect = document.getElementById("categorySelect");

      // 콤보박스 값이 변경될 때마다 데이터 불러오기
      regionSelect.addEventListener("change", loadData);
      categorySelect.addEventListener("change", loadData);

      // 데이터 로드 함수
      async function loadData() {
        // 기존 마커들을 지도에서 제거
        markers.forEach((marker) => {
          marker.setMap(null);
        });
        markers = []; // 마커 배열 초기화

        const selectedRegion = regionSelect.value;
        const selectedCategory = categorySelect.value;
        const fileName = `${selectedRegion}_${selectedCategory}.json`; // 선택한 지역 및 카테고리 기반 파일명 생성

        try {
          // Firebase Storage에서 JSON 파일 다운로드
          const jsonRef = ref(storage, fileName); // Firebase Storage의 경로
          const url = await getDownloadURL(jsonRef); // URL을 가져옵니다
          const response = await fetch(url);
          if (!response.ok) throw new Error("JSON 파일 로드 실패");
          const data = await response.json();

          // 선택된 카테고리 데이터 처리
          const restaurants = data[selectedCategory];

          // 지도에 마커 추가
          restaurants.forEach((entry) => {
            const address = entry.주소.split("지번")[0].trim(); // 주소 전처리

            geocoder.addressSearch(address, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                const marker = new kakao.maps.Marker({
                  position: coords,
                  map,
                  title: entry.이름,
                  image: markerImage, // 커스텀 이미지 적용
                });

                // 마커를 배열에 추가
                markers.push(marker);

                console.log(
                  `JSON 마커 추가됨: ${entry.RID} ${entry.이름} (${result[0].y}, ${result[0].x})`
                );

                // 정보 창 추가
                const newInfoWindow = new kakao.maps.InfoWindow({
                  content: `<div style="padding:5px;">${entry.이름}</div>`,
                });

                kakao.maps.event.addListener(marker, "click", () => {
                  // 기존 정보 창 닫기
                  if (infoWindow) {
                    infoWindow.close();
                  }
                  // 새로운 정보 창 열기
                  newInfoWindow.open(map, marker);
                  infoWindow = newInfoWindow; // 새로운 정보 창 설정
                });
              } else {
                console.error(`주소 변환 실패: ${address}`);
              }
            });
          });
        } catch (error) {
          console.error(
            "Firebase Storage 또는 JSON 데이터 처리 중 오류:",
            error
          );
        }
      }

      // 처음 로드 시 데이터 불러오기
      loadData();
    });
  } else {
    console.error(
      "Kakao 객체를 초기화할 수 없습니다. 스크립트 로드에 실패했습니다."
    );
  }
});
