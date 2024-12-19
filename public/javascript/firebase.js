import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWXqiIMBGBNylvmsYWAm4zl83e_Ej-RjA",
    authDomain: "kkh-project-61365.firebaseapp.com",
    projectId: "kkh-project-61365",
    storageBucket: "kkh-project-61365.firebasestorage.app",
    messagingSenderId: "1098470049245",
    appId: "1:1098470049245:web:26ab03cbf246d998656234",
    databaseURL: "https://kkh-project-61365-default-rtdb.asia-southeast1.firebasedatabase.app"
};

export const app = initializeApp(firebaseConfig);