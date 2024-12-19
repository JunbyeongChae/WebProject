 // 이미지 미리보기 기능
 function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
      const output = document.getElementById('profilePreview');
      output.src = reader.result; // 이미지 미리보기
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  // 폼 제출 시 화면에 수정된 정보 표시
  document.getElementById('infoForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼 제출 시 페이지 새로 고침 방지

    // 수정된 값 가져오기
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    // 화면에 저장된 정보 표시 (예시로 콘솔에 출력)
    console.log('수정된 정보:', { name, email, phone, address });

    // 여기서 서버에 데이터를 보내는 로직을 추가할 수 있음.
  });