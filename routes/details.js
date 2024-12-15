const express = require('express');
const router = express.Router();
const { getRestaurantDetails, addReview, checkIfFavorited } = require('../controllers/detailsController');

router.get('/:id', async (req, res) => {
  const user = req.session.user || null;
  const restaurantId = req.params.id;

  try {
    const restaurant = await getRestaurantDetails(restaurantId);
    if (!restaurant) {
      return res.render('pages/error', { 
        user: user,
        message: '해당 맛집 정보를 찾을 수 없습니다.'
      });
    }

    let isFavorited = false;
    if (user) {
      isFavorited = await checkIfFavorited(user.uid, restaurantId);
    }

    // restaurant 내에 reviews 정보도 포함하거나, 별도로 컨트롤러에서 reviews를 반환하도록 할 수 있음
    const { reviews } = restaurant;

    res.render('pages/details', {
      user: user,
      restaurant: restaurant,
      reviews: reviews || [],
      isFavorited: isFavorited,
      reviewErrorMessage: null
    });
  } catch (error) {
    console.error('맛집 상세 조회 중 오류:', error);
    res.render('pages/error', { 
      user: user,
      message: '맛집 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

router.post('/:id/reviews', async (req, res) => {
  const user = req.session.user || null;
  const restaurantId = req.params.id;

  if (!user) {
    // 로그인 안되어 있으면 리뷰 작성 불가 -> 로그인 페이지로 이동
    return res.redirect('/auth/login');
  }

  const { reviewText, reviewRating } = req.body;
  const reviewImage = req.file; // 이미지 업로드 시 multer 등 미들웨어 필요

  try {
    await addReview(user.uid, restaurantId, reviewText, reviewRating, reviewImage);
    res.redirect(`/details/${restaurantId}`);
  } catch (error) {
    console.error('리뷰 작성 중 오류:', error);
    // 리뷰 작성 실패 시 에러 메시지와 함께 상세 페이지 다시 렌더
    try {
      const restaurant = await getRestaurantDetails(restaurantId);
      let isFavorited = false;
      if (user && restaurant) {
        isFavorited = await checkIfFavorited(user.uid, restaurantId);
      }

      res.render('pages/details', {
        user: user,
        restaurant: restaurant || null,
        reviews: (restaurant && restaurant.reviews) || [],
        isFavorited: isFavorited,
        reviewErrorMessage: '리뷰 작성에 실패했습니다. 다시 시도해주세요.'
      });
    } catch (innerError) {
      console.error('리뷰 작성 실패 후 상세 페이지 로딩 중 오류:', innerError);
      res.render('pages/error', { 
        user: user,
        message: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
  }
});

module.exports = router;
