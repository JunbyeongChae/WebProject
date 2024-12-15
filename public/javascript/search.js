document.addEventListener('DOMContentLoaded', () => {
  console.log('Search JS loaded.');

  // 지도 초기화 (예: Kakao Maps API를 사용할 경우)
  // 실제 API 키를 사용 시, index.ejs나 search.ejs 상단에서 Kakao Maps 스크립트 로드 필요
  // <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_KEY"></script>
  
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    // 아래는 Kakao Maps 예시 코드 (키 입력 필요)
    // var mapOption = {
    //   center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 광화문 좌표 예시
    //   level: 5
    // };
    // var map = new kakao.maps.Map(mapContainer, mapOption);

    // 가짜: 지도 영역에 텍스트 출력
    mapContainer.innerHTML = '지도 영역 (API 연동 필요)';
  }

  // 검색 결과 카드 클릭 시 상세 페이지로 이동하는 로직은 EJS 템플릿 내 a태그로 처리되므로 여기서는 추가 작업 없음.
});
