// public/javascript/mypage.js

// 241224 박제성 마이페이지 카카오맵 및 마커 추가
// 20241225 채준병 수정
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
    displayName: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phoneNumber: document.getElementById('phone').value,
    photoURL: profileImageUrl, // 업로드된 URL 또는 기존 URL 유지
  };

  try {
    await updateUserData(localStorage.getItem('uid'), updatedUserData); // Firestore 업데이트
    alert("정보가 성공적으로 업데이트되었습니다!");
  } catch (error) {
    console.error("데이터 업데이트 실패:", error);
    alert("정보 업데이트에 실패했습니다.");
  }
});

  // 지도 초기화
  if (typeof kakao !== "undefined") {
    kakao.maps.load(() => {
      // 지도 컨테이너 설정
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 3, // 확대 레벨
      };

      // 지도 생성
      const map = new kakao.maps.Map(container, options);

      // 마커 데이터 (예제)
      const markers = [
        { name: "맛집1", lat: 37.5665, lng: 126.978 },
        { name: "맛집2", lat: 37.57, lng: 126.982 },
        { name: "맛집3", lat: 37.564, lng: 126.975 },
      ];

      // 마커 이미지 설정 20241225 채준병
      const imageSrc = "/images/Map_pin.png"; // 사용자 정의 마커 이미지 경로
      const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
      const imageOption = { offset: new kakao.maps.Point(20, 40) }; // 중심 좌표
      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );

      markers.forEach((markerData) => {
        const markerPosition = new kakao.maps.LatLng(
          markerData.lat,
          markerData.lng
        );

        new kakao.maps.Marker({
          position: markerPosition,
          map: map,
          title: markerData.name,
          image: markerImage, // 커스텀 마커 이미지 적용
        });
      });
    });
  }

  // 프로필 이미지 미리보기 설정
  document
    .getElementById("profileImage")
    .addEventListener("change", PreviewImage);

  // 회원정보 수정 폼 초기화
  initializeSignupPage();
});
