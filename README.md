# 🏫 학교생활 언어 마스터 (School Life Language Master)

다문화 배경 초등학생을 위한 한국어(학교생활 표현) 학습 웹앱입니다. 게임처럼 즐기면서
"화장실 다녀와도 돼요?", "보건실 다녀와도 돼요?" 같은 실제 학교생활 표현을 배우고,
교사는 대시보드에서 학생들의 학습 현황을 한눈에 관리할 수 있습니다.

**배포 주소**: https://korean-school-app-topaz.vercel.app

## ✨ 주요 기능

### 학생용
- **온보딩 + 실력 진단**: 모국어 선택 → 아바타 선택 → 6문항짜리 짧은 한국어 실력 진단으로 시작 난이도를 자동 설정
- **학습모드**: 단어(번역형/빈칸형) · 문장 타이핑 학습, AI 기반 의미 채점(존댓말/반말, 오타 허용)
- **게임모드**: 상황별 방탈출(인사·수업시간·급식실·보건실·도서관 등 9개 장소), 단어 폭탄 낙하 게임
- **복습모드**: 틀렸던 단어/문장만 모아서 재학습
- **대화모드**: Gemini AI와 상대(친구/선생님)·장소를 설정해 실전 회화 연습, 모국어로 말하면 한국어 번역 자동 표시
- **실천모드**: 실생활에서 직접 말해보는 미션 20종, 완료 시 포인트 지급
- **자기설계학습**: 원하는 상황 + 대화 상대(존댓말 연습 포함)를 직접 골라 학습
- **AI 추천학습**: 자주 틀리는 상황을 분석해 다음 학습을 추천 + AI 학습 피드백
- **꾸미기 상점**: 학습으로 모은 포인트로 액세서리·가구·방 색깔 구매
- **반 친구들**: 같은 반 친구 출석/학습 현황 확인, 응원 메시지 보내기, "오늘의 열심왕" 트로피
- **다국어 지원**: 중국어/영어/베트남어/일본어 — 일본어는 한자에 후리가나(ふりがな) 자동 표시

### 교사용
- 학생 계정 생성(PIN 로그인) 및 PIN 재설정
- 실시간 대시보드(출석/레벨/포인트 현황)
- 학생별 "오늘의 학습" 배정
- 낮은 실력(진단 결과·오답 누적 기준) 학생 표시
- 학생별 AI 대화 기록·친구 응원 메시지 모니터링
- 칭찬 메시지 + 보너스 포인트 전송
- 학생별 성장 기록 리포트 출력(인쇄/PDF)

## 🛠 기술 스택

- **프레임워크**: Next.js 16 (App Router), React 19, TypeScript
- **스타일**: Tailwind CSS v4
- **데이터베이스/인증**: Firebase Firestore (학생 데이터), Firebase Auth (교사 로그인)
- **AI**: Google Gemini API (`gemini-flash-latest`) — 회화 응답, 의미 기반 채점, 학습 피드백
- **배포**: Vercel

## 🚀 로컬 실행 방법

```bash
npm install
```

`.env.local` 파일을 만들고 아래 값을 채워주세요 (Firebase 콘솔 및 Google AI Studio에서 발급):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
```

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속 후:
- **학생으로 체험하기**: 로그인 화면에서 PIN `111111` 입력 (테스트 계정, 기기에만 저장되고 서버에는 남지 않음)
- **교사로 체험하기**: 로그인 화면의 "선생님이신가요?" → 회원가입 후 학생 계정 생성

## 📁 프로젝트 구조

```
src/
  app/            # 라우트별 페이지 (App Router)
    learn/        # 학습모드 (단어/문장/자기설계학습)
    game/         # 게임모드 (방탈출/폭탄게임)
    chat/         # 대화모드
    practice/     # 실천모드
    review/       # 복습모드
    teacher/      # 교사 대시보드/학생 상세/리포트
    api/          # Gemini API 연동 라우트 (chat/grade/feedback)
  components/     # 재사용 UI 컴포넌트
  content/        # 학습 콘텐츠 (단어/문장/미션 등 JSON)
  lib/            # 도메인 로직 (학생 데이터, 채점, 난이도, 번역 등)
  hooks/          # React 훅 (세션, TTS 등)
  types/          # 공용 타입 정의
```

## 배포

```bash
npm run build
vercel deploy --prod
```
