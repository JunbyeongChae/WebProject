//2024-12-19 이희범

//{ initializeapp....구조분해 할당 }
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
//구글 파이어베이스에서 제공하는 firebase-app.jsp에 initializeApp함수가 정의되어 있다.
//외부에 js파일에 제공하는 함수를 사용하려면 import를 할 수 있다. -NodeJS - 브라우저와 별개로 작업이 가능함

const response = await fetch("/config");
const data = await response.json();

// process는 nodejs환경에서만 사용가능하다.
// 근데 현재 이 js파일(firebase.js)는 nodejs(서버) 환경이 아니라 브라우저 환경이다.
//브라우저는 Nodejs의 런타임 환경이 아니기 때문에 process 객체를 직접 접근할 수 없다

//문제 원인
//Nodejs(서버 측)에서 dotenv를 사용해 .env 파일을 로드 → process.env에 값이 저장됨
//그러나 브라우저에서 실행되는 JS(firebase.js)에서 process.env를 사용하려고 하면서 오류 발생
//브라우저는 process 객체가 없으므로 "process is not defined" 에러가 발생함

//해결 방법
//app.js파일 Nodejs(Express)에서 process.env 값을 읽고
//API(/config)를 통해 클라이언트로 전달 후
//현재 이 JS(firebase.js)에서 await fetch("/config");으로 nodejs로 받은 env값을 사용

const firebaseConfig = {
  apiKey: data.apiKey,
  authDomain:data.authDomain,
  databaseURL:data.databaseURL,
  projectId: data.projectId,
  storageBucket: data.storageBucket,
  messagingSenderId: data.messagingSenderId,
  appId: data.appId,
};

//이 파일에서 생성된 객체를 외부에서 사용하려면 변수 선언 앞에 export붙임
//initializeApp호출할 때 파라미터로 firebaseConfig객체가 제공하는 값들을 넘김
//인증된 클라이언트 정보 쥔다.
//header.ejs에서 사용하기 위해서 변수 선언 앞에 export를 붙임
//로그인(구글 이메일과 비번)을 진행하는 login.ejs에서도 app객체를 사용함
//해당 파일(login.ejs, header.ejs)에서 app출력해 보면 위 firebaseConfig에 내용이 있다.
//initializeApp함수는 firebase-app.js에 구현되어 있다.
//함수에는 파라미터를 가질 수 있다. - 그런데 파라미터 갯수가 6개이니까 하나로 넘긴다.({}->object)
//object 키와 값으로 구성됨
export const app = initializeApp(firebaseConfig);
