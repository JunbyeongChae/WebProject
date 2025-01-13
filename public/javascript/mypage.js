import {
  PreviewImage,
  initializeSignupPage,
  getUserData,
  fetchFirebaseConfig,
  updateUserData,
} from "/javascript/client.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref as dbRef,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Storage에 이미지 업로드
async function uploadProfileImage(file) {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref); // 다운로드 URL 반환
  } catch (error) {
    console.error("프로필 이미지 업로드 실패:", error);
    return null;
  }
}

let userData = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Firebase 초기화
  await fetchFirebaseConfig();

  // Firestore에서 사용자 데이터 가져오기
  const uid = localStorage.getItem("uid");
  if (uid) {
    try {
      userData = await getUserData(uid);
      document.getElementById("name").value = userData.displayName;
      document.getElementById("email").value = userData.email;
      document.getElementById("password").value = "********"; // 비밀번호는 표시하지 않음
      document.getElementById("phone").value = userData.phoneNumber;

      if (userData.photoURL) {
        document.getElementById("profilePreview").src = userData.photoURL;
      }
    } catch (error) {
      console.error("사용자 데이터를 가져오는 데 실패:", error);
    }
  }

  // 회원정보 수정 폼 제출 이벤트 처리
  document
    .getElementById("infoForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const file = document.getElementById("profileImage").files[0];
      let profileImageUrl = null;

      // 사진 업로드 또는 기존 사진 유지
      if (file) {
        profileImageUrl = await uploadProfileImage(file);
        if (!profileImageUrl) {
          alert("프로필 이미지 업로드에 실패했습니다.");
          return;
        }
      } else if (userData && userData.photoURL) {
        profileImageUrl = userData.photoURL; // 기존 사진 유지
      }

      // Firestore에 저장할 데이터
      const updatedUserData = {
        displayName: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phoneNumber: document.getElementById("phone").value,
        photoURL: profileImageUrl, // 업로드된 URL 또는 기존 URL 유지
      };

      try {
        await updateUserData(localStorage.getItem("uid"), updatedUserData); // Firestore 업데이트
        alert("정보가 성공적으로 업데이트되었습니다!");
      } catch (error) {
        console.error("데이터 업데이트 실패:", error);
        alert("정보 업데이트에 실패했습니다.");
      }
    });

  // 지도 초기화
  if (typeof kakao !== "undefined") {
    kakao.maps.load(async () => {
      const auth = getAuth();

      // Firebase에서 즐겨찾기 데이터 가져오기
      const getFavoriteStores = async (uid) => {
        const db = getDatabase();
        const favoritesRef = dbRef(db, `favorites/${uid}`);
        try {
          const snapshot = await get(favoritesRef);
          if (snapshot.exists()) {
            return Object.values(snapshot.val());
          }
          return [];
        } catch (error) {
          console.error("즐겨찾기 데이터 가져오기 실패:", error);
          return [];
        }
      };

      // 주소를 좌표로 변환하는 함수
      const getCoordinates = (address) => {
        return new Promise((resolve) => {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              resolve({
                lat: parseFloat(result[0].y),
                lng: parseFloat(result[0].x),
              });
            } else {
              console.warn(`주소 변환 실패: ${address}`);
              resolve(null);
            }
          });
        });
      };

      // 지도 컨테이너 설정
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.476823, 126.879512),
        level: 3,
      };

      // 지도 생성
      const map = new kakao.maps.Map(container, options);

      // 마커 이미지 설정
      const imageSrc = "/images/Map_pin.png";
      const imageSize = new kakao.maps.Size(40, 40);
      const imageOption = { offset: new kakao.maps.Point(20, 40) };
      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );

      // Firebase Auth를 통해 현재 로그인된 사용자 확인 및 마커 생성
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // 즐겨찾기 데이터 가져오기
          const favorites = await getFavoriteStores(user.uid);
          const coordsArray = [];

          // 각 즐겨찾기 항목에 대해 좌표 변환 및 마커 생성
          for (const store of favorites) {
            const coords = await getCoordinates(store.address);
            if (coords) {
              const position = new kakao.maps.LatLng(coords.lat, coords.lng);
              coordsArray.push(position);

              const marker = new kakao.maps.Marker({
                position: position,
                map: map,
                title: store.name,
                image: markerImage,
              });

              // 마커 클릭 이벤트 추가
              kakao.maps.event.addListener(marker, "click", () => {
                window.location.href = `/details/${store.RID}?region=${store.region}&category=${store.category}`;
              });

              // 인포윈도우 생성
              const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${store.name}</div>`,
              });

              // 마커에 마우스오버 이벤트 추가
              kakao.maps.event.addListener(marker, "mouseover", () => {
                infowindow.open(map, marker);
              });

              // 마커에 마우스아웃 이벤트 추가
              kakao.maps.event.addListener(marker, "mouseout", () => {
                infowindow.close();
              });
            }
          }

          // 지도 범위 조정
          if (coordsArray.length > 0) {
            const bounds = new kakao.maps.LatLngBounds();
            coordsArray.forEach((coords) => bounds.extend(coords));
            map.setBounds(bounds);
          } else {
            console.log("즐겨찾기한 가게가 없습니다.");
          }
        } else {
          console.log("로그인이 필요합니다.");
          // 로그인 페이지로 리다이렉트하거나 알림 표시
        }
      });
    });
  }

  // 프로필 이미지 미리보기 설정 및 중복 방지
  const profileImage = document.getElementById("profileImage");
  const profilePreview = document.getElementById("profilePreview");
  const fileName = document.getElementById("fileName");

  if (profileImage && profilePreview && fileName) {
    // 파일 이름 출력 및 미리보기 설정
    profileImage.addEventListener("change", function () {
      if (profileImage.files.length > 0) {
        fileName.textContent = profileImage.files[0].name; // 선택한 파일명 표시

        // 미리보기 업데이트
        const file = profileImage.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          profilePreview.src = e.target.result; // 이미지 미리보기 업데이트
        };
        reader.readAsDataURL(file);
      } else {
        fileName.textContent = "선택된 파일 없음";
      }
    });

    // 이미지 클릭 시 파일 선택 창 열기
    profilePreview.addEventListener("click", (event) => {
      event.stopPropagation(); // 이벤트 전파 차단
      profileImage.click();
    });

    // 파일 선택 버튼 클릭 시 파일 선택 창 열기
    document
      .querySelector(".btn.btn-primary.mt-2")
      .addEventListener("click", (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        profileImage.click();
      });
  }

  // 회원정보 수정 폼 초기화
  initializeSignupPage();
});
