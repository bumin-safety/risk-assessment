# 수시 위험성평가 AI 자동화 시스템

부민병원그룹 - 산업안전보건법 / KOSHA 가이드 기반 AI 위험성평가 도구

🔗 **배포 위치:** https://buminhealth.github.io/bumin-safety/

## 📦 파일 구성

| 파일 | 용도 | 위치 |
|---|---|---|
| `index.html` | 메인 웹앱 (단일 파일) | `bumin-safety` 저장소 루트 |
| `Code.gs` | Google Apps Script (이메일 PDF 첨부 발송) | Apps Script 프로젝트에 붙여넣기 |
| `README.md` | 본 안내서 | `bumin-safety` 저장소 루트 |

## 🚀 배포 순서 (10분 소요)

### 1️⃣ GitHub 저장소 생성 및 파일 업로드
```
1. github.com/buminhealth 에서 새 저장소 생성
   - 저장소명: bumin-safety
   - Public (GitHub Pages 무료 사용)
2. 저장소 루트에 index.html, README.md 업로드
3. Settings → Pages → Source: "Deploy from a branch" → main / root → Save
4. 1~2분 후 https://buminhealth.github.io/bumin-safety/ 접속 확인
```

### 2️⃣ Google Apps Script 배포 (이메일 발송용)
1. https://script.google.com → **새 프로젝트**
2. 프로젝트명: `bumin-safety-mail` 등으로 변경
3. `Code.gs` 내용 전체 복사·붙여넣기
4. 좌측 상단 **저장**(💾)
5. 함수 선택에서 `testSend` 선택 → **실행** → 권한 승인 → 본인 메일 도착 확인
6. 우측 상단 **배포 → 새 배포**
   - 유형: **웹 앱**
   - 설명: `bumin-safety v1`
   - 실행 계정: **나**
   - 액세스 권한: **모든 사용자**
7. **배포** → 발급된 웹 앱 URL 복사
   - 형태: `https://script.google.com/macros/s/AKfycby.../exec`

### 3️⃣ index.html 설정값 입력
파일 상단 `CONFIG` 객체의 값을 채우고 저장소에 다시 푸시:

```javascript
const CONFIG = {
  CLAUDE_API_KEY: 'sk-ant-...',          // ① Claude API 키
  CLAUDE_MODEL:   'claude-sonnet-4-5-20250929',
  GAS_API_URL:    'https://script.google.com/macros/s/.../exec',  // ② GAS 웹앱 URL
  DEFAULT_EMAIL:  'bumini@buminhospital.co.kr'    // ③ 기본 발송 이메일
};
```

> 💡 **CLAUDE_API_KEY 운영 팁**
> - **사내 공용 1키:** 코드에 박아넣어서 사용 (관리 편함, 사용량 한도 공유)
> - **개인별 키:** 빈 문자열로 두면 각자 브라우저 로컬에 본인 키 저장 (책임 분산)

## 🧪 사용 흐름

```
[현장 사진 업로드] → [기본정보·체감위험도 입력]
        ↓
[AI 위험성평가 분석 시작]
        ↓
Claude API (multimodal, KOSHA 빈도강도법)
        ↓
┌─────────────────────────────────┐
│ 개선전 점수 9점(중간)              │
│ 개선후 예상 4점(낮음)              │
│ 빈도강도 매트릭스                  │
│ 위험원인 / 즉시조치 / 중장기 / 법규  │
│ 개선효과 요약 (감소율, 등급변화)    │
└─────────────────────────────────┘
        ↓
[PDF 저장] 또는 [이메일 제출 → 첨부 발송]
```

## 🔧 동작 원리

- **AI 분석:** Claude API에 사진(base64) + 입력값 + KOSHA 빈도강도법 프롬프트 전송 → 구조화 JSON 응답
- **위험점수:** 빈도(1~5) × 강도(1~5) = 1~25점
  - 1~4점 = **낮음** / 5~12점 = **중간** / 13~25점 = **높음**
- **PDF 생성:** `html2canvas` + `jsPDF` (CDN 직접 로드)
- **이메일 발송:** PDF → base64 → GAS `MailApp.sendEmail` → 첨부 발송
- **CORS:** GAS 호출시 `Content-Type: text/plain` 으로 preflight 우회

## ✅ 배포 체크리스트

- [ ] `bumin-safety` 저장소 생성 (Public)
- [ ] `index.html`, `README.md` 업로드
- [ ] GitHub Pages 활성화 (Settings → Pages → main branch)
- [ ] https://buminhealth.github.io/bumin-safety/ 접속 확인
- [ ] GAS 프로젝트 생성 + `Code.gs` 붙여넣기
- [ ] `testSend` 실행하여 권한 승인 + 메일 도착 확인
- [ ] GAS 웹 앱 배포 → URL 복사
- [ ] `index.html`의 `CONFIG` 3개 값 입력 후 재푸시
- [ ] 실제 사진으로 분석 → PDF 저장 → 이메일 제출 전체 흐름 테스트

## 🔄 업데이트 시 주의

GAS 코드를 수정하면 **반드시 "새 배포"가 아닌 "배포 관리 → 수정 → 새 버전"으로 배포**해야 기존 URL이 유지됩니다. 새 배포로 만들면 URL이 바뀌어 `index.html`도 같이 수정해야 합니다.

## 📚 참고 - KOSHA 빈도강도법 기준 (코드 반영됨)

**빈도(가능성)**
- 1점 거의없음 (연 1회 미만)
- 2점 낮음 (연 1~2회)
- 3점 보통 (월 1회)
- 4점 높음 (주 1회)
- 5점 매우높음 (매일)

**강도(심각성)**
- 1점 경미 (응급처치)
- 2점 약간 (1~3일 휴업)
- 3점 보통 (4일~1개월 휴업)
- 4점 심각 (1개월 이상, 영구장해 가능)
- 5점 치명적 (사망/영구장해)

## 🔐 보안 주의사항

- `CLAUDE_API_KEY`를 코드에 박아넣을 경우 **Public 저장소면 키가 공개됨**
- 대안:
  1. `CLAUDE_API_KEY: ''` 로 비워두고 직원별 본인 키 입력 방식 사용 (권장)
  2. Private 저장소 + 다른 호스팅 검토 (예: Cloudflare Pages는 Private 가능)
  3. GAS를 프록시로 활용해 Claude API 호출도 GAS 경유 (키를 GAS에 보관) — 필요 시 별도 요청
