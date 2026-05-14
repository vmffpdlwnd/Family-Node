# Backend API Template

이 폴더에는 클라우드 서버 `/home/ubuntu/family-site/backend`에 복사해서 사용할 수 있는 API 라우터 템플릿이 들어 있습니다.

## 적용 방법
1. 서버에서 `/home/ubuntu/family-site/backend` 폴더로 이동
2. 기존 파일을 백업
3. 이 템플릿의 파일을 복사 또는 붙여넣기
4. `npm install express mysql2 dotenv bcrypt jsonwebtoken cors socket.io` 실행
5. PM2로 재시작

## 파일
- `index.js` : Express 서버 진입점
- `db.js` : `.env` 기반 MySQL 연결
- `routes/auth.js` : 로그인/회원가입/JWT 인증
- `routes/posts.js` : 게시판 CRUD
- `routes/schedules.js` : 일정 CRUD
- `routes/chats.js` : 채팅 메시지 CRUD
- `.env.example` : 서버 `.env` 설정 예시
