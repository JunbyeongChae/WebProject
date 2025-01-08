import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(async () => {
      console.log("Kakao 객체:", kakao);

      // Firebase 설정 가져오기
      const response = await fetch("/config");
      if (!response.ok) {
        console.error("Firebase 설정을 가져오지 못했습니다.");
        return;
      }
      const configData = await response.json();
      const firebaseConfig = configData.firebase;
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);

      // Kakao 지도 초기화
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(37.476823, 126.879512),
        level: 7,
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);
      console.log("검색 페이지 지도 초기화 완료");

      // Kakao 지도 마커 이미지
      const markerImage = new kakao.maps.MarkerImage(
        "/images/Map_pin.png",
        new kakao.maps.Size(40, 40),
        { offset: new kakao.maps.Point(20, 40) }
      );

      const geocoder = new kakao.maps.services.Geocoder();
      let markers = [];
      let infoWindow = null;

      // UI 요소
      const regionSelect = document.getElementById("regionSelect");
      const categorySelect = document.getElementById("categorySelect");
      const searchInput = document.querySelector(".form-control[placeholder='음식점을 검색하세요']");
      const searchResultsContainer = document.querySelector(".border.p-2.rounded");

      regionSelect.addEventListener("change", loadData);
      categorySelect.addEventListener("change", loadData);
      searchInput.addEventListener("input", loadData);

      async function loadData() {
        // 기존 마커 초기화
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        const selectedRegion = regionSelect.value;
        const selectedCategory = categorySelect.value;
        const searchQuery = searchInput.value.toLowerCase();
        const fileName = `${selectedRegion}_${selectedCategory}.json`;  // 해당 지역 및 카테고리에 맞는 파일명

        try {
          // Firebase Storage에서 JSON 파일 URL 가져오기
          const jsonRef = ref(storage, fileName); // 파일명 경로 수정
          const url = await getDownloadURL(jsonRef);
          console.log("생성된 JSON URL:", url);

          const response = await fetch(url);
          if (!response.ok) throw new Error("JSON 파일 로드 실패");

          const data = await response.json();
          const restaurants = data[selectedCategory] || [];

          // 검색 결과 필터링
          const filteredResults = restaurants.filter((entry) =>
            entry.이름.toLowerCase().includes(searchQuery)
          );

          searchResultsContainer.innerHTML = ""; // 기존 결과 초기화

          const coordsArray = [];
          filteredResults.forEach((entry) => {
            const address = entry.주소.split("지번")[0].trim();

            geocoder.addressSearch(address, (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                // 지도에 마커 추가
                const marker = new kakao.maps.Marker({
                  position: coords,
                  map,
                  title: entry.이름,
                  image: markerImage,
                });

                markers.push(marker);
                coordsArray.push(coords);

                // 마커 클릭 시 정보창 표시
                const newInfoWindow = new kakao.maps.InfoWindow({
                  content: `<div style="padding:5px; font-size: 14px;">${entry.이름}</div>`,
                });

                kakao.maps.event.addListener(marker, "click", () => {
                  if (infoWindow) infoWindow.close();
                  newInfoWindow.open(map, marker);
                  infoWindow = newInfoWindow;

                  kakao.maps.event.addListener(map, "click", () => {
                    if (infoWindow) infoWindow.close();
                    infoWindow = null;
                  });
                });

                // 검색 결과 리스트 카드 형식으로 추가
                searchResultsContainer.innerHTML += `
                  <div class="col-md-6 mb-3">
                    <div class="card">
                      <a href="/details">
                        <img src="${entry.이미지}" class="card-img-top" alt="${entry.이름}">
                      </a>
                      <div class="card-body text-center">
                        <h6 class="card-title">${entry.이름}</h6>
                        <p class="card-text">${entry.카테고리}</p>
                      </div>
                    </div>
                  </div>`;
              }
            });
          });

          // 지도 범위 조정
          setTimeout(() => {
            if (coordsArray.length > 0) {
              const bounds = new kakao.maps.LatLngBounds();
              coordsArray.forEach((coords) => bounds.extend(coords));
              map.setBounds(bounds);
            }
          }, 500);
        } catch (error) {
          console.error("Firebase Storage 또는 JSON 데이터 처리 중 오류:", error);
        }
      }

      // 초기 데이터 로드
      loadData();
    });
  } else {
    console.error("Kakao 객체를 초기화할 수 없습니다.");
  }
});
