const express = require('express');
const router = express.Router();
const { searchRestaurants } = require('../controllers/searchController');

router.get('/', async (req, res) => {
  const query = req.query.query || '';
  const region = req.query.region || '';
  
  // 로그인 상태 체크
  const user = req.session.user || null;

  try {
    // 검색 로직 실행 (controller에서 API 호출 또는 DB 조회 수행)
    const searchResults = await searchRestaurants(query, region);

    res.render('pages/search', {
      user: user,
      query: query,
      region: region,
      searchResults: searchResults
    });
  } catch (error) {
    console.error('검색 오류:', error);
    res.render('pages/error', { 
      user: user,
      message: '검색 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
  }
});

module.exports = router;
