//2024-12-19 이희범

var express = require('express');
var router = express.Router();

/* GET home page. */

// title의 .ci는 Header의 로고이미지의 class를 가져왔습니다. 
router.get('/', function(req, res, next) {
  res.render('index', { title: '.ci', pageName: 'home.ejs' });
});

/* 로그인 화면 추가 */
router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Log in', pageName: 'pages/login.ejs' });
});

module.exports = router;