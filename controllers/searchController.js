// controllers/searchController.js

// Firebase, API 호출 제거. 가짜 데이터 반환
async function searchRestaurants(query, region) {
  // 가짜 맛집 데이터 반환
  return [
    { id: '1', name: '가짜맛집 A', address: '가짜 주소 1', rating: 4.5, imageUrl: '/images/default_restaurant.jpg' },
    { id: '2', name: '가짜맛집 B', address: '가짜 주소 2', rating: 4.2, imageUrl: '/images/default_restaurant.jpg' }
  ];
}

module.exports = {
  searchRestaurants
};
