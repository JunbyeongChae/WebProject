//241224 박제성 검색부분 맵 및 마커 추가
document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map");
  // 지도 초기화
  const mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
    level: 3,
  };
  const map = new kakao.maps.Map(mapContainer, mapOption);
  // 기본 마커 데이터
  const markers = [
    { name: "Marker 1", lat: 37.5665, lng: 126.9780 },
    { name: "Marker 2", lat: 37.5700, lng: 126.9820 },
    { name: "Marker 3", lat: 37.5640, lng: 126.9750 },
  ];
  // 마커 추가
  markers.forEach((markerData) => {
    const markerPosition = new kakao.maps.LatLng(markerData.lat, markerData.lng);

    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map,
      title: markerData.name,
    });

    console.log(`마커 추가됨: ${markerData.name}`);
  });

  console.log("카카오 지도 및 마커 생성 완료!");
});//241224 검색부분 맵 및 마커 추가 부분 끝
