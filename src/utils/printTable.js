/**
 * Imprime una tabla HTML elegante con los datos proporcionados
 * @param {string} title - Título a mostrar arriba de la tabla
 * @param {Array<{title: string, key: string}>} columns - Columnas a mostrar (title: encabezado, key: propiedad del objeto)
 * @param {Array<Object>} data - Datos a mostrar (array de objetos)
 */
export function printTable({ title = 'Tabla', columns = [], data = [] }) {
  if (!columns.length || !data.length) {
    alert('No hay datos para imprimir')
    return
  }

  // Función para obtener valores anidados (e.g., "role.name")
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key] ? acc[key] : '', obj)
  }

  // Construir el HTML de la tabla
  let tableHTML = `
    <table class="print-table">
      <thead>
        <tr>
          ${columns.map(col => `<th>${col.title}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${columns.map(col => `<td>${getNestedValue(row, col.key)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  // Abrir ventana de impresión con estilos elegantes
  const printWindow = window.open('', '', 'width=900,height=700')
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px; }
          h2 { text-align: center; margin-bottom: 24px; }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .print-table th, .print-table td {
            border: 1px solid #e0e0e0;
            padding: 5px;
            text-align: left;
            font-size: 0.85rem;
          }
          .print-table th {
            background: #1976d2;
            color: #fff;
            font-weight: 600;
            font-size: 0.9rem;
          }
          .print-table tr:nth-child(even) {
            background: #f5f7fa;
          }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        ${tableHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        <\/script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
