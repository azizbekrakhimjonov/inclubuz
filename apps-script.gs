/* =====================================================================
   inclub.uz — Google Sheets ga ro'yxatdan o'tish ma'lumotlarini yozish
   =====================================================================

   QANDAY ULASH KERAK (bir martalik sozlash):

   1. Google Sheets faylingizni oching:
      https://docs.google.com/spreadsheets/d/1E8eDMkWxIlM4az3Qvek1izXDCtK_1rr03ysbApJw-HU/edit

   2. Yuqoridagi menyudan:  Extensions (Kengaytmalar) → Apps Script
      yangi oyna ochiladi.

   3. U yerdagi barcha kodni o'chirib, SHU FAYLDAGI kodni nusxalab joylang.

   4. Yuqoridan "Deploy" (Joylashtirish) → "New deployment" tugmasini bosing.
        - Type (turi): "Web app"
        - Description: inclub form
        - Execute as: "Me" (o'zim)
        - Who has access: "Anyone" (Hamma)
      "Deploy" tugmasini bosing va ruxsat (authorize) bering.

   5. Sizga "Web app URL" beriladi (https://script.google.com/macros/s/.../exec).
      Shu URL ni nusxalang.

   6. app.js faylida quyidagi qatorni toping va URL ni qo'ying:
        const SHEETS_ENDPOINT = "";   ← shu yerga URL ni qo'ying.

   Tayyor! Endi har bir ariza avtomatik jadvalga yoziladi.
   ===================================================================== */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);

    // Sarlavhalar bo'sh bo'lsa — birinchi qatorni qo'shamiz
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Vaqt', 'Ism', 'Familiya', 'Telefon', "Yo'nalish", 'Izoh']);
    }

    sheet.appendRow([
      data.vaqt || new Date().toLocaleString(),
      data.ism || '',
      data.familiya || '',
      "'" + (data.telefon || ''),  // ' belgisi raqamni matn sifatida saqlaydi
      data.yonalish || '',
      data.izoh || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('inclub form endpoint ishlayapti');
}
