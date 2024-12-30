require('dotenv').config(); // .env 파일 로드
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// 환경 변수에서 Firebase 설정 가져오기
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

// 서비스 계정 키 파일 경로 (Firebase Console에서 다운로드한 JSON 파일)
const keyFilePath = path.join(__dirname, './kosmo-exp-2024-firebase-adminsdk-ynt9g-f3065fbbdf.json');

// cors.json 파일 경로 (CORS 설정 JSON 파일)
const corsConfigPath = path.join(__dirname, 'cors.json');

async function setCors() {
  const storage = new Storage({
    projectId: FIREBASE_PROJECT_ID,
    keyFilename: keyFilePath,
  });

  const bucket = storage.bucket(FIREBASE_STORAGE_BUCKET);

  // cors.json 파일 읽기
  const corsConfig = require(corsConfigPath);

  // CORS 정책 적용
  await bucket.setCorsConfiguration(corsConfig);
  console.log(`CORS configuration applied to bucket ${FIREBASE_STORAGE_BUCKET}`);
}

setCors().catch(console.error);
