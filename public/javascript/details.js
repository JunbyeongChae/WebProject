//241224 박제성 맵 추가 및 기본 마커 추가 구간
document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map");

  // 지도 초기화 (기본 좌표는 서울 시청)
  const mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 3,
  };
  const map = new kakao.maps.Map(mapContainer, mapOption);

  // 기본 마커 데이터
  const markerPosition = new kakao.maps.LatLng(37.5665, 126.9780);

  // 마커 생성 및 지도에 추가
  new kakao.maps.Marker({
    position: markerPosition,
    map,
    title: "Detail Marker",
  });

  console.log("상세보기 지도와 마커 생성 완료!");
});//241224 맵 추가 및 기본 마커 구간 끝