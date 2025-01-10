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
  document.getElementById("infoForm").addEventListener("submit", async (event) => {
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
    kakao.maps.load(() => {
      // 지도 컨테이너 설정
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.476823, 126.879512), // 기본위치
        level: 3, // 확대 레벨
      };

      // 지도 생성
      const map = new kakao.maps.Map(container, options);

      // 마커 데이터 (임의 가게 데이터)
      const markersData = [
        { name: "보릿골", lat: 37.4552973019092, lng: 126.877836052368 },
        {
          name: "황궁쟁반옛날손짜장",
          lat: 37.5001012541426,
          lng: 126.882291434996,
        },
        {
          name: "백만그릇파스타",
          lat: 37.4790648145907,
          lng: 126.889097292556,
        },
        { name: "김태완스시", lat: 37.4745242026197, lng: 126.867592514877 },
        { name: "잉크커피", lat: 37.4821079378772, lng: 126.895281502292 },
      ];

      // 마커 이미지 설정
      // 마커 이미지 설정
      const imageSrc = "/images/Map_pin.png"; // 사용자 정의 마커 이미지 경로
      const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
      const imageOption = { offset: new kakao.maps.Point(20, 40) }; // 중심 좌표
      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );

      // 마커들의 좌표를 저장할 배열
      const coordsArray = [];

      // 마커 생성 및 지도에 추가
      markersData.forEach((entry) => {
        const coords = new kakao.maps.LatLng(entry.lat, entry.lng);

        const marker = new kakao.maps.Marker({
          position: coords,
          map,
          title: entry.name,
          image: markerImage, // 커스텀 이미지 적용
        });

        // 더블클릭 이벤트 추가
        kakao.maps.event.addListener(marker, "click", () => {
          // URL로 이동
          window.location.href = "http://localhost:4000/details";
          //`http://localhost:4000/details?name=${encodeURIComponent(entry.name)}`;
        });

        // 마커를 배열에 추가
        coordsArray.push(coords);
      });

      // 지도 중심과 확대 레벨을 마커에 맞게 조정
      if (coordsArray.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        coordsArray.forEach((coords) => {
          bounds.extend(coords); // 모든 마커 좌표를 bounds에 추가
        });
        map.setBounds(bounds); // 마커들이 포함되도록 지도 영역 조정
      }
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
    document.querySelector(".btn.btn-primary.mt-2").addEventListener("click", (event) => {
      event.stopPropagation(); // 이벤트 전파 차단
      profileImage.click();
    });
  }

  // 회원정보 수정 폼 초기화
  initializeSignupPage();
});
