const express = require('express');
const router = express.Router();
const { getUserFavorites, addFavorite, removeFavorite } = require('../controllers/favoritesController');

// 즐겨찾기 목록 조회
router.get('/', async (req, res) => {
  const user = req.session.user || null;
  if (!user) {
    // 로그인 안 되어있으면 접근 불가 -> 로그인 페이지로 이동
    return res.redirect('/auth/login');
  }

  try {
    const favorites = await getUserFavorites(user.uid);
    res.render('pages/favorites', {
      user: user,
      favorites: favorites || []
    });
  } catch (error) {
    console.error('즐겨찾기 목록 조회 오류:', error);
    res.render('pages/error', {
      user: user,
      message: '즐겨찾기 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// 즐겨찾기 추가/삭제 처리
router.post('/', async (req, res) => {
  const user = req.session.user || null;
  if (!user) {
    return res.redirect('/auth/login');
  }

  const { restaurantId, action } = req.body;
  if (!restaurantId || !action) {
    return res.render('pages/error', {
      user: user,
      message: '요청 정보가 부족합니다.'
    });
  }

  try {
    if (action === 'add') {
      await addFavorite(user.uid, restaurantId);
    } else if (action === 'remove') {
      await removeFavorite(user.uid, restaurantId);
    } else {
      return res.render('pages/error', {
        user: user,
        message: '알 수 없는 액션 요청입니다.'
      });
    }

    // 작업 완료 후 다시 즐겨찾기 페이지로 이동
    res.redirect('/favorites');
  } catch (error) {
    console.error('즐겨찾기 수정 중 오류:', error);
    res.render('pages/error', {
      user: user,
      message: '즐겨찾기 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

module.exports = router;
