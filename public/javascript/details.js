// public/javascript/details.js

// 241224 박제성 맵 추가 및 기본 마커 추가 구간
// 20241225 채준병 수정
document.addEventListener("DOMContentLoaded", () => {
  if (typeof kakao !== "undefined") {
    kakao.maps.load(() => {
      console.log("Kakao 객체:", kakao);

      const mapContainer = document.getElementById("map");

      // 지도 초기화 (기본 좌표는 kosmo)
      const mapOption = {
        center: new kakao.maps.LatLng(37.476823, 126.879512),
        level: 3,
      };

      const map = new kakao.maps.Map(mapContainer, mapOption);
      console.log("상세보기 지도 초기화 완료");

      // 기본 마커 데이터
      const markerPosition = new kakao.maps.LatLng(37.476823, 126.879512);

      // 마커 이미지 설정 20241225 채준병
      const imageSrc = "/images/Map_pin.png"; // 사용자 정의 마커 이미지 경로
      const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
      const imageOption = { offset: new kakao.maps.Point(20, 40) }; // 중심 좌표

      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );

      // 마커 생성 및 지도에 추가
      new kakao.maps.Marker({
        position: markerPosition,
        map,
        title: "Detail Marker",
        image: markerImage, // 커스텀 이미지 적용
      });
    });
  } else {
    console.error("Kakao Maps API 로드 실패");
  }
});
