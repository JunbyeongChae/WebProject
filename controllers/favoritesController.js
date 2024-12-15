// controllers/favoritesController.js

// Firebase DB 접근 제거, 가짜 즐겨찾기 로직
// 실제 DB 없이 빈 배열 또는 임시 데이터 반환

async function getUserFavorites(userId) {
  // 가짜 데이터 (빈 목록)
  return [];
}

async function addFavorite(userId, restaurantId) {
  // 실제 DB 작업 없음
  return;
}

async function removeFavorite(userId, restaurantId) {
  // 실제 DB 작업 없음
  return;
}

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite
};
