// controllers/detailsController.js

// Firebase로부터 맛집 상세정보 가져오는 로직 제거, 가짜 데이터 반환

async function getRestaurantDetails(restaurantId) {
  if (restaurantId === '1') {
    return {
      id: '1',
      name: '가짜맛집 A',
      address: '가짜 주소 1',
      phone: '010-0000-0000',
      hours: '09:00 - 21:00',
      rating: 4.5,
      imageUrl: '/images/default_restaurant.jpg',
      reviews: [
        { userId: 'dummy_uid', authorName: '테스트사용자', text: '맛있어요!', rating: 5, date: new Date().toLocaleString() }
      ]
    };
  } else {
    return null;
  }
}

async function addReview(userId, restaurantId, reviewText, reviewRating, reviewImage) {
  // DB 없이 그냥 성공 처리
  return;
}

async function checkIfFavorited(userId, restaurantId) {
  // 항상 false 반환
  return false;
}

module.exports = {
  getRestaurantDetails,
  addReview,
  checkIfFavorited
};
