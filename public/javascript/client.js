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

// 회원가입 함수
export function signup() {
  // 폼 제출 이벤트
const auth = getAuth(app); // 전역 변수 app 사용
const storage = getStorage(app);

$("#signupForm").on("submit", async (e) => {
  e.preventDefault();
  console.log("Signup form submitted!");

  const name = $("#name").val();
  const email = $("#email").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();
  const phoneNumber = $("#phoneNumber").val();
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
    location.href = "/login";
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

// 홈화면 캐로셀 - 장원준 > 20241223 채준병 수정
export function initCarousel() {
  const carouselSlide = document.querySelector('.carousel-slide');
  let carouselItems = document.querySelectorAll('.carousel-slide .card'); // 주의: 이후 복제 후 다시 갱신할 예정

  const prevBtn = document.querySelector('#prevBtn');
  const nextBtn = document.querySelector('#nextBtn');

  const visibleItems = 4;                // 한 화면에 보여질 카드 수
  const totalItems = carouselItems.length;
  const itemWidth = carouselItems[0].offsetWidth; // 카드 하나의 실제 너비

  // --- 1) 맨 앞/뒤에 각각 4장씩 복제하기 ---
  for (let i = 0; i < visibleItems; i++) {
    // 앞쪽(첫 4장)을 복제하여 맨 뒤에 추가
    const endClone = carouselItems[i].cloneNode(true);
    carouselSlide.appendChild(endClone);

    // 뒤쪽(마지막 4장)을 복제하여 맨 앞에 추가
    const startClone = carouselItems[totalItems - 1 - i].cloneNode(true);
    carouselSlide.insertBefore(startClone, carouselSlide.firstChild);
  }

  // 복제 후 다시 아이템 목록 갱신
  carouselItems = document.querySelectorAll('.carousel-slide .card');
  // 복제 포함 전체 개수 = 원본 + 앞쪽 4장 + 뒤쪽 4장
  const extendedTotal = carouselItems.length; 

  // --- 2) 초기 위치 설정 ---
  // counter를 "맨 앞에 붙인 클론 4장"을 지나쳐서, 원본 첫 번째 카드가 보이는 위치로 잡는다.
  let counter = visibleItems; 
  carouselSlide.style.transform = `translateX(-${itemWidth * counter}px)`;

  // --- 3) 다음 버튼(1장씩 이동) ---
  nextBtn.addEventListener('click', () => {
    // 맨 끝(원본 끝 + 뒤쪽 클론 4장)까지 이동 시도
    if (counter >= extendedTotal - 1) return; 
    counter++;
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    carouselSlide.style.transform = `translateX(-${itemWidth * counter}px)`;
  });

  // --- 4) 이전 버튼(1장씩 이동) ---
  prevBtn.addEventListener('click', () => {
    // 맨 앞(맨 앞 클론 4장)보다 더 가려고 하면 중단
    if (counter <= 0) return; 
    counter--;
    carouselSlide.style.transition = "transform 0.4s ease-in-out";
    carouselSlide.style.transform = `translateX(-${itemWidth * counter}px)`;
  });

  // --- 5) transition 끝난 뒤 무한 루프 보정 ---
  carouselSlide.addEventListener('transitionend', () => {
    // 1) 만약 ‘오른쪽 끝’을 넘어갔다면(즉, 원본 마지막 카드 이후의 클론들까지 갔을 때),
    //    다시 ‘원본 마지막 카드’ 부근으로 점프
    //    -> counter를 (원본 마지막 카드 인덱스)로 보정
    if (counter >= totalItems + visibleItems) {
      carouselSlide.style.transition = "none"; // 점프할 때 애니메이션 제거
      // 원본 마지막 카드 인덱스는 totalItems + visibleItems - 1
      // (예: 원본이 8장이면, 맨 앞 클론 4장 + 실제 8장 = 12, 그중 마지막은 인덱스 11)
      counter = visibleItems; 
      carouselSlide.style.transform = `translateX(-${itemWidth * counter}px)`;
    }

    // 2) 만약 ‘왼쪽 끝’을 넘어갔다면(즉, 원본 첫 번째 카드 이전의 클론 구역으로 갔을 때),
    //    다시 ‘원본 첫 카드’ 부근으로 점프
    if (counter < visibleItems) {
      carouselSlide.style.transition = "none";
      // 원본 첫 카드 인덱스 = visibleItems
      counter = totalItems + (counter);
      carouselSlide.style.transform = `translateX(-${itemWidth * counter}px)`;
    }
  });
}
