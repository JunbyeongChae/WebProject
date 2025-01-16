import { getFirestore, collection, query, where, getDocs, addDoc, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { app } from "../../config/firebase.js";

const db = getFirestore(app);
console.log("DB : ",db)

const username = localStorage.getItem("displayName")

// URL parameters에서 RID 값 가져오기
const path = window.location.pathname;
const rid = path.split("/")[2];

console.log("RID : " + rid);
if (!rid) {
    const storedRID = localStorage.getItem("RID");
    if (storedRID) {
        rid = storedRID; // LocalStorage에서 RID 가져오기
    } else {
        console.error("RID를 찾을 수 없습니다.");
    }
} else {
    localStorage.setItem("RID", rid); // RID를 LocalStorage에 저장
    console.log("RID 저장 ", rid);
}

const getReviewList = async () => {
    try {
        //orederBy관련 에러
        //에러 메시지에 포함된 링크를 클릭하면, Firestore에서 필요한 인덱스를 
        //자동으로 생성하는 페이지로 이동합니다. -> 생성 눌러주시면 됩니다.
        const q = query(collection(db, "reviews"), where("RID", "==", rid), orderBy("comment_no", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("해당 식당 리뷰가 없습니다.");
            renderReviews([]); 
            return;
        }

        const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // 리뷰 데이터 배열로 변환
        console.log("조회한 식당 리뷰 데이터: ", rows);
        renderReviews(rows); // 데이터 렌더링
    } catch (error) {
        console.error("리뷰를 불러오는 데 실패했습니다. ", error);
    }
};

// 리뷰 데이터를 렌더링(화면에 그리는)하는 함수
const renderReviews = (reviews) => {
    const reviewsContainer = document.getElementById("reviews-container");

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `<p>아직 리뷰가 없습니다.</p>`;
        return;
    }

    reviewsContainer.innerHTML = reviews
        .map(
            (review) => `
        <div class="mb-3 border-bottom pb-2">
            <h6>${review.username}</h6>
            <p>${review.comment}</p>
            <small>${new Date(review.comment_no).toLocaleString()}</small>
        </div>
        `
        )
        .join("");
};
getReviewList();

const handleReviewSubmission = async () => {
    const reviewComment = document.getElementById("reviewComment").value.trim(); // 입력된 리뷰 내용

    if (!reviewComment) {
        alert("리뷰 내용을 입력해주세요.");
        return;
    }

    // 리뷰 데이터 객체
    const reviewData = {
        RID: rid,               // 리뷰가 속한 가게의 고유 ID
        username: username,      // 작성자 (로그인된 사용자명)
        comment: reviewComment,  // 리뷰 내용
        comment_no: Date.now()   // 작성 시간 (타임스탬프)
    };

    try {
        // Firestore에 리뷰 추가
        await addDoc(collection(db, "reviews"), reviewData);
        console.log("리뷰가 성공적으로 추가되었습니다.");
        getReviewList()
        // 리뷰 입력 필드 초기화
        document.getElementById("reviewComment").value = ""; // 텍스트 영역 비우기
        alert("리뷰가 성공적으로 제출되었습니다.");
    } catch (error) {
        console.error("리뷰를 추가하는 중 오류가 발생했습니다: ", error);
    }
};


document.getElementById("reviewForm").addEventListener("submit", function (event) {
            event.preventDefault(); // 기본 동작 방지 (폼 전송 등)
            console.log("Submit 버튼 클릭 이벤트 발생");
            // 로그인 상태 체크
            try{
            if (!username) {
                alert("로그인 후 리뷰 작성 가능합니다.");
                return;
            }else {
                // 리뷰 제출 처리
                handleReviewSubmission();   
            }
        }catch (error) {
        console.error("리뷰 제출 처리 중 오류 발생:", error);
    }
})

