document.addEventListener("DOMContentLoaded", () => {
  console.log("Favorites JS loaded.");

  // 즐겨찾기 해제 확인
  const removeButtons = document.querySelectorAll(".favorites-remove-button");
  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const confirmed = confirm("정말로 즐겨찾기를 해제하시겠습니까?");
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });
});
