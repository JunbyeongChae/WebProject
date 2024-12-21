//app을 import 해오는 경로 변경
import { app } from "/config/firebase.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes, //지정된 경로에 파일을 업로드 추가
  getDownloadURL, // 업로드된 파일의 다운로드 URL을 가져옴 이 URL을 사용하면 클라이언트에서 파일에 접근가능 추가
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// 이미지 미리보기 기능
export function PreviewImage(event) {
  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById("profilePreview");
    if (output) {
      output.src = reader.result; // 이미지 미리보기
    }
  };
  if (event.target.files[0]) {
    reader.readAsDataURL(event.target.files[0]);
  }
}

// 페이지별 초기화 함수
export function initializeSignupPage() {
  const form = document.getElementById("infoForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // 폼 제출 시 새로고침 방지

      // 수정된 값 가져오기
      const name = document.getElementById("name")?.value || "";
      const email = document.getElementById("email")?.value || "";
      const phone = document.getElementById("phone")?.value || "";
      const address = document.getElementById("address")?.value || "";

      // 화면에 저장된 정보 표시
      console.log("수정된 정보:", { name, email, phone, address });

      // 서버에 데이터를 보내는 로직 추가 가능
    });
  }
}

////////////////////////////////////////////////////////////////2024-12-21 심유정
//회원가입 함수 구현
export function signup() {
  const auth = getAuth(app);
  const storage = getStorage(app);

  $("#signupForm").on("submit", async (e) => {
    e.preventDefault();
    console.log("Signup form submitted!");
    let email = $("#email").val();
    let password = $("#password").val();
    let confirmPassword = $("#confirmPassword").val(); //password 확인 기능을 추가
    const file = $("#profileImage")[0].files[0];

    if (password !== confirmPassword) {
      // password를 대조하는 if문을 추가
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      let profileImageUrl = "";
      if (file) {
        //비동기 함수 uploadProfileImage를 호출하여 파일을 업로드 하고
        // 그 결과 반환된 업로드된 파일의 URL profileImageUrl에 저장함.
        profileImageUrl = await uploadProfileImage(file);
      }
      //새로운 이메일, 비밀번호를 통해 새 사용자를 등록
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created:", userCredential.user);

      //프로필 이미지 url이 존재하면 홈화면으로 이동
      if (profileImageUrl) {
        console.log("Profile image URL:", profileImageUrl);
      }

      location.href = "/";
    } catch (error) {
      // 회원가입 실패
      console.error(error.code, error.message);
      alert(`회원가입 실패: ${error.message}`);
    }
  });

  // Firebase Storage에서 파일이 저장될 위치를 정의하고 해당파일을 업로드 하며
  //업로드가 완료되면 getDownloadURL() 통해 업로드된 파일의 다운로드 URL을 가져옴
  //이 url을 반환하여 다른곳에서 사용할 수 있도록 함
  const uploadProfileImage = (file) => {
    const storageRef = ref(storage, `profileImages/${file.name}`);
    return uploadBytes(storageRef, file).then((snapshot) =>
      getDownloadURL(snapshot.ref)
    );
  };
}


////////////////////////////////////////////////////////////////2024-12-21 심유정
//로그인 함수 구현
export function login() {
  console.log("Firebase App:", app);
  const auth = getAuth(app);

  // 로그인 폼 제출 처리
  $('#frm').on('submit', (e) => {
    e.preventDefault();//폼이 제출되면 기본적으로 페이지가 새로고침되거나 서버로 POST 요청이 보내지는데, 이 동작을 막기 위해 사용
    const email = $('#email').val();
    const password = $('#password').val();

    signInWithEmailAndPassword(auth, email, password)
      .then((data) => {
        console.log(`uid ===> ${data.user.uid}`);
        console.log(`email ===> ${data.user.email}`);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("uid", data.user.uid);
        location.href = "/";
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(`Login failed: ${errorMessage}`);
      });
  });
}