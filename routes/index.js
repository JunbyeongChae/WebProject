// routes/index.js
const express = require('express');
const router = express.Router();

// 예시: 추천 맛집 리스트 (실제로는 DB나 API에서 가져올 수 있음)
const recommendedRestaurants = [
  { id: '1', name: '맛집A', imageUrl: '/images/restaurantA.jpg', rating: 4.5 },
  { id: '2', name: '맛집B', imageUrl: '/images/restaurantB.jpg', rating: 4.2 },
  { id: '3', name: '맛집C', imageUrl: '/images/restaurantC.jpg', rating: 4.7 }
];

router.get('/', (req, res) => {
  // 로그인 상태 체크 (예: 세션에 사용자 정보가 있다 가정)
  const user = req.session.user || null;

  res.render('pages/home', {
    user: user, 
    recommendedRestaurants: recommendedRestaurants
  });
});

module.exports = router;
