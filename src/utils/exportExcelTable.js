import ExcelJS from 'exceljs'

/**
 * Exporta una tabla a Excel con diseño atractivo
 * @param {Object} options
 * @param {string} options.title - Título del archivo y hoja
 * @param {Array<{title: string, key: string}>} options.columns - Columnas a mostrar (title: encabezado, key: propiedad del objeto)
 * @param {Array<Object>} options.data - Datos a mostrar (array de objetos)
 */
export async function exportExcelTable({ title = 'Tabla', columns = [], data = [] }) {
  if (!columns.length || !data.length) {
    alert('No hay datos para exportar')
    return
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title)

  // Estilo general
  sheet.properties.defaultRowHeight = 22
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  // Función para obtener valores anidados (e.g., "role.name")
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key] ? acc[key] : '', obj)
  }

  // Encabezados
  sheet.columns = columns.map(col => ({
    header: col.title,
    key: col.key,
    width: 30,
    style: { font: { name: 'Segoe UI', size: 12 } }
  }))

  // Agregar datos
  data.forEach(row => {
    sheet.addRow(columns.reduce((acc, col) => {
      acc[col.key] = getNestedValue(row, col.key) ?? ''
      return acc
    }, {}))
  })

  // Estilo de encabezado
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13 }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } }
    }
  })

  // Estilo de filas alternas
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      row.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCFD8DC' } },
          left: { style: 'thin', color: { argb: 'FFCFD8DC' } },
          bottom: { style: 'thin', color: { argb: 'FFCFD8DC' } },
          right: { style: 'thin', color: { argb: 'FFCFD8DC' } }
        }
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F7FA' }
          }
        }
      })
    }
  })

  // Descargar archivo
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
