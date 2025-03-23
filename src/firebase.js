// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ 添加 Firestore
import { getAnalytics } from "firebase/analytics";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAXMDibHdJT14Xgf703wMoAbNMueWdpIIs",
  authDomain: "s1wp-f792a.firebaseapp.com",
  projectId: "s1wp-f792a",
  storageBucket: "s1wp-f792a.firebasestorage.app",
  messagingSenderId: "222695681826",
  appId: "1:222695681826:web:aa2cc7e8fe5bd272ac3f7b",
  measurementId: "G-9KRQ43FW37",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // ✅ 正确初始化 Firestore

export { db }; // ✅ 确保 Firestore 可用
