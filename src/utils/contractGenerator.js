import { formatPrice, formatDate } from '../utils'


export function generateContractHtml({
  contractNumber = 'NX-AGR-' + Math.floor(100000 + Math.random() * 900000),
  dealDate = new Date().toISOString(),
  jobTitle = 'Xizmat ko\'rsatish va montaj ishlari',
  amount = 0,
  warrantyDays = 30,
  deadlineDays = 3,
  clientName = 'Mijoz',
  clientPhone = '+998 90 000 00 00',
  craftsmanName = 'Usta',
  craftsmanPhone = '+998 90 111 11 11',
  craftsmanCategory = 'Mutaxassis'
}) {
  return `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <title>Nexsora Kafolatli Shartnoma #${contractNumber}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a24;
          line-height: 1.5;
          margin: 0;
          padding: 24px;
          background: #ffffff;
        }
        .contract-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #6C63FF;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-box h1 {
          color: #6C63FF;
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .logo-box p {
          margin: 2px 0 0;
          font-size: 11px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .doc-meta {
          text-align: right;
          font-size: 12px;
          color: #495057;
        }
        .doc-title-block {
          text-align: center;
          margin-bottom: 24px;
        }
        .doc-title-block h2 {
          margin: 0;
          font-size: 18px;
          color: #1a1a24;
        }
        .doc-title-block span {
          font-size: 13px;
          color: #6c757d;
        }
        .parties-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .parties-table th {
          background: #f8f9fa;
          text-align: left;
          padding: 10px 14px;
          font-size: 12px;
          border: 1px solid #dee2e6;
          color: #495057;
        }
        .parties-table td {
          padding: 10px 14px;
          border: 1px solid #dee2e6;
          font-size: 13px;
        }
        .deal-specs {
          background: #fdfdfd;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .spec-item {
          font-size: 13px;
        }
        .spec-label {
          color: #6c757d;
          display: block;
          font-size: 11px;
          text-transform: uppercase;
        }
        .spec-val {
          font-weight: 700;
          color: #1a1a24;
        }
        .spec-val.price {
          color: #10B981;
          font-size: 16px;
        }
        .terms-block {
          font-size: 11.5px;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .terms-block h4 {
          margin: 0 0 6px;
          font-size: 13px;
          color: #1a1a24;
        }
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px dashed #dee2e6;
        }
        .sign-box {
          font-size: 12px;
        }
        .sign-box strong {
          display: block;
          margin-bottom: 4px;
        }
        .sign-line {
          margin-top: 28px;
          border-bottom: 1px solid #1a1a24;
          font-size: 11px;
          color: #6c757d;
          padding-top: 4px;
        }
        .seal-box {
          border: 2px dashed #6C63FF;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          color: #6C63FF;
          font-weight: 700;
          font-size: 11px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="contract-header">
        <div class="logo-box">
          <h1>NEXSORA</h1>
          <p>Xavfsiz Escrow Kafolat Markazi</p>
        </div>
        <div class="doc-meta">
          <div><strong>Shartnoma №:</strong> ${contractNumber}</div>
          <div><strong>Sana:</strong> ${formatDate(dealDate)}</div>
          <div><strong>Holati:</strong> Escrow Muzlatilgan 🛡️</div>
        </div>
      </div>

      <div class="doc-title-block">
        <h2>XIZMAT KO'RSATISH VA KAFOLAT SHARTNOMASI</h2>
        <span>Nexsora platformasi orqali elektron imzolangan va tasdiqlangan</span>
      </div>

      <table class="parties-table">
        <tr>
          <th width="50%">1. BUYURTMACHI (MIJOZ)</th>
          <th width="50%">2. IJROCHI (USTA / MUTAXASSIS)</th>
        </tr>
        <tr>
          <td>
            <strong>Ism:</strong> ${clientName}<br>
            <strong>Telefon:</strong> ${clientPhone}
          </td>
          <td>
            <strong>Ism:</strong> ${craftsmanName}<br>
            <strong>Soha:</strong> ${craftsmanCategory}<br>
            <strong>Telefon:</strong> ${craftsmanPhone}
          </td>
        </tr>
      </table>

      <div class="deal-specs">
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Bitim Predmeti (Ish nomi):</span>
            <span class="spec-val">${jobTitle}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Bitim Summasi (Escrow):</span>
            <span class="spec-val price">${formatPrice(amount)}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Bajarish Muddati:</span>
            <span class="spec-val">${deadlineDays} kun</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Usta Kafolat Muddati:</span>
            <span class="spec-val">🛡️ ${warrantyDays} kunlik bepul kafolat</span>
          </div>
        </div>
      </div>

      <div class="terms-block">
        <h4>Asosiy Shartlar va Majburiyatlar:</h4>
        <ol>
          <li>Ijrochi (Usta) ishlarni sifatli, belgilangan ${deadlineDays} kun muddat ichida to'liq yakunlash majburiyatini oladi.</li>
          <li>Mablag' (${formatPrice(amount)}) buyurtmachi tomonidan to'liq kiritilgan va Nexsora Escrow tranzit hisobida xavfsiz muzlatilgan. Ish yakunlanib mijoz tasdiqlamaguncha ustaga o'tkazilmaydi.</li>
          <li>Ish topshirilgandan so'ng ${warrantyDays} kun davomida kelib chiqqan nuqsonlar Usta tomonidan bepul bartaraf etiladi.</li>
          <li>Kelishmovchilik yuzaga kelganda, tomonlar Nexsora Arbitraj xizmatiga murojaat qilish huquqiga ega.</li>
        </ol>
      </div>

      <div class="signatures-grid">
        <div class="sign-box">
          <strong>Buyurtmachi:</strong>
          <span>${clientName}</span>
          <div class="sign-line">Elektron tasdiqlangan (OTP)</div>
        </div>
        <div class="sign-box">
          <strong>Ijrochi Usta:</strong>
          <span>${craftsmanName}</span>
          <div class="sign-line">Elektron tasdiqlangan (OTP)</div>
        </div>
        <div class="seal-box">
          NEXSORA ESCROW<br>
          KAFOLAT MUHRI ✅<br>
          <small>ID: ${contractNumber.slice(-6)}</small>
        </div>
      </div>
    </body>
    </html>
  `
}

export function openAndPrintContract(dealDetails) {
  const html = generateContractHtml(dealDetails)
  const printWindow = window.open('', '_blank', 'width=850,height=900')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 400)
  }
}
