document.addEventListener('DOMContentLoaded', () => {
  console.log('Client JS loaded.');

  // 예: 공통 로직
  // 공통적으로 쓸 수 있는 함수나 이벤트를 이곳에 정의할 수 있음.
  
  // 예: 헤더의 로그아웃 버튼 클릭 시 확인 팝업 띄우기
  const logoutLink = document.querySelector('.header-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      const confirmed = confirm('로그아웃 하시겠습니까?');
      if (!confirmed) {
        e.preventDefault();
      }
    });
  }
});
