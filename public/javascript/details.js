import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const regionSelect = document.getElementById("regionSelect");
  const categorySelect = document.getElementById("categorySelect");

  // 요소가 없을 경우 기본값 설정
  const selectedRegion = regionSelect ? regionSelect.value : "defaultRegion";
  const selectedCategory = categorySelect ? categorySelect.value : "defaultCategory";

  console.log("Region:", selectedRegion, "Category:", selectedCategory);

  if (typeof kakao === "undefined") {
    console.error("Kakao Maps API 로드 실패");
    return;
  }

  kakao.maps.load(async () => {
    console.log("Kakao Maps API 로드 성공");

    const urlParams = new URLSearchParams(window.location.search);
    const RID = urlParams.get("RID");
    if (!RID) {
      console.error("RID가 URL에 포함되어 있지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/config");
      if (!response.ok) throw new Error("Firebase 설정을 가져오지 못했습니다.");

      const configData = await response.json();
      const firebaseConfig = configData.firebase;
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);

      const fileName = `${selectedRegion}_${selectedCategory}.json`;
      const storageRef = ref(storage, fileName);
      const fileUrl = await getDownloadURL(storageRef);

      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) throw new Error("JSON 파일 로드 실패");

      const data = await fileResponse.json();
      const entry = data[RID];
      if (entry) {
        console.log("RID에 해당하는 데이터:", entry);

        // 지도 설정
        const mapContainer = document.getElementById("map");
        const mapOption = {
          center: new kakao.maps.LatLng(entry.위도, entry.경도),
          level: 3,
        };
        const map = new kakao.maps.Map(mapContainer, mapOption);

        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(entry.위도, entry.경도),
          map: map,
          title: entry.이름,
        });

        // 데이터 바인딩
        document.getElementById("storeImage").src = entry.이미지 || "https://placehold.co/600x400";
        document.getElementById("storeName").textContent = entry.이름;
        document.getElementById("storeAddress").textContent = entry.주소;
        document.getElementById("storeContact").textContent = entry.전화번호 || "정보 없음";
        document.getElementById("storeHours").textContent = entry.영업시간 || "정보 없음";

        // 메뉴 출력 (상위 4개만)
        const menuList = document.getElementById("menuList");
        if (typeof entry.메뉴 === "string") {
          const menuItems = entry.메뉴.split("\n").slice(0, 4);
          menuItems.forEach((menuItem) => {
            const listItem = document.createElement("li");
            listItem.textContent = menuItem;
            menuList.appendChild(listItem);
          });
        } else {
          console.warn("메뉴 데이터가 유효하지 않습니다.");
        }
      }
    } catch (error) {
      console.error("오류 발생:", error.message);
    }
  });
});
