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

  //2025-01-13 박제성 상세정보 노출 추가
  // URL에서 RID, region, category 추출
  const path = window.location.pathname;
  const RID = path.split("/")[2];
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
    const db = getDatabase(app);
    const auth = getAuth(app);

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

        //2024-01-13 박제성 하트 클릭 할때마다 즐겨찾기 추가 삭제 기능 추가
        // 즐겨찾기 하트 클릭 이벤트 설정
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

    const updateStoreInfo = (storeData) => {
      document.getElementById("storeName").textContent = storeData.이름;
      document.getElementById("storeAddress").textContent = storeData.주소
        .split("지번")[0]
        .trim();
      document.getElementById("storeContact").textContent = storeData.전화번호;
      // 메뉴 줄바꿈 처리
      const menuElement = document.getElementById("storeMenu");
      const menuItems = storeData.메뉴.split("\n");
      const limitedMenuItems = menuItems.slice(0, 10); // 첫 10개 항목만 가져오기
      menuElement.innerHTML = limitedMenuItems
        .map((item) => `${item}<br>`)
        .join("");

      try {
        const hours = JSON.parse(storeData.영업시간);
        document.getElementById("storeHours").textContent = hours.월.영업시간;
      } catch (e) {
        console.error("영업시간 데이터 처리 중 오류:", e);
      }
      // 이미지 처리 (JSON 데이터에서 이미지 URL 사용)
      if (storeData.이미지) {
        const imageElement = document.getElementById("storeImage");
        imageElement.src = storeData.이미지; // JSON 데이터의 이미지 링크 사용
        imageElement.alt = storeData.이름; // 접근성을 위한 alt 속성 추가
      } else {
        console.warn("이미지 URL이 없습니다.");
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
          map.setLevel(6); // 원하는 레벨로 확대비율 설정
        } else {
          console.warn(`주소 변환 실패: ${storeData.주소}`);
        }
      });
    };

    // Firebase에 즐겨찾기 추가 및 삭제 함수
    const setupHeartClickEvent = (db, uid, RID, storeData) => {
      const heartIcon = document.getElementById("heart-icon");

      // Firebase에서 즐겨찾기 상태 확인 후 초기화
      const initHeartState = async () => {
        const favoritesRef = dbRef(db, `favorites/${uid}/${RID}`);
        console.log("데이터베이스 참조 경로:", favoritesRef.toString());

        try {
          const snapshot = await get(favoritesRef);
          console.log("Firebase snapshot 데이터:", snapshot.val());

          if (snapshot.exists()) {
            console.log("즐겨찾기 활성화 상태로 초기화됨");
            heartIcon.classList.remove("far");
            heartIcon.classList.add("fas", "heart-icon-active");
          } else {
            console.log("즐겨찾기 비활성화 상태로 초기화됨");
            heartIcon.classList.remove("fas", "heart-icon-active");
            heartIcon.classList.add("far");
          }
        } catch (error) {
          console.error("Firebase 초기화 중 오류:", error);
        }
      };

      // 페이지 로드 시 초기화
      initHeartState();

      heartIcon.addEventListener("click", async () => {
        console.log("하트 클릭 이벤트 실행됨!");
        const favoritesRef = dbRef(db, `favorites/${uid}/${RID}`);

        try {
          const snapshot = await get(favoritesRef);
          const isCurrentlyFavorited = snapshot.exists();
          console.log(
            "현재 즐겨찾기 상태:",
            isCurrentlyFavorited ? "활성화됨" : "비활성화됨"
          );

          if (isCurrentlyFavorited) {
            // 즐겨찾기 삭제
            await remove(favoritesRef);
            console.log("Firebase에서 즐겨찾기 삭제 성공!");
            heartIcon.classList.remove("fas", "heart-icon-active");
            heartIcon.classList.add("far");
          } else {
            // firebase에 즐겨찾기 추가
            await set(favoritesRef, {
              RID,
              name: storeData.이름,
              address: storeData.주소.split("지번")[0].trim(),
              timestamp: Date.now(),
              region: urlParams.get("region"),
              category: urlParams.get("category"),
            });
            console.log("Firebase에 즐겨찾기 저장 성공!");
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
