// public/javascript/search.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

/* 2025-01-07 이희범 URLSearchParams 사용하여 region, category 가져오고 select요소를 통해 콤보박스에 적용 */
document.addEventListener("DOMContentLoaded", () => {
  // URL에서 쿼리 파라미터를 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const selectedRegion = urlParams.get("region");
  const selectedCategory = urlParams.get("category");

  // region과 category 콤보박스에 선택된 값 반영
  const regionSelect = document.getElementById("regionSelect");
  const categorySelect = document.getElementById("categorySelect");

  if (selectedRegion) {
    regionSelect.value = selectedRegion;  // region 선택값 설정
  }

  if (selectedCategory) {
    categorySelect.value = selectedCategory;  // category 선택값 설정
  }

});

// 20241224 박제성 검색부분 맵 및 마커 추가
// 20241225 채준병 수정
// 20241231 박제성 firebase 연동 // json 파일 기반으로 콤보박스 선택시 마커 노출 및 지도 이동 구현

// Firebase 앱 초기화
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(async () => {
      console.log("Kakao 객체:", kakao);

      // Firebase 설정 가져오기 (apiKeys.js의 API 호출)
      const response = await fetch("/config");
      if (!response.ok) {
        console.error("Firebase 설정을 가져오지 못했습니다.");
        return;
      }
      const configData = await response.json();

      // Firebase 초기화
      const firebaseConfig = configData.firebase;
      const app = initializeApp(firebaseConfig); // Firebase 앱 초기화
      const storage = getStorage(app); // Firebase Storage 초기화

      // Kakao 지도 초기화
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(37.476823, 126.879512), // 기본위치 // 한국소프트웨어인재개발원
        level: 7, // 확대비율 조절
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
      const searchResultsContainer = document.getElementById("searchResultsContainer");

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
          const jsonRef = ref(storage, `json/${fileName}`); // 파일명 경로 수정
          const url = await getDownloadURL(jsonRef);
          console.log("생성된 JSON URL:", url);
          console.log(fileName);

          const response = await fetch(url);
          if (!response.ok) throw new Error("JSON 파일 로드 실패");

          const data = await response.json();
          const restaurants = data[selectedCategory] || [];

          // 검색 결과 필터링
          const filteredResults = restaurants.filter((entry) =>
            entry.이름.toLowerCase().includes(searchQuery)
          );

          const resultsRow = document.getElementById("resultsRow");
          resultsRow.innerHTML = ""; // 기존 결과 초기화

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

                // 2025-01-08 강경훈 => 검색 결과 카드 HTML 추가
                resultsRow.innerHTML += `
                <div class="col-md-6 mb-3">
                  <div class="card">
                    <a href="/details">
                      <img src="${entry.이미지 ? entry.이미지 : 'https://placehold.co/100X100'}" class="card-img-top" alt="${entry.이름}">
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
