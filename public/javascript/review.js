import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { app } from "../../config/firebase.js";

// Firestore에서 db받아오기
const db = getFirestore(app);
console.log("DB : ",db)

const username = localStorage.getItem("displayName")

// URL parameters에서 RID 값 가져오기
const urlParams = new URLSearchParams(window.location.search);
const rid = urlParams.get("RID");
console.log("RID : " + rid);
if (!rid) {
    const storedRID = localStorage.getItem("RID");
    if (storedRID) {
        rid = storedRID; // LocalStorage에서 RID 복원
        console.log("RID restored from localStorage: ", rid);
    } else {
        console.error("RID를 찾을 수 없습니다.");
    }
} else {
    localStorage.setItem("RID", rid); // RID를 LocalStorage에 저장
    console.log("RID stored to localStorage: ", rid);
}

const getReviewList = async () => {
    try {
        const q = query(collection(db, "reviews"), where("RID", "==", rid)); // RID 기준으로 리뷰 가져오기
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
            <h6>${review.username || "Anonymous"}</h6>
            <p>${review.comment}</p>
            <small>${new Date(review.comment_no).toLocaleString()}</small>
        </div>
        `
        )
        .join("");
};
getReviewList();




