## CORS 문제 해결법

출처: [퍼플렉시티](https://www.perplexity.ai/) 검색 후 나온 결과

- 도입이유
  1. 브라우저의 CORS 우회 기능을 사용하면 FireBase가 안되고, 사용 안 하면 카카오 맵이 안 됨.
  2. 자체 라우팅등 여러 방법을 찾아봤지만 FireBase의 설정 자체가 문제라고 판단함.
  3. 프로젝트 파일을 최대한 수정하지 않으면서 할수있는 해당 방법을 사용 하였음.

```
(안내사항)

1. FireBase Storage 기능을 사용하지 않으신다면, 이 문서는 무시하셔도 됩니다.
2. 프로젝트 파일은 app.js만 수정되며, 제 컴퓨터와 학원 컴퓨터 2대 전부 작동을 확인했습니다
  - 다만 충돌 가능성은 있기에 app.js 백업을 해두면 좋을것 같습니다.
  - 원래대로 롤백 하시려면 cors.js 파일을 [] 로 수정한뒤 아래 과정을 (설치 제외) 다시 수행하시면 됩니다.
3. 한번 실행하면 계속 적용이 된다고 하니 매번 SetCORS.js를 실행할 필요는 없다고 합니다.
4. 해보고 안되거나, 더 좋은 방법이 있다면 알려주세요..
```

1. cors.json 파일을 만들고 그 파일을 개인 FireBase Storage에 업로드 합니다. ////완료

2. npm install @google-cloud/storage 로 Google Cloud Storage를 설치합니다. ////완료

3. Firebase Console로 이동한 뒤 아래 과정을 따라 서비스키(json 파일)를 발급 받습니다. ////완료

   - 프로젝트 개요 옆 톱니바퀴 -> 프로젝트 설정 클릭
   - 서비스 계정 탭 클릭
   - 아래 쪽의 "새 비공개키 생성" 클릭 // 스니펫의 Node.js 선택 확인

4. 그 파일을 프로젝트 최상단[.env나 pakage.json 같은 위치]에 추가합니다. ////완료

5. SetCors.js 을 프로젝트 최상단에 만들고 서비스키의 파일명을 입력합니다. ////완료

   - 키 파일명 예시) 프로젝트명-firebase-adminsdk-xxxxx-xxxxxxxx.json

6. node SetCors.js 로 해당 파일을 실행합니다. ////완료

7. npm install cors 로 cors 를 설치합니다.  ////완료

8. app.js 에 코드를 추가합니다. // 제가 올린 app.js에 해당 내용이 첨부되어 있습니다. ////완료

   - 주석으로 가려놓은 부분은 퍼플렉시티에서 알려준 코드지만 해당코드를 지워도 작동하긴 합니다.
   - 아마 아래 두줄만 추가해도 될 것 같긴 합니다.

9. 서버를 실행후 테스트를 진행 합니다.

# 주의) GitHub에 올릴땐 키 파일 및 SetCORS.js는 삭제하거나 .ignore에 넣으시고 커밋&푸시 하세요

```javascript
/* cors.json 내용 */
[
  {
    origin: ["*"], // 허용 경로
    method: ["GET", "POST", "UPDATE", "DELETE"],
    responseHeader: ["Content-Type", "Authorization"],
    maxAgeSeconds: 3600,
  },
];
```

```javascript
/* SetCORS.js 파일 내용 */
require("dotenv").config(); // .env 파일 로드
const { Storage } = require("@google-cloud/storage");
const path = require("path");

// 환경 변수에서 Firebase 설정 가져오기
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

// 서비스 계정 키 파일 경로 (Firebase Console에서 다운로드한 JSON 파일)
const keyFilePath = path.join(
  __dirname,
  "./프로젝트명-firebase-adminsdk-xxxxx-xxxxxxxx.json"
  //프로젝트명-firebase-adminsdk-xxxxx-xxxxxxxx.json 지우고 발급받은 파일명을 입력하세요.
);

// cors.json 파일 경로 (CORS 설정 JSON 파일)
const corsConfigPath = path.join(__dirname, "cors.json");

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
  console.log(
    `CORS configuration applied to bucket ${FIREBASE_STORAGE_BUCKET}`
  );
}

setCors().catch(console.error);
```

```javascript
/* app.js 추가내용 */
const cors = require("cors");
app.use(cors());
```
