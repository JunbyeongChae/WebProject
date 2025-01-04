//2024-12-19 이희범

var express = require('express');
var router = express.Router();

/* GET users listing. */
//'/' 경로로 들어오는 GET 요청을 처리합니다. 여기서 '/'는 이 라우터의 기본 경로에 추가되는 하위 경로입니다.
router.get('/', function(req, res, next) { 
  res.send('respond with a resource');
});
/* 회원가입 추가 */
router.get('/signup', function(req, res, next) {
  res.render('index', { title:"Sign up", pageName:"pages/signup.ejs"});
});

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