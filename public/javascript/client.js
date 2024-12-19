// 이미지 미리보기 기능
export function PreviewImage(event) {
  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById('profilePreview');
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
  const form = document.getElementById('infoForm');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // 폼 제출 시 새로고침 방지

      // 수정된 값 가져오기
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const address = document.getElementById('address')?.value || '';

      // 화면에 저장된 정보 표시
      console.log('수정된 정보:', { name, email, phone, address });

      // 서버에 데이터를 보내는 로직 추가 가능
    });
  }
}
