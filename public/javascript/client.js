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

// Firebase 초기화 객체를 전역 변수로 선언
export let app; // 전역 변수 선언

// Firebase 설정 데이터를 가져오는 함수
export async function fetchFirebaseConfig() {
  try {
    // 서버에서 Firebase 설정 데이터를 가져옴
    const response = await fetch("/config");
    console.log("Fetch Response Status:", response.status);

    if (!response.ok) {
      console.error("Failed to fetch config. Status:", response.status);
      throw new Error("Failed to fetch config");
    }

    const config = await response.json();
    console.log("Firebase Config Loaded:", config); // 디버깅 출력

    // Firebase 초기화 (동적 import 사용)
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"
    );

    // 서버에서 내려준 JSON에서 firebase 설정만 꺼내서 초기화
    app = initializeApp(config.firebase);
  } catch (error) {
    console.error("Error loading Firebase config:", error); // 에러 메시지 출력
    alert("Firebase config 로드에 실패했습니다. 관리자에게 문의하세요.");
  }
}

// 페이지 로드 시 Firebase 설정 데이터를 먼저 가져오기
//fetchFirebaseConfig(); //중복검사시 에러 발생하여 일단 주석처리: 20241222채준병

// Firebase 관련 모듈 import
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// 회원가입 함수
export function signup() {
  // 폼 제출 이벤트
const auth = getAuth(app); // 전역 변수 app 사용
const storage = getStorage(app);

$("#signupForm").on("submit", async (e) => {
  e.preventDefault();
  console.log("Signup form submitted!");

  const email = $("#email").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();
  const file = $("#profileImage")[0].files[0];

  if (password !== confirmPassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    let profileImageUrl = "";
    if (file) {
      profileImageUrl = await uploadProfileImage(file);
    }

    // ======== 중복가입 방지 (Firebase가 제공) ========
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", userCredential.user);

    if (profileImageUrl) {
      console.log("Profile image URL:", profileImageUrl);
    }
    
    alert("회원가입이 완료되었습니다! 축하합니다!");
    location.href = "/";
  } catch (error) {
    // ======== 중복가입 에러 처리 ========
    if (error.code === 'auth/email-already-in-use') {
      alert("이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.");
    } else {
    console.error(error.code, error.message);
    alert(`회원가입 실패: ${error.message}`);
  }
  }
});

// 프로필 이미지 업로드 함수
const uploadProfileImage = (file) => {
  const storageRef = ref(storage, `profileImages/${file.name}`);
  return uploadBytes(storageRef, file).then((snapshot) => getDownloadURL(snapshot.ref));
};
}

// 로그인 함수
export function login() {
  console.log("Firebase App:", app);

  // 로그인 폼 제출 이벤트 처리
  $("#frm").on("submit", (e) => {
    e.preventDefault(); // 기본 폼 동작 방지

    const email = $("#email").val();
    const password = $("#password").val();

    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((data) => {
        console.log(`uid ===> ${data.user.uid}`);
        console.log(`email ===> ${data.user.email}`);

        // 로그인 성공 시, 사용자 정보 저장 및 페이지 이동
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("uid", data.user.uid);
        location.href = "/"; // 홈 화면으로 이동
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(`Login failed: ${errorMessage}`);

        // 실패 시, 사용자에게 회원가입 유도
        const shouldSignup = confirm(
          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.\n회원가입 페이지로 이동하시겠습니까?"
        );
        if (shouldSignup) {
          location.href = "/signup"; // 회원가입 페이지로 이동
        }
      });
  });
}

// 페이지별 초기화 함수 (예: 추가로 회원정보 수정 등을 처리)
export function initializeSignupPage() {
  const form = document.getElementById("infoForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("name")?.value || "";
      const email = document.getElementById("email")?.value || "";
      const phone = document.getElementById("phone")?.value || "";
      const address = document.getElementById("address")?.value || "";

      console.log("수정된 정보:", { name, email, phone, address });
    });
  }
}
