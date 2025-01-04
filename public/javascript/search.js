// public/javascript/search.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

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

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(37.476823, 126.879512), // 기본위치 // 한국소프트웨어인재개발원
        level: 7, // 확대비율 조절
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);
      console.log("검색 페이지 지도 초기화 완료");

      // 마커 이미지 설정 20241225 채준병
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

      // 콤보박스 선택 이벤트 처리  // search.ejs 의 <select id = "이부분" >과 일치하게
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
          const jsonRef = ref(storage, `json/${fileName}`); // Firebase Storage의 경로
          const url = await getDownloadURL(jsonRef); // URL을 가져옵니다
          const response = await fetch(url);
          if (!response.ok) throw new Error("JSON 파일 로드 실패");
          const data = await response.json();

          // 선택된 카테고리 데이터 처리
          const restaurants = data[selectedCategory];

          // 마커들의 좌표를 저장할 배열
          const coordsArray = [];

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
                coordsArray.push(coords);

                console.log(
                  `JSON 마커 추가됨: ${entry.RID} ${entry.이름} (${result[0].y}, ${result[0].x})`
                );

                // 정보 창 추가
                const newInfoWindow = new kakao.maps.InfoWindow({
                  content: `<div style="padding:5px; font-size: 14px;word-wrap: break-word;">${entry.이름}</div>`,
                });

                kakao.maps.event.addListener(marker, "click", () => {
                  // 기존 정보 창 닫기
                  if (infoWindow) {
                    infoWindow.close();
                  }
                  // 새로운 정보 창 열기
                  newInfoWindow.open(map, marker);
                  infoWindow = newInfoWindow; // 새로운 정보 창 설정

                  kakao.maps.event.addListener(map, "click", () => {
                    if (infoWindow) {
                      infoWindow.close();
                      infoWindow = null; // 닫은 후 정보 창 초기화
                    }
                  });
                });
              } else {
                console.error(`주소 변환 실패: ${address}`);
              }
            });
          });
          // 마커들이 추가된 후, 마커들의 중간 좌표로 지도 이동
          setTimeout(() => {
            if (coordsArray.length > 0) {
              const bounds = new kakao.maps.LatLngBounds();
              coordsArray.forEach((coords) => {
                bounds.extend(coords); // 모든 마커 좌표를 bounds에 추가
              });
              map.setBounds(bounds); // 마커들이 포함되도록 지도 영역 조정
            }
          }, 500); // 마커가 모두 추가된 후에 지도의 영역을 조정
        } catch (error) {
          console.log(`${selectedRegion}_${selectedCategory}`);
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
