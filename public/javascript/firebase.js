//2024-12-19 이희범
//env를 사용하려다가 계속 에러가 발생하여 일단 이렇게 작업을 해놨습니다. (참고바람)


//{ initializeapp....구조분해 할당 }
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
//구글 파이어베이스에서 제공하는 firebase-app.jsp에 initializeApp함수가 정의되어 있다.
//외부에 js파일에 제공하는 함수를 사용하려면 import를 할 수 있다. -NodeJS - 브라우저와 별개로 작업이 가능함
const firebaseConfig = {
    apiKey: "AIzaSyAIRUbG-bG1hWG6tQABMab046El5nE_ZLs",
    authDomain: "slalom2024-75f71.firebaseapp.com",
    databaseURL: "https://slalom2024-75f71-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "slalom2024-75f71",
    storageBucket: "slalom2024-75f71.firebasestorage.app",
    messagingSenderId: "1079080191923",
    appId: "1:1079080191923:web:dfe22fe4368346c228edc6"
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