// public/javascript/search.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

/* 2025-01-07 이희범 URLSearchParams 사용하여 region, category 가져오고 select요소를 통해 콤보박스에 적용 */
/* 2025-01-14 박제성 충돌로 인해 URLSearchParams 위치 변경*/
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

      // 2025-01-13 해당 구역과 카테고리를 받아오는 코드.
      const regionSelect = document.getElementById("regionSelect");
      const categorySelect = document.getElementById("categorySelect");
      const searchInput = document.querySelector(
        ".form-control[placeholder='음식점을 검색하세요']"
      );
      const searchResultsContainer = document.getElementById(
        "searchResultsContainer"
      );

      // 데이터를 로드하는 함수
      async function loadData() {
        // 기존 마커 초기화
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        const selectedRegion = regionSelect.value;
        const selectedCategory = categorySelect.value;
        const searchQuery = searchInput.value.toLowerCase();
        const fileName = `${selectedRegion}_${selectedCategory}.json`; // 해당 지역 및 카테고리에 맞는 파일명

        try {
          // Firebase Storage에서 JSON 파일 URL 가져오기
          const jsonRef = ref(storage, `json/${fileName}`); // 2024-01-08 강경훈 파일명 경로 수정
          // storage 최상단에 파일들이 위치해야함
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

          // json 파일의 주소에서 지번 이란 글자 앞을 자르고 address에 추가
          const coordsArray = [];
          filteredResults.forEach((entry) => {
            const address = entry.주소.split("지번")[0].trim();
            // 해당 주소로 좌표 검색
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
                // 다른 마커 클릭하면 기존 정보창 닫힘
                kakao.maps.event.addListener(marker, "click", () => {
                  if (infoWindow) infoWindow.close();
                  newInfoWindow.open(map, marker);
                  infoWindow = newInfoWindow;
                  // 지도 클릭해도 정보창 닫힘
                  kakao.maps.event.addListener(map, "click", () => {
                    if (infoWindow) infoWindow.close();
                    infoWindow = null;
                  });
                });

                // 2025-01-08 강경훈 => 검색 결과 카드 HTML 추가
                // 20250113 박제성 => 주소 이동 관련 항목 추가.
                resultsRow.innerHTML += `
  <div class="col-md-6 mb-3">              
    <div class="card">
      <a href="/details/${encodeURIComponent(
        entry.RID
      )}?region=${encodeURIComponent(
                  selectedRegion
                )}&category=${encodeURIComponent(selectedCategory)}">
        <img src="${entry.이미지 || "https://placehold.co/100x100"}" 
            class="card-img-top" 
            alt="${entry.이름 || "이미지 없음"}">
      </a>
      <div class="card-body text-center">
        <h6 class="card-title" style = "font-weight : bold">${entry.이름 || "이름 없음"}</h6>
        <p class="card-text">${selectedCategory || "카테고리 없음"}</p>
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
          console.error(
            "Firebase Storage 또는 JSON 데이터 처리 중 오류:",
            error
          );
        }
      }
      // URLSearchParams 사용하여 region, category 가져오고 select 요소를 통해 콤보박스에 적용
      const urlParams = new URLSearchParams(window.location.search);
      const initialRegion = urlParams.get("region") || "광명시"; // 기본값 설정
      const initialCategory = urlParams.get("category") || "한식"; // 기본값 설정

      regionSelect.value = initialRegion;
      categorySelect.value = initialCategory;

      //2025-01-14 박제성  콤보박스가 바뀌면 URL도 바뀌도록 변경.
      // 콤보박스 및 검색 입력 이벤트
      regionSelect.addEventListener("change", () => {
        updateURL();
        loadData(); // URL이 변경된 후 데이터 로드
      });

      categorySelect.addEventListener("change", () => {
        updateURL();
        loadData(); // URL이 변경된 후 데이터 로드
      });

      searchInput.addEventListener("input", loadData);

      // URL을 동적으로 갱신하는 함수
      function updateURL() {
        const selectedRegion = regionSelect.value;
        const selectedCategory = categorySelect.value;

        // URL의 쿼리 파라미터 갱신
        const newURL = new URL(window.location.href);
        newURL.searchParams.set("region", selectedRegion);
        newURL.searchParams.set("category", selectedCategory);

        // 페이지 URL을 갱신
        window.history.pushState({ path: newURL.href }, "", newURL.href);
      }

      // 초기 데이터 로드
      loadData();
    });
  } else {
    console.error("Kakao 객체를 초기화할 수 없습니다.");
  }
});
