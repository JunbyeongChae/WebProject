import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Firebase 앱 초기화 ==> 제성님 코드 참고
document.addEventListener("DOMContentLoaded", async () => {
  // Firebase 설정 가져오기
  const response = await fetch("/config");
  if (!response.ok) {
    console.error("Firebase 설정을 가져오지 못했습니다.");
    return;
  }
  const configData = await response.json();
  const firebaseConfig = configData.firebase;
  const app = initializeApp(firebaseConfig); // Firebase 앱 초기화
  const storage = getStorage(app); // Firebase Storage 초기화

  // 지도 로딩
  if (typeof kakao !== "undefined") {
    kakao.maps.load(() => {
      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 5,
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);

      const markers = [
        { name: "Marker 1", lat: 37.5665, lng: 126.978 },
        { name: "Marker 2", lat: 37.57, lng: 126.982 },
        { name: "Marker 3", lat: 37.564, lng: 126.975 },
      ];

      const imageSrc = "/images/Map_pin.png"; // 사용자 정의 마커 이미지 경로
      const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
      const imageOption = { offset: new kakao.maps.Point(20, 40) };

      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      markers.forEach((markerData) => {
        const markerPosition = new kakao.maps.LatLng(markerData.lat, markerData.lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition,
          map,
          title: markerData.name,
          image: markerImage,
        });
      });
    });
  } else {
    console.error("Kakao 객체를 초기화할 수 없습니다.");
  }

  // 콤보박스 및 검색어 입력 필드
  const regionSelect = document.getElementById("regionSelect");
  const categorySelect = document.getElementById("categorySelect");
  const searchInput = document.getElementById("searchInput");

  // 데이터 로드 함수
  async function loadData() {
    const selectedRegion = regionSelect.value;
    const selectedCategory = categorySelect.value;
    const searchQuery = searchInput.value.toLowerCase();
    const fileName = `${selectedRegion}_${selectedCategory}.json`;

    try {
      const jsonRef = ref(storage, fileName);
      const url = await getDownloadURL(jsonRef);
      const response = await fetch(url);
      const data = await response.json();

      // 카테고리와 검색어로 필터링
      const filteredResults = data[selectedCategory].filter(entry =>
        entry.이름.toLowerCase().includes(searchQuery)
      );

      updateSearchResults(filteredResults);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  }

  // 검색 결과 업데이트 함수
  function updateSearchResults(restaurants) {
    const resultContainer = document.getElementById("searchResults");
    resultContainer.innerHTML = '';  // 이전 결과 지우기

    restaurants.forEach(entry => {
      const card = document.createElement('div');
      card.classList.add('col-md-6', 'mb-3');
      card.innerHTML = `
        <div class="card">
          <a href="/details">
            <img src="${entry.img || 'https://placehold.co/100x100'}" class="card-img-top" alt="${entry.name}">
          </a>
          <div class="card-body text-center">
            <h6 class="card-title">${entry.이름}</h6>
            <p class="card-text">${entry.정보}</p>
          </div>
        </div>
      `;
      resultContainer.appendChild(card);
    });
  }

  // 검색 버튼 클릭 이벤트
  document.getElementById("searchButton").addEventListener("click", loadData);

  // 콤보박스 값이 변경될 때마다 데이터 불러오기
  regionSelect.addEventListener("change", loadData);
  categorySelect.addEventListener("change", loadData);

  // 처음 로드 시 데이터 불러오기
  loadData();
});

/*
    Access to fetch at 'https://firebasestorage.googleapis.com/v0/b/kkh-project-61365.firebasestorage.app/o/%EA%B4%91%EB%AA%85%EC%8B%9C_%ED%95%9C%EC%8B%9D.json?alt=media&token=d0fd13e4-6a0d-482d-ac69-b24c6b461959' from origin 'http://localhost:4000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.Understand this errorAI
    search.js:72 
            
            
    GET https://firebasestorage.googleapis.com/v0/b/kkh-project-61365.firebasestorage.app/o/%EA%B4%91%EB%AA%85%EC%8B%9C_%ED%95%9C%EC%8B%9D.json?alt=media&token=d0fd13e4-6a0d-482d-ac69-b24c6b461959 net::ERR_FAILED 200 (OK)
    loadData @ search.js:72
    await in loadData
    (anonymous) @ search.js:117Understand this errorAI
    search.js:82 데이터 로드 실패: TypeError: Failed to fetch
    at loadData (search.js:72:30)
    ==> 데이터 로딩 오류 해결중
*/