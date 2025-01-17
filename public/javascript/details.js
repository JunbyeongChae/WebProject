import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref as dbRef,
  set,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded 이벤트 실행");

  // URL에서 RID, region, category 추출
  const path = window.location.pathname;
  const RID = path.split("/")[2];
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get("region");
  const category = urlParams.get("category");

  console.log("RID:", RID, "Region:", region, "Category:", category);

  // Kakao 지도 API 로드 확인
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

    // Firebase 초기화
    const { firebase: firebaseConfig } = await configResponse.json();
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const db = getDatabase(app);
    const auth = getAuth(app);

    // Kakao 지도 초기화
    const mapContainer = document.getElementById("map");
    const map = new kakao.maps.Map(mapContainer, {
      center: new kakao.maps.LatLng(37.476823, 126.879512), // 지도 중심 좌표 설정
      level: 7, // 지도 확대 레벨 설정
    });

    // 마커 이미지 설정
    const markerImage = new kakao.maps.MarkerImage(
      "/images/Map_pin.png",
      new kakao.maps.Size(40, 40),
      { offset: new kakao.maps.Point(20, 40) } // 마커 이미지의 기준점
    );

    let markers = []; // 기존 마커 저장용 배열

    // 데이터 로드 함수
    const loadData = async () => {
      try {
        // Firebase Storage에서 JSON 파일 다운로드
        const fileName = `${region}_${category}.json`;
        const jsonRef = ref(storage, `json/${fileName}`);
        const downloadUrl = await getDownloadURL(jsonRef);
        console.log("Firebase JSON 다운로드 URL:", downloadUrl);

        const dataResponse = await fetch(downloadUrl);
        if (!dataResponse.ok) {
          console.error("JSON 데이터를 가져오지 못했습니다.");
          return;
        }

        // JSON 데이터를 가져와서 가게 리스트 생성
        const storeList = Object.values(await dataResponse.json());
        const flattenedStoreList = storeList.flat();

        // RID에 해당하는 가게 정보 검색
        const storeData = flattenedStoreList.find((store) => store.RID === RID);
        if (!storeData) {
          console.error(`RID (${RID})에 해당하는 가게를 찾을 수 없습니다.`);
          return;
        }

        // 가게 정보 업데이트
        updateStoreInfo(storeData);

        // 지도에 마커 추가
        addMarkersToMap(storeData, map, markerImage, markers);

        // Firebase Auth 사용자 상태 확인 후 즐겨찾기 이벤트 설정
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const uid = user.uid;
            setupHeartClickEvent(db, uid, RID, storeData);
          } else {
            console.log("로그인 필요");
          }
        });
      } catch (error) {
        console.error("데이터 로드 중 오류:", error);
      }
    };

    // 가게 정보 업데이트 함수
    const updateStoreInfo = (storeData) => {
      document.getElementById("storeName").textContent = storeData.이름;
      document.getElementById("storeAddress").textContent = storeData.주소
        .split("지번")[0]
        .trim();
      document.getElementById("storeContact").textContent = storeData.전화번호;

      // 메뉴 항목 줄바꿈 처리
      const menuElement = document.getElementById("storeMenu");
      const menuItems = storeData.메뉴.split("\n");
      const limitedMenuItems = menuItems.slice(0, 5); // 첫 5개 항목만 표시
      menuElement.innerHTML = limitedMenuItems
        .map((item) => `${item}<br>`)
        .join("");

      try {
        // 영업시간 처리
        const hours = JSON.parse(storeData.영업시간);
        document.getElementById("storeHours").textContent = hours.월.영업시간;
      } catch (e) {
        console.error("영업시간 데이터 처리 중 오류:", e);
      }

      // 가게 이미지 업데이트
      if (storeData.이미지) {
        const imageElement = document.getElementById("storeImage");
        imageElement.src = storeData.이미지;
        imageElement.alt = storeData.이름;
      } else {
        console.warn("이미지 URL이 없습니다.");
      }
    };

    // 지도에 마커 추가 함수
    const addMarkersToMap = (storeData, map, markerImage, markers) => {
      const geocoder = new kakao.maps.services.Geocoder();

      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;

      // 가게 주소를 기준으로 마커 추가
      const address = storeData.주소.split("지번")[0].trim();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          // 마커 생성 및 지도에 추가
          const marker = new kakao.maps.Marker({
            position: coords,
            map,
            title: storeData.이름,
            image: markerImage,
          });

          markers.push(marker);
          map.setCenter(coords);
          map.setLevel(6);
        } else {
          console.warn(`주소 변환 실패: ${storeData.주소}`);
        }
      });
    };

    // 즐겨찾기 하트 클릭 이벤트 설정 함수
    const setupHeartClickEvent = (db, uid, RID, storeData) => {
      const heartIcon = document.getElementById("heart-icon");

      // Firebase에서 즐겨찾기 상태 확인 및 초기화
      const initHeartState = async () => {
        const favoritesRef = dbRef(db, `favorites/${uid}/${RID}`);
        try {
          const snapshot = await get(favoritesRef);
          if (snapshot.exists()) {
            heartIcon.classList.remove("far");
            heartIcon.classList.add("fas", "heart-icon-active");
          } else {
            heartIcon.classList.remove("fas", "heart-icon-active");
            heartIcon.classList.add("far");
          }
        } catch (error) {
          console.error("Firebase 초기화 중 오류:", error);
        }
      };

      // 초기 상태 설정
      initHeartState();

      // 하트 클릭 이벤트
      heartIcon.addEventListener("click", async () => {
        const favoritesRef = dbRef(db, `favorites/${uid}/${RID}`);
        try {
          const snapshot = await get(favoritesRef);
          if (snapshot.exists()) {
            await remove(favoritesRef);
            heartIcon.classList.remove("fas", "heart-icon-active");
            heartIcon.classList.add("far");
          } else {
            await set(favoritesRef, {
              RID,
              name: storeData.이름,
              address: storeData.주소.split("지번")[0].trim(),
              timestamp: Date.now(),
              region: urlParams.get("region"),
              category: urlParams.get("category"),
            });
            heartIcon.classList.remove("far");
            heartIcon.classList.add("fas", "heart-icon-active");
          }
        } catch (error) {
          console.error("Firebase 작업 중 오류:", error);
        }
      });
    };

    // 초기 데이터 로드
    loadData();
  });
});
