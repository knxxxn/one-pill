# 💊 One-Pill (의약품 정보 서비스)

> 사용자가 복용하는 약에 대한 상세 정보를 제공하고, 약물 오남용을 방지하기 위한 맞춤형 의약품 정보 서비스입니다.

<br/>

## 📖 기획 배경
일반인들이 본인이 복용하는 약에 대한 정확한 정보를 쉽게 얻고, 무분별한 약물 오남용을 예방할 수 있도록 돕기 위해 기획되었습니다.

<br/>

## ✨ 주요 기능

### 🔍 약 검색 기능
- 검색한 약의 상세 정보(제약회사, 복용 방법, 주의사항, 보관법 등) 제공
- 관심 있는 약 정보를 개인 리스트에 저장 및 관리

### 🏥 내 근처 약국 찾기
- 카카오맵(Kakao Map) API를 연동하여 현재 위치 기반 실시간 근처 약국 정보 제공
- 약국 상호명 및 전화번호, 위치 확인 가능

### 📝 처방전 저장 및 관리 (OCR)
- 촬영한 처방전 이미지를 업로드하여 내역 저장
- Google Vision AI를 활용한 이미지 내 약품 리스트 자동 인식 및 텍스트 반환
- 반환된 약품 내역을 검색하고 리스트에 저장
- 원하는 기간 내 저장된 처방전 리스트 조회
- 캘린더를 통해 처방전의 복용 기간을 시각적으로 확인

<br/>

## 🛠 기술 스택

### Frontend
| 기술 | 용도 |
| --- | --- |
| React 19.1 | UI 라이브러리 |
| React Router v7 | SPA 라우팅 |
| Tailwind CSS v4 | 글로벌 스타일 및 유틸리티 |
| Chakra UI & Ant Design | UI 컴포넌트 라이브러리 |
| Axios | HTTP 클라이언트 |

### Backend
| 기술 | 용도 |
| --- | --- |
| Spring Boot | REST API 프레임워크 |
| Spring Data JPA | ORM 및 데이터베이스 접근 |
| RestTemplate | 외부 API 허브 및 통신 |

### AI / OCR
| 기술 | 용도 |
| --- | --- |
| Flask | OCR 처리용 가벼운 웹 프레임워크 |
| Google Cloud Vision API | 처방전 이미지 인식 및 텍스트 추출 |

### Open API
| 기술 | 용도 |
| --- | --- |
| Kakao Map API | 지도 및 위치 기반 서비스 |
| 의약품개요정보(e약은요) API | 약품 상세 정보 조회 |

<br/>

## 📂 프로젝트 구조

```bash
one-pill/
├── Frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/          # 공통 UI 컴포넌트
│   │   │   ├── Header.jsx       # 상단 헤더
│   │   │   ├── SearchBar.jsx    # 약 검색 바
│   │   │   └── SlideMenu.jsx    # 슬라이드 메뉴
│   │   ├── contexts/            # 전역 상태 관리
│   │   │   └── AuthContext.jsx  # 인증 상태 관리
│   │   ├── pages/               # 주요 페이지 컴포넌트
│   │   │   ├── LoginPage.jsx    # 로그인
│   │   │   ├── RegisterPage.jsx # 회원가입
│   │   │   ├── Mypage.jsx       # 마이페이지
│   │   │   ├── PillDetailPage.jsx # 약 상세 보기
│   │   │   ├── PharmacyMapPage.jsx # 내 약국 지도
│   │   │   ├── PrescriptionListPage.jsx # 처방전 목록
│   │   │   ├── PrescriptionSearchPage.jsx # 처방전 검색
│   │   │   └── PrescriptionUploadPage.jsx # 처방전 업로드
│   │   ├── styles/              # 글로벌 및 페이지별 스타일
│   │   │   └── common.css       # 공통 css
│   │   ├── App.js               # 최상위 라우팅 설정
│   │   └── index.js             # 엔트리 포인트
│   └── package.json             # 의존성 패키지 관리
│
├── Backend/                     # Spring Boot 백엔드
│   ├── src/main/java/com/example/PILL/
│   │   ├── PillApplication.java # 메인 애플리케이션 클래스
│   │   ├── config/              # CORS, 인터셉터 등 설정
│   │   │   └── WebConfig.java   # 웹 설정 파일
│   │   ├── controller/          # API 컨트롤러 계층
│   │   │   ├── PillController.java # 약 검색, 조회 로직 처리
│   │   │   ├── UserController.java # 회원/로그인 로직 처리
│   │   │   └── MultipartFileResource.java # 이미지 업로드 로직
│   │   ├── entity/              # 영속성 관리용 엔티티
│   │   │   ├── pill/            # 약품 및 처방전 엔티티
│   │   │   └── user/            # 사용자 및 히스토리 엔티티
│   │   ├── dto/                 # 클라이언트 통신용 DTO
│   │   ├── repository/          # 데이터베이스 통신 계층 (JPA)
│   │   └── service/             # 도메인 비즈니스 로직 처리
│   └── settings.gradle          # 빌드 관리 설정
│
└── OCR/                         # Flask 웹 서버
    └── PILL/pill/
        ├── app.py               # Flask 구동 및 라우팅 설정
        └── fast.py              # Vision API 텍스트 추출 로직
```

<br/>

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하려면 각 디렉토리의 가이드를 참고하세요.

### 1. Frontend (React)
```bash
cd Frontend
npm install
npm start
```
- 브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

### 2. Backend (Spring Boot)
- Java 17 이상 권장 (또는 프로젝트 설정에 맞는 버전)
- `Backend` 디렉토리 내의 `gradlew` (또는 `gradlew.bat`)를 사용하여 스프링 애플리케이션을 실행합니다.
```bash
cd Backend
./gradlew bootRun
```

### 3. OCR (Flask)
- Python 3 환경 및 필요 패키지(Flask, Google Cloud Vision 등) 설치 필요
- Google Vision API 인증 키(JSON) 구성 후 플라스크 서버를 실행합니다.


