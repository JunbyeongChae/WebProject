// config/firebase.js

//2024-12-19 이희범
//{ initializeapp....구조분해 할당 }
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

const response = await fetch("/config");
const data = await response.json();

const firebaseConfig = {
  apiKey: data.firebase.apiKey,
  authDomain: data.firebase.authDomain,
  databaseURL: data.firebase.databaseURL,
  projectId: data.firebase.projectId,
  storageBucket: data.firebase.storageBucket,
  messagingSenderId: data.firebase.messagingSenderId,
  appId: data.firebase.appId,
};

export const app = initializeApp(firebaseConfig);
