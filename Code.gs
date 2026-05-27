/**
 * 부민병원그룹 - 수시 위험성평가 이메일 발송 GAS
 *
 * 사용 방법:
 * 1. https://script.google.com 접속 → "새 프로젝트"
 * 2. 아래 코드를 모두 붙여넣기
 * 3. 저장 후 "배포" → "새 배포" → 유형: 웹 앱
 *    - 실행 계정: 본인
 *    - 액세스 권한: "모든 사용자" (또는 도메인 내)
 * 4. 배포 → 권한 승인 → 발급된 웹 앱 URL 복사
 * 5. index.html 상단 CONFIG.GAS_API_URL 에 붙여넣기
 *
 * 주의:
 * - GAS 계정의 일일 이메일 발송 한도 (Gmail 일반: 100건/일, Workspace: 1,500건/일)
 * - 첨부 PDF는 base64 → Blob 변환하여 발송
 */

function doPost(e) {
  try {
    // CORS 우회를 위해 text/plain 으로 받음
    const data = JSON.parse(e.postData.contents);

    const to       = data.to;
    const subject  = data.subject || '[수시 위험성평가] 결과 보고서';
    const body     = data.body || '위험성평가 결과를 첨부하여 송부합니다.';
    const pdfB64   = data.pdfBase64;
    const filename = data.filename || 'risk_assessment.pdf';

    if (!to) throw new Error('수신 이메일 주소가 없습니다');
    if (!pdfB64) throw new Error('PDF 데이터가 없습니다');

    // base64 → Blob
    const pdfBlob = Utilities.newBlob(
      Utilities.base64Decode(pdfB64),
      'application/pdf',
      filename
    );

    // 이메일 발송
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      attachments: [pdfBlob],
      name: '부민병원그룹 Safety Management System'
    });

    // 발송 로그 (선택: 시트에 기록)
    logSend_(to, subject, filename);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '발송 완료' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: '수시 위험성평가 이메일 발송 API',
      method: 'POST only'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 발송 이력을 스프레드시트에 기록 (선택)
 * 사용하지 않으려면 함수 내부를 비워두거나 삭제해도 무방
 */
function logSend_(to, subject, filename) {
  try {
    // 스크립트 속성에 SHEET_ID를 설정해두면 자동 로깅
    // PropertiesService.getScriptProperties().setProperty('SHEET_ID','xxxx');
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) return;
    const sh = SpreadsheetApp.openById(sheetId).getActiveSheet();
    sh.appendRow([new Date(), to, subject, filename]);
  } catch (e) {
    // 로깅 실패는 무시
  }
}

/**
 * 테스트용 - 스크립트 에디터에서 한 번 실행하여 권한 승인
 */
function testSend() {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: '[테스트] 위험성평가 GAS 발송 테스트',
    body: '이 메일이 도착했다면 GAS 설정이 정상입니다.'
  });
}
