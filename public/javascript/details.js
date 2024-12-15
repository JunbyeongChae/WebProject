document.addEventListener('DOMContentLoaded', () => {
  console.log('Details JS loaded.');

  // 지도 초기화
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    // Kakao Maps API 예제 (키 필요)
    // var mapOption = {
    //   center: new kakao.maps.LatLng(37.5665, 126.9780),
    //   level: 3
    // };
    // var map = new kakao.maps.Map(mapContainer, mapOption);

    // 실제 구현 전까지 가짜 텍스트
    mapContainer.innerHTML = '상세 지도 영역 (API 연동 필요)';
  }

  // 리뷰 작성 폼 검증 예시
  const reviewForm = document.querySelector('.details-review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      const reviewText = reviewForm.querySelector('#reviewText');
      const reviewRating = reviewForm.querySelector('#reviewRating');

      if (!reviewText.value.trim()) {
        alert('리뷰 내용을 입력하세요.');
        e.preventDefault();
      } else if (!reviewRating.value) {
        alert('평점을 선택하세요.');
        e.preventDefault();
      }
    });
  }
});
