// public/javascript/details.js

// 20241224 박제성 맵 추가 및 기본 마커 추가 구간
// 20241225 채준병 수정
// 20250113 박제성 맵 마커 추가 및 JSON 내용 불러오기 구현 

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded 이벤트 실행");

  // URL에서 RID, region, category 추출
  // URL 경로에서 RID 추출
  const path = window.location.pathname;
  const RID = path.split("/")[2];
  // URLSearchParams로 나머지 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get("region");
  const category = urlParams.get("category");

  console.log("RID:", RID, "Region:", region, "Category:", category);

  if (typeof kakao === "undefined") {
    console.error("Kakao 객체를 초기화할 수 없습니다.");
    return;
  }

  kakao.maps.load(async () => {
    console.log("Kakao 객체 로드 완료");

    // Firebase 설정 가져오기
    const configResponse = await fetch("/config");
    if (!configResponse.ok) {
      console.error("Firebase 설정을 가져오지 못했습니다.");
      return;
    }
    const { firebase: firebaseConfig } = await configResponse.json();

    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    // Kakao 지도 초기화
    const mapContainer = document.getElementById("map");
    const map = new kakao.maps.Map(mapContainer, {
      center: new kakao.maps.LatLng(37.476823, 126.879512),
      level: 7,
    });

    const markerImage = new kakao.maps.MarkerImage(
      "/images/Map_pin.png",
      new kakao.maps.Size(40, 40),
      { offset: new kakao.maps.Point(20, 40) }
    );

    let markers = []; // 기존 마커 저장용

    const loadData = async () => {
      try {
        // JSON 파일 경로 설정 및 다운로드
        const fileName = `${region}_${category}.json`;
        const jsonRef = ref(storage, `json/${fileName}`);
        const downloadUrl = await getDownloadURL(jsonRef);
        console.log("Firebase JSON 다운로드 URL:", downloadUrl);

        const dataResponse = await fetch(downloadUrl);
        if (!dataResponse.ok) {
          console.error("JSON 데이터를 가져오지 못했습니다.");
          return;
        }

        const storeList = Object.values(await dataResponse.json());
        const flattenedStoreList = storeList.flat();

        console.log("Flattened StoreList:", flattenedStoreList);

        // RID에 해당하는 가게 정보 검색
        const storeData = flattenedStoreList.find((store) => store.RID === RID);
        if (!storeData) {
          console.error(`RID (${RID})에 해당하는 가게를 찾을 수 없습니다.`);
          return;
        }

        // 가게 정보 표시
        updateStoreInfo(storeData);

        // 주소 정보를 기반으로 마커 생성
        addMarkersToMap(storeData, map, markerImage, markers);
      } catch (error) {
        console.error("데이터 로드 중 오류:", error);
      }
    };

    const updateStoreInfo = (storeData) => {
      document.getElementById("storeName").textContent = storeData.이름;
      document.getElementById("storeAddress").textContent = storeData.주소;
      document.getElementById("storeContact").textContent = storeData.전화번호;
      document.getElementById("storeMenu").textContent = storeData.메뉴;

      try {
        const hours = JSON.parse(storeData.영업시간);
        document.getElementById("storeHours").textContent = hours.월.영업시간;
      } catch (e) {
        console.error("영업시간 데이터 처리 중 오류:", e);
      }
    };

    const addMarkersToMap = (storeData, map, markerImage, markers) => {
      const geocoder = new kakao.maps.services.Geocoder();
      const coordsArray = [];

      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;

      // RID에 해당하는 가게만 마커 추가
      const address = storeData.주소.split("지번")[0].trim();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          // 마커 생성
          const marker = new kakao.maps.Marker({
            position: coords,
            map,
            title: storeData.이름,
            image: markerImage,
          });

          markers.push(marker);
          coordsArray.push(coords);

          // 지도 중앙을 해당 마커로 설정
          map.setCenter(coords);
          map.setLevel(5); // 원하는 레벨로 확대비율 설정
        } else {
          console.warn(`주소 변환 실패: ${storeData.주소}`);
        }
      });
    };

    // 초기 데이터 로드
    loadData();
  });
});
