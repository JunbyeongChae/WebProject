//241224 박제성 마이페이지 카카오맵 및 마커 추가
document.addEventListener("DOMContentLoaded", () => {
  // 카카오 지도 API 로드
  kakao.maps.load(() => {
    const mapContainer = document.getElementById("map"); // 지도를 표시할 div
    const mapOption = {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 초기 중심 좌표 (서울 시청)
      level: 4, // 확대 레벨
    };

    // 지도 생성
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커 데이터 (예제)
    const markers = [
      { name: "맛집1", lat: 37.5665, lng: 126.978 },
      { name: "맛집2", lat: 37.57, lng: 126.982 },
      { name: "맛집3", lat: 37.564, lng: 126.975 },
    ];

    // 마커 추가
    markers.forEach((markerData) => {
      const markerPosition = new kakao.maps.LatLng(
        markerData.lat,
        markerData.lng
      ); // 마커 위치

      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map, // 마커를 표시할 지도 객체
        title: markerData.name, // 마커에 마우스 올릴 때 표시될 이름
      });
      console.log(`마커 생성 완료: ${markerData.name}`);
    });
    console.log("카카오 지도 및 마커 생성 완료!");
  });
}); //241224 마이페이지 카카오맵 및 마커 추가 부분 끝
