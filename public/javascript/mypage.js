// public/javascript/mypage.js

// 241224 박제성 마이페이지 카카오맵 및 마커 추가
// 20241225 채준병 수정
document.addEventListener("DOMContentLoaded", () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(() => {
      console.log("Kakao 객체:", kakao);

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
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      markers.forEach((markerData) => {
        const markerPosition = new kakao.maps.LatLng(markerData.lat, markerData.lng);

        const marker = new kakao.maps.Marker({
          position: markerPosition,
          map: map,
          title: markerData.name,
          image: markerImage, // 커스텀 마커 이미지 적용
        });

        console.log(`마커 추가됨: ${markerData.name}`);
      });
    });
  } else {
    console.error("Kakao Maps API 로드 실패");
  }
});