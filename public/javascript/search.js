// public/javascript/search.js

// 241224 박제성 검색부분 맵 및 마커 추가
// 20241225 채준병 수정
document.addEventListener("DOMContentLoaded", () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(() => {
      console.log("Kakao 객체:", kakao);

      const mapContainer = document.getElementById("map");

      // 지도 초기화
      const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 5,
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);
      console.log("검색 페이지 지도 초기화 완료");

      // 기본 마커 데이터
      const markers = [
        { name: "Marker 1", lat: 37.5665, lng: 126.978 },
        { name: "Marker 2", lat: 37.57, lng: 126.982 },
        { name: "Marker 3", lat: 37.564, lng: 126.975 },
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

      // 마커 추가
      markers.forEach((markerData) => {
        const markerPosition = new kakao.maps.LatLng(
          markerData.lat,
          markerData.lng
        );

        const marker = new kakao.maps.Marker({
          position: markerPosition,
          map,
          title: markerData.name,
          image: markerImage, // 커스텀 이미지 적용
        });

        console.log(`마커 추가됨: ${markerData.name}`);
      });
      console.log("카카오 지도 및 마커 생성 완료!");
    });
  } else {
    console.error(
      "Kakao 객체를 초기화할 수 없습니다. 스크립트 로드에 실패했습니다."
    );
  }
});
