## 배포 명령어

### 빌드
```bash
npm run build
```

### 서버 업로드
```bash
scp -i [키파일경로]\Family-Node.key -r dist ubuntu@134.185.114.212:/home/ubuntu/family-site/frontend/
```

### 백엔드 재시작
```bash
pm2 restart family-backend
```