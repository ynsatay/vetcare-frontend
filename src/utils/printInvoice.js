export function printInvoice({ invNo, invDate, invType, stocks }) {
  const INV_TYPES = [
    { value: 1, label: "Alım" },
    { value: 2, label: "İade" },
    { value: 3, label: "Tüketim" },
  ];

  const invTypeLabel = INV_TYPES.find(t => t.value === Number(invType))?.label || '';
  const total = stocks.reduce((acc, s) => acc + (s.price * s.quantity), 0).toFixed(2);

  const printContent = `
    <html>
      <head>
        <title>Stok Fatura</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
          }
          h2 {
            text-align: center;
            margin-bottom: 10px;
          }
          p {
            margin: 4px 0;
          }
          .info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          td:nth-child(4),
          td:nth-child(5) {
            text-align: right;
          }
          tfoot td {
            font-weight: bold;
            background-color: #fafafa;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
              font-size: 12pt;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h2>Stok Faturası</h2>
        <div class="info">
          <p><strong>Fatura No:</strong> ${invNo}</p>
          <p><strong>Tarih:</strong> ${invDate}</p>
          <p><strong>İşlem Tipi:</strong> ${invTypeLabel}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Stok Adı</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${stocks.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${s.name}</td>
                <td>${s.quantity}</td>
                <td>${Number(s.price).toFixed(2)} ₺</td>
                <td>${(Number(s.price) * Number(s.quantity)).toFixed(2)} ₺</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right;">Genel Toplam</td>
              <td>${total} ₺</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=700');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  // printWindow.close(); // Eğer otomatik kapanmasını istiyorsan aç
}
