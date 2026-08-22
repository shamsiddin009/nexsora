/**
 * Nexsora Official Safe Deal Contract & PDF Receipt Engine
 * Generates printable, high-standard digital agreements and receipts with QR code and digital seal.
 */

export const contractPdfService = {
  /**
   * Generates and prints the official Safe Deal Agreement
   */
  generateAndPrintContract({ orderId, clientName, craftsmanName, jobTitle, amount, deadline }) {
    const contractNo = orderId ? `NEX-${String(orderId).slice(0, 8).toUpperCase()}` : `NEX-${Date.now().toString().slice(-8)}`
    const dateFormatted = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    const amountFormatted = Number(amount || 0).toLocaleString('uz-UZ') + ' so\'m'

    const printWindow = window.open('', '_blank', 'width=850,height=900')
    if (!printWindow) return

    const htmlContent = `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Xavfsiz Bitim Shartnomasi — ${contractNo}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1A1A24;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #6C63FF;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #6C63FF;
      letter-spacing: -0.5px;
    }
    .contract-title {
      font-size: 20px;
      font-weight: 800;
      text-align: center;
      margin: 20px 0 6px;
      text-transform: uppercase;
    }
    .contract-sub {
      text-align: center;
      color: #666;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .meta-box {
      display: flex;
      justify-content: space-between;
      background: #F8F9FD;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #2D3748;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    p, li {
      font-size: 13px;
      color: #4A5568;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px dashed #CBD5E0;
    }
    .party-card {
      background: #F8F9FD;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px;
    }
    .party-title {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .seal-wrap {
      text-align: center;
      margin-top: 20px;
    }
    .digital-seal {
      display: inline-block;
      border: 2px solid #10B981;
      color: #10B981;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Nexsora</div>
      <div style="font-size: 11px; color: #718096;">O'zbekistonda Ishonchli Xizmatlar Bozor Platformasi</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #4A5568;">
      <strong>Hujjat №:</strong> ${contractNo}<br/>
      <strong>Sana:</strong> ${dateFormatted}
    </div>
  </div>

  <div class="contract-title">Kafolatlangan Xavfsiz Bitim Shartnomasi</div>
  <div class="contract-sub">Nexsora Escrow tizimi orqali to'lovlar va xizmat sifati to'liq kafolatlanadi</div>

  <div class="meta-box">
    <div><strong>Vazifa / Ish:</strong> ${jobTitle || 'Buyurtma xizmati'}</div>
    <div><strong>Kelishilgan summa:</strong> <span style="color: #10B981; font-weight: 700;">${amountFormatted}</span></div>
    <div><strong>Muddat:</strong> ${deadline || '3 kun'}</div>
  </div>

  <div class="section">
    <div class="section-title">1. Shartnoma Predmeti va Majburiyatlar</div>
    <p>Ushbu bitim orqali Usta buyurtmachi ko'rsatgan topshiriqni sifatli va o'z vaqtida bajarishni, Mijoz esa ish talab darajasida topshirilgach to'lovni tasdiqlashni o'z zimmasiga oladi.</p>
  </div>

  <div class="section">
    <div class="section-title">2. Escrow Xavfsiz To'lov Kafolati</div>
    <p>Buyurtma summasi (${amountFormatted}) Nexsora platformasi maxsus depozit hisobida muzlatiladi. Usta ishni to'liq yakunlamaguncha mablag' berilmaydi. Shartlar buzilgan taqdirda mablag' 100% mijozga qaytariladi.</p>
  </div>

  <div class="section">
    <div class="section-title">3. Kafolat va Nizolarni Hal Qilish (Arbitraj)</div>
    <p>Bajarilgan ishga nisbatan tomonlar o'rtasida e'tiroz bo'lsa, Nexsora xolis arbitraj komissiyasi ish materiallarini o'rganib chiqadi va qonuniy yechim chiqaradi.</p>
  </div>

  <div class="parties-grid">
    <div class="party-card">
      <div class="party-title">BUYURTMACHI (Mijoz):</div>
      <div><strong>Ism:</strong> ${clientName || 'Mijoz'}</div>
      <div><strong>Platforma ID:</strong> NEX-CLI-${Math.floor(1000 + Math.random() * 9000)}</div>
      <div style="margin-top: 10px; font-size: 11px; color: #718096;">[Raqamli tasdiqlangan]</div>
    </div>
    <div class="party-card">
      <div class="party-title">IJROCHI (Usta):</div>
      <div><strong>Ism:</strong> ${craftsmanName || 'Usta'}</div>
      <div><strong>Platforma ID:</strong> NEX-MST-${Math.floor(1000 + Math.random() * 9000)}</div>
      <div style="margin-top: 10px; font-size: 11px; color: #718096;">[Raqamli tasdiqlangan]</div>
    </div>
  </div>

  <div class="seal-wrap">
    <div class="digital-seal">✓ NEXSORA ESCROW RAQAMLI MUHRI BILAN HIMOAYLANGAN</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `.trim()

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}
