<template>
  <VCard class="pa-4">
    <VCardTitle>Importar Datos del Escale</VCardTitle>

    <VCardText>
      <div class="mb-4">
        <p>Selecciona un archivo Excel (.xlsx, .xls o .csv). La primera hoja se convertirá a JSON.</p>
      </div>

      <VFileInput
        accept=".xlsx, .xls, .csv"
        label="Archivo Excel"
        show-size
        :disabled="loading"
        :loading="loading"
        @change="onFileChange"
      />

      <div class="mt-3 d-flex gap-2">
        <VBtn
          color="primary"
          :disabled="!jsonData || loadingPromiseAll"
          :loading="loadingPromiseAll"
          @click="batchStoreCatalogs"
        >
          Actualizar Datos
        </VBtn>
      </div>

      <VDivider class="my-4" />

      <div v-if="loading">
        <VProgressLinear
          :value="progress"
          color="success"
          height="8"
          rounded
          :model-value="progress"
        />
        <div class="d-flex justify-space-between mt-2">
          <div>{{ informationWorker }}</div>
          <div>{{ progress }}%</div>
        </div>
      </div>

      <!--
        <div v-else-if="jsonData">
        <strong>Vista previa (primeros 20 registros):</strong>
        <pre class="json-preview">{{ prettyPreview }}</pre>
        </div>
        <div v-else>
        <p class="text-medium-emphasis">
        No hay datos cargados.
        </p>
        </div> 
      -->
    </VCardText>
  </VCard>
</template>

<script setup>
import { useAreaTypeIes } from '@/composables/catalogIEs/useAreaTypeIes'
import { useDREs } from '@/composables/catalogIEs/useDREs'
import { useEducationLevels } from '@/composables/catalogIEs/useEducationLevels'
import { useFormAttentions } from '@/composables/catalogIEs/useFormAttentions'
import { useDetailIEs } from '@/composables/catalogIEs/useIDetailIEs'
import { useIES } from '@/composables/catalogIEs/useIES'
import { useInstitutionCharacteristics } from '@/composables/catalogIEs/useInstitutionCharacteristics'
import { useManagementSectorIes } from '@/composables/catalogIEs/useManagementSectorIes'
import { useManagementTypes } from '@/composables/catalogIEs/useManagementTypes'
import { useProgramTypeIes } from '@/composables/catalogIEs/useProgramTypeIes'
import { useShiftTypeIes } from '@/composables/catalogIEs/useShiftTypeIes'
import { useTypeGenderIes } from '@/composables/catalogIEs/useTypeGenderIes'
import { useUgels } from '@/composables/catalogIEs/useUgels'
import { notify } from '@/plugins/notify'
import ExcelJS from 'exceljs'
import { computed, onMounted, ref } from 'vue'

definePage({
  meta: {
    layout: 'default',
  },
})

//variables de uso para los catalogos de educavite institucion
const { loading: loadingFormAttentions, getFormAttentions, batchStore: batchStoreFormAttentions } = useFormAttentions()
const { loading: loadingAreaType, getAreaTypeIes, batchStore: batchStoreAreaType } = useAreaTypeIes()
const { loading: loadingEducationLevels, getEducationLevels, batchStore: batchStoreEducationLevels } = useEducationLevels()
const { loading: loadingInstitutionCharacteristics, getInstitutionCharacteristics, batchStore: batchStoreInstitutionCharacteristics } = useInstitutionCharacteristics()
const { loading: loadingTypeGender, getTypeGenderIes, batchStore: batchStoreTypeGender } = useTypeGenderIes()
const { loading: loadingManagementTypes, getManagementTypes, batchStore: batchStoreManagementTypes } = useManagementTypes()
const { loading: loadingManagementSector, getManagementSectorIes, batchStore: batchStoreManagementSector } = useManagementSectorIes()
const { loading: loadingProgramType, getProgramTypeIes, batchStore: batchStoreProgramType } = useProgramTypeIes()
const { loading: loadingShiftType, getShiftTypeIes, batchStore: batchStoreShiftType } = useShiftTypeIes()
const { loading: loadingDres, getDREs, batchStore: batchStoreDres } = useDREs()
const { loading: loadingUgels, getUgels, batchStore: batchStoreUgels } = useUgels()
const { loading: loadingIES, getAllIES, batchStore: batchStoreIES, batchUpdate: batchUpdateIES } = useIES()
const { loading: loadingDetails, getDetails, batchStore: batchStoreDetails } = useDetailIEs()

//variables para los catolos de educative institucion de la base de datos
const formAttentionsBack=ref([])
const educationLeveBack=ref([])
const institutionCharacteristicsBack=ref([])
const typeGenderBack=ref([])
const managementTypesBack=ref([])
const managementSectorBack=ref([])
const areaTypeBack=ref([])
const programTypeBack=ref([])
const shiftTypeBack=ref([])
const dresBack=ref([])
const ugelsBack=ref([])
const IESBack=ref([])

//variables para datos del excel
const jsonData = ref(null)
const loading = ref(false)
const informationWorker = ref('Procesando archivo...')
const progress = ref(0)
const formAttentions = ref([])
const educationLevels = ref([])
const institutionCharacteristics = ref([])
const typeGender = ref([])
const managementTypes = ref([])
const managementSector = ref([])
const areaType = ref([])
const programType = ref([])
const shiftType = ref([])
const dres = ref([])
const ugels = ref([])
const IEsData = ref([])
const detailsIEsData = ref([])

//loading general para el promise all
const loadingPromiseAll =computed(() => {
  return loadingFormAttentions.value ||
    loadingAreaType.value ||
    loadingEducationLevels.value ||
    loadingInstitutionCharacteristics.value ||
    loadingTypeGender.value ||
    loadingManagementTypes.value ||
    loadingManagementSector.value ||
    loadingProgramType.value ||
    loadingShiftType.value ||
    loadingDres.value ||
    loadingUgels.value ||
    loadingIES.value
})

//variables para los datos faltantes en la base de datos
const missingFormAttentions = ref([])
const missingEducationLevels = ref([])
const missingInstitutionCharacteristics = ref([])
const missingTypeGender = ref([])
const missingManagementTypes = ref([])
const missingManagementSector = ref([])
const missingAreaType = ref([])
const missingProgramType = ref([])
const missingShiftType = ref([])
const missingDres = ref([])
const missingUgels = ref([])
const missingIES = ref([])

// variable para crear ies
const iesForCreate = ref([])

//variables para cargar actualizar ies
const iesForUpdate = ref([])


//funcion al montar datos
onMounted(async () => {
  await Promise.all([
    getFormAttentions({}, 500, 1).then(data => formAttentionsBack.value = data.data),
    getAreaTypeIes({}, 500, 1).then(data => areaTypeBack.value = data.data),
    getEducationLevels({}, 500, 1).then(data => educationLeveBack.value = data.data),
    getInstitutionCharacteristics({}, 500, 1).then(data => institutionCharacteristicsBack.value = data.data),
    getTypeGenderIes({}, 500, 1).then(data => typeGenderBack.value = data.data),
    getManagementTypes({}, 500, 1).then(data => managementTypesBack.value = data.data),
    getManagementSectorIes({}, 500, 1).then(data => managementSectorBack.value = data.data),
    getProgramTypeIes({}, 500, 1).then(data => programTypeBack.value = data.data),
    getShiftTypeIes({}, 500, 1).then(data => shiftTypeBack.value = data.data),
    getDREs({}, 500, 1).then(data => dresBack.value = data.data),
    getUgels({}, 500, 1).then(data => ugelsBack.value = data.data),
    getAllIES().then(data => IESBack.value = data.data),
  ])

  // imprimir en consola los datos obtenidos de la base de datos
  // console.log('Form Attentions desde BD:', formAttentionsBack.value)
  // console.log('Education Levels desde BD:', educationLeveBack.value)
  // console.log('Institution Characteristics desde BD:', institutionCharacteristicsBack.value)
  // console.log('Type Gender desde BD:', typeGenderBack.value)
  // console.log('Management Types desde BD:', managementTypesBack.value)
  // console.log('Management Sector desde BD:', managementSectorBack.value)
  // console.log('Area Type desde BD:', areaTypeBack.value)
  // console.log('Program Type desde BD:', programTypeBack.value)
  // console.log('Shift Type desde BD:', shiftTypeBack.value)
  // console.log('Dres desde BD:', dresBack.value)
  // console.log('Ugels desde BD:', ugelsBack.value)
  //  console.log('IES desde BD:', IESBack.value)
})

//funcion que compara los arays de catalogos del excel con los de la base de datos
const compareCatalogs = (excelCatalog, dbCatalog, key = 'code') => { // Declara una función flecha que compara dos catálogos; recibe el catálogo del Excel, el catálogo de la BD y la clave a usar (por defecto 'code')
  const missingInDb = [] // Crea un array vacío para recopilar los elementos que están en el Excel pero no en la BD
  for (const item of excelCatalog) { // Recorre cada elemento del catálogo importado desde Excel
    const exists = dbCatalog.some(dbItem => dbItem[key] === item[key]) // Comprueba si en el catálogo de la BD existe algún elemento con el mismo valor en la clave indicada
    if (!exists) { // Si no se encontró coincidencia en la BD...
      missingInDb.push(item) // ...añade el elemento actual a la lista de faltantes
    } // fin del if
  } // fin del for
  
  return missingInDb // Devuelve el array con los elementos que no existen en la BD
} // fin de la fdbIEsunción compareCatalogs


//funcion para el cambio de archivo
const onFileChange = async file => {
  const t0 = performance.now()

  console.log('Archivo recibido en:', new Date().toLocaleString())//fecha y hora del inicio

  // VFileInput puede emitir diferentes formas: File, Array<File>, FileList, o un objeto wrapper.
  const raw = Array.isArray(file) ? file[0] : file
  const f = getFileFromInput(raw)
  if (!f) {
    console.warn('No se recibió un File válido desde el input:', file)
    
    return
  }
  await processFile(f)

  const t1 = performance.now()

  console.log('Archivo procesado:', f.name + ' a las ' + new Date().toLocaleString() )//fecha y hora del fin
  console.log('Tiempo total de procesamiento:', ((t1 - t0) / 1000).toFixed(2), 'segundos')
}

/**
 * funcion que separa ies a guardar e ies ya existentes para modificar
 * @param iesDataArray array de ies a procesar
 * @param existingIesArray array de ies existentes en la base de datos
 * @return {Object} objeto con dos arrays: toCreate (ies a crear) y toUpdate (ies a actualizar) 
 */
const iesStoreAndUpdate = (iesDataArray, existingIesArray) => {
  const toCreate = []
  const toUpdate = []

  const existingIesMap = new Map()
  for (const ies of existingIesArray) {
    existingIesMap.set(ies.modular_code, ies)
  }

  for (const iesData of iesDataArray) {
    const existingIes = existingIesMap.get(iesData.modular_code)
    if (existingIes) {
      // preparar datos para actualización
      const updatedIes = { ...existingIes, ...iesData }

      toUpdate.push(updatedIes)
    } else {
      // preparar datos para creación
      toCreate.push(iesData)
    }
  }

  return { toCreate, toUpdate }
}


/* obtnener lo datos unicos de education level
  de los campos de jsonData
*/
const getFileFromInput = input => {
  if (!input) return null

  // Si el componente emitió un Event nativo (p. ej. change), intentar extraer archivos
  if (typeof Event !== 'undefined' && input instanceof Event) {
    const el = input.target || input.currentTarget
    if (el && el.files && el.files[0]) return el.files[0]

    // Algunos emisores colocan los archivos en detail
    if (input.detail && input.detail.files && input.detail.files[0]) return input.detail.files[0]
    
    return null
  }

  // Ya es una instancia de File
  if (input instanceof File) return input

  // FileList (desde input.files nativo)
  if (typeof FileList !== 'undefined' && input instanceof FileList) return input[0]

  // Algunos componentes envuelven el file en { rawFile } o { file }
  if (input.rawFile && input.rawFile instanceof File) return input.rawFile
  if (input.file && input.file instanceof File) return input.file

  // Si es un objeto con un array files
  if (input.files && input.files[0] instanceof File) return input.files[0]

  // Si es un objeto con 'originFileObj' (estilo ant design)
  if (input.originFileObj && input.originFileObj instanceof File) return input.originFileObj

  // Algunos frameworks emiten un objeto con `files` o `file` dentro de event.detail
  if (input.detail && input.detail.file && input.detail.file instanceof File) return input.detail.file
  if (input.detail && input.detail.files && input.detail.files[0] instanceof File) return input.detail.files[0]

  // Si es un Blob simple
  if (input instanceof Blob) return input
  
  return null
}

const processFile = async file => {
  loading.value = true
  notify.info('Iniciando lectura del archivo...')
  
  try {
    informationWorker.value = 'Iniciando lectura del archivo...'
    progress.value = 0

    // Leer como ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    progress.value = 10

    informationWorker.value = 'Cargando workbook...'

    // Usar ExcelJS con streaming para archivos grandes
    const workbook = new ExcelJS.Workbook()

    await workbook.xlsx.load(arrayBuffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      jsonData.value = []
      
      return
    }

    progress.value = 20
    informationWorker.value = 'Extrayendo cabeceras...'

    // Extraer cabeceras una sola vez
    const headers = []
    const headerRow = worksheet.getRow(1)

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let header = cell.value
      if (header && typeof header === 'object') {
        header = header.text || String(header)
      }
      headers[colNumber] = header ? String(header).trim() : `column_${colNumber}`
    })

    informationWorker.value = 'Procesando filas en lotes...'

    // Procesar filas en chunks para mejor rendimiento
    const CHUNK_SIZE = 500
    const result = []
    const totalRows = worksheet.rowCount - 1
    let processed = 0
    let lastUpdatePercent = 20

    for (let startRow = 2; startRow <= worksheet.rowCount; startRow += CHUNK_SIZE) {
      const endRow = Math.min(startRow + CHUNK_SIZE - 1, worksheet.rowCount)
      
      // Procesar chunk actual
      for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const obj = {}
        let hasData = false

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber]
          if (!header) return

          let value = cell.value
          if (value && typeof value === 'object') {
            value = value.result !== undefined ? value.result : (value.text || value.toString())
          }
          
          if (value !== null && value !== undefined && value !== '') {
            hasData = true
            obj[header] = value
          } else {
            obj[header] = null
          }
        })

        if (hasData) result.push(obj)
        processed++
      }

      // Actualizar UI cada chunk
      const newPercent = 20 + Math.round((processed / totalRows) * 60)
      if (newPercent !== lastUpdatePercent) {
        progress.value = newPercent
        lastUpdatePercent = newPercent
        informationWorker.value = `Procesadas ${processed} de ${totalRows} filas...`
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    progress.value = 85
    informationWorker.value = 'Extrayendo catálogos únicos...'

    // Guardar solo una muestra para preview (liberar memoria)
    jsonData.value = result.slice(0, 50)

    // Procesar filas para agregar campos derivados
    result.forEach(row => {
      // Generar código de DRE si existe CODOOII
      if (row.CODOOII && !row.CODDRE) {
        row.CODDRE = String(row.CODOOII).substring(0, 4)
      }
      
      // Generar local_code si está vacío
      if ((!row.CODLOCAL || row.CODLOCAL === '') && row.NIV_MOD && row.COD_MOD) {
        row.CODLOCAL = `${row.NIV_MOD}${row.COD_MOD}`
      }
    })

    // Extraer catálogos de forma eficiente
    formAttentions.value = extractAndDedupFields(result, ['D_FORMA'], ['name'])
    institutionCharacteristics.value = extractAndDedupFields(result, ['COD_CAR', 'D_COD_CAR'], ['code', 'name'])
    educationLevels.value = extractAndDedupFields(result, ['NIV_MOD', 'D_NIV_MOD'], ['code', 'name'])
    typeGender.value = extractAndDedupFields(result, ['TIPSSEXO', 'D_TIPSSEXO'], ['code', 'name'])
    managementTypes.value = extractAndDedupFields(result, ['GESTION', 'D_GESTION'], ['code', 'name'])
    managementSector.value = extractAndDedupFields(result, ['GES_DEP', 'D_GES_DEP'], ['code', 'name'])
    areaType.value = extractAndDedupFields(result, ['AREA_CENSO', 'DAREACENSO'], ['code', 'name'])
    programType.value = extractAndDedupFields(result, ['TIPOPROG', 'D_TIPOPROG'], ['code', 'name'])
    shiftType.value = extractAndDedupFields(result, ['COD_TUR', 'D_COD_TUR'], ['code', 'name'])
    dres.value = extractAndDedupFields(result, ['D_REGION', 'CODDRE', 'D_DPTO'], ['name', 'code', 'region_name'], ['D_REGION', 'CODDRE'])
    ugels.value = extractAndDedupFields(result, ['CODOOII', 'D_DREUGEL', 'D_PROV'], ['code', 'name', 'province_name'], ['CODOOII'])
      
    //comparar los arrays obtenidos del excel con los de la base de datos
    missingFormAttentions.value = compareCatalogs(formAttentions.value, formAttentionsBack.value, 'name')
    missingEducationLevels.value = compareCatalogs(educationLevels.value, educationLeveBack.value, 'code')
    missingInstitutionCharacteristics.value = compareCatalogs(institutionCharacteristics.value, institutionCharacteristicsBack.value, 'code')
    missingTypeGender.value = compareCatalogs(typeGender.value, typeGenderBack.value, 'code')
    missingManagementTypes.value = compareCatalogs(managementTypes.value, managementTypesBack.value, 'code')
    missingManagementSector.value = compareCatalogs(managementSector.value, managementSectorBack.value, 'code')
    missingAreaType.value = compareCatalogs(areaType.value, areaTypeBack.value, 'code')
    missingProgramType.value = compareCatalogs(programType.value, programTypeBack.value, 'code')
    missingShiftType.value = compareCatalogs(shiftType.value, shiftTypeBack.value, 'code')
    missingDres.value = compareCatalogs(dres.value, dresBack.value, 'code')
    missingUgels.value = compareCatalogs(ugels.value, ugelsBack.value, 'code')
    
    progress.value = 95
    informationWorker.value = 'Preparando datos de IEs...'
      
    // Extraer IEs de forma más eficiente (solo campos necesarios)
    const ieFields = ['COD_MOD',
      'ANEXO',
      'CODLOCAL',
      'CEN_EDU',
      'NIV_MOD',
      'D_FORMA',
      'CODOOII',
      'COD_CAR',
      'TIPSSEXO',
      'GESTION',
      'PAGWEB',
      'DIR_CEN',
      'LOCALIDAD',
      'CODCP_INEI',
      'CODCCPP',
      'CEN_POB',
      'D_DIST',
      'D_PROV',
      'D_DPTO',
      'NLAT_IE',
      'NLONG_IE',
      'TIPOPROG',
      'COD_TUR',
      'NRORUC',
      'RZSOCIAL',
      'PROMOTOR',
      'ESTADO',
      'D_FTE_DATO',
      'FECHA_ACT']
    
    const ieAliases = ['modular_code',
      'anex',
      'local_code',
      'name_ie',
      'NIV_MOD',
      'D_FORMA',
      'CODOOII',
      'COD_CAR',
      'TIPSSEXO',
      'GESTION',
      'web_page',
      'address',
      'localidad',
      'codcp_inei',
      'population_center_code',
      'population_center_name',
      'D_DIST',
      'D_PROV',
      'D_DPTO',
      'latitude_ie',
      'longitude_ie',
      'TIPOPROG',
      'COD_TUR',
      'RUC',
      'rz_social',
      'promotor',
      'status',
      'd_fte_dato',
      'last_update']

    IEsData.value = extractFieldsNoDedup(result, ieFields, ieAliases)
    
    // console.log('Total IEs extraídas:', IEsData.value)

    detailsIEsData.value = extractFieldsNoDedup(result, [
      'COD_MOD', 
      'DIRECTOR', 
      'TELEFONO', 
      'EMAIL', 
      'TALUM_HOM', 
      'TALUM_MUJ', 
      'TALUMNO', 
      'TDOCENTE', 
      'TSECCION',
      'FECHA_ACT',
    ], 
    [
      'modular_code',
      'director',
      'phone',
      'email',
      'total_men',
      'total_women',
      'total_students',
      'total_teachers',
      'total_sections',
      'source',
    ],
    ) 


    // Liberar memoria del resultado completo
    result.length = 0
      
    //imprimir en consola los resultados haciendo una comparacion
    // console.log('Form Attentions :', formAttentions.value, formAttentionsBack.value ,missingFormAttentions.value)
    // console.log('Education Levels :', educationLevels.value, educationLeveBack.value ,missingEducationLevels.value)
    // console.log('Institution Characteristics :', institutionCharacteristics.value, institutionCharacteristicsBack.value ,missingInstitutionCharacteristics.value)
    // console.log('Type Gender    :', typeGender.value, typeGenderBack.value ,missingTypeGender.value)
    // console.log('Management Types :', managementTypes.value, managementTypesBack.value ,missingManagementTypes.value)
    // console.log('Management Sector :', managementSector.value, managementSectorBack.value ,missingManagementSector.value)
    // console.log('Area Type :', areaType.value, areaTypeBack.value ,missingAreaType.value)
    // console.log('Program Type :', programType.value, programTypeBack.value ,missingProgramType.value)
    // console.log('Shift Type :', shiftType.value, shiftTypeBack.value ,missingShiftType.value)
    // console.log('Dres :', dres.value, dresBack.value, missingDres.value)
    // console.log('Ugels :', ugels.value, ugelsBack.value ,missingUgels.value)
    // console.log('IES :', IEsData.value, IESBack.value ,missingIES.value)
    // console.log('detalles de la IEs :', detailsIEsData.value)

    //console.log('registros procesados:', result.length, 'campos extraídos para envío:', formAttentions.value)
  } catch (err) {
    console.error('Error procesando archivo', err)
    jsonData.value = null
    notify.error('Error procesando archivo: ' + (err.message || 'Desconocido'))
  } finally {
    loading.value = false
    progress.value = 100
    informationWorker.value = 'Proceso completado.'
  }
}

const readFileAsArrayBuffer = file => {
  if (file && typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer()
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = e => reject(e)
    reader.readAsArrayBuffer(file)
  })
}


/* funcion para enviar mediante batch los catalogos de la ie que no existan */
const batchStoreCatalogs = async () => {
  const totalStartTime = performance.now()

  loading.value = true
  progress.value = 0
  notify.info('Iniciando sincronización de datos...')

  try {
    // PASO 1: Insertar catálogos independientes en paralelo (10%)
    const catalogsStartTime = performance.now()

    informationWorker.value = 'Sincronizando catálogos básicos...'
    
    const basicCatalogsPromises = []
    
    if (missingFormAttentions.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreFormAttentions({ resources: missingFormAttentions.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            formAttentionsBack.value.push(...items) 
          }),
      )
    }
    if (missingEducationLevels.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreEducationLevels({ resources: missingEducationLevels.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            educationLeveBack.value.push(...items) 
          }),
      )
    }
    if (missingInstitutionCharacteristics.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreInstitutionCharacteristics({ resources: missingInstitutionCharacteristics.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            institutionCharacteristicsBack.value.push(...items) 
          }),
      )
    }
    if (missingTypeGender.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreTypeGender({ resources: missingTypeGender.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            typeGenderBack.value.push(...items) 
          }),
      )
    }
    if (missingManagementTypes.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreManagementTypes({ resources: missingManagementTypes.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            managementTypesBack.value.push(...items) 
          }),
      )
    }
    if (missingManagementSector.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreManagementSector({ resources: missingManagementSector.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            managementSectorBack.value.push(...items) 
          }),
      )
    }
    if (missingAreaType.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreAreaType({ resources: missingAreaType.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            areaTypeBack.value.push(...items) 
          }),
      )
    }
    if (missingProgramType.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreProgramType({ resources: missingProgramType.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            programTypeBack.value.push(...items) 
          }),
      )
    }
    if (missingShiftType.value.length > 0) {
      basicCatalogsPromises.push(
        batchStoreShiftType({ resources: missingShiftType.value })
          .then(data => { 
            const items = Array.isArray(data) ? data : (data.data || [])

            shiftTypeBack.value.push(...items) 
          }),
      )
    }

    await Promise.all(basicCatalogsPromises)

    const catalogsEndTime = performance.now()
    const catalogsDuration = ((catalogsEndTime - catalogsStartTime) / 1000).toFixed(2)

    console.log(`Catálogos básicos sincronizados en ${catalogsDuration}s`)
    notify.success(`Catálogos básicos sincronizados en ${catalogsDuration}s`)
    progress.value = 10

    // PASO 2: Insertar DREs (20%)
    const dresStartTime = performance.now()

    informationWorker.value = 'Sincronizando DREs...'
    
    if (missingDres.value.length > 0) {
      const dresData = await batchStoreDres({ resources: missingDres.value })
      const dresItems = Array.isArray(dresData) ? dresData : (dresData.data || [])

      dresBack.value.push(...dresItems)

      const dresEndTime = performance.now()
      const dresDuration = ((dresEndTime - dresStartTime) / 1000).toFixed(2)

      console.log(`DREs sincronizadas: ${dresItems.length} registros en ${dresDuration}s`)
      notify.success(`DREs sincronizadas: ${dresItems.length} registros`)
    }
    progress.value = 20

    // PASO 3: Insertar UGELs con dre_id (30%)
    const ugelsStartTime = performance.now()

    informationWorker.value = 'Sincronizando UGELs...'
    
    if (missingUgels.value.length > 0) {
      const ugelsWithDreId = findDreCodeForUgels(missingUgels.value, dresBack.value)
      if (ugelsWithDreId.length > 0) {
        const ugelsData = await batchStoreUgels({ resources: ugelsWithDreId })
        const ugelsItems = Array.isArray(ugelsData) ? ugelsData : (ugelsData.data || [])

        ugelsBack.value.push(...ugelsItems)

        const ugelsEndTime = performance.now()
        const ugelsDuration = ((ugelsEndTime - ugelsStartTime) / 1000).toFixed(2)

        console.log(`UGELs sincronizadas: ${ugelsItems.length} registros en ${ugelsDuration}s`)
        notify.success(`UGELs sincronizadas: ${ugelsItems.length} registros`)
      }
    }
    progress.value = 30

    // PASO 4: Preparar IEs con sus relaciones (40%)
    informationWorker.value = 'Preparando IEs con catálogos...'
    
    const preparedIES = prepareIESForStorage(
      IEsData.value,
      formAttentionsBack.value,
      educationLeveBack.value,
      institutionCharacteristicsBack.value,
      typeGenderBack.value,
      managementTypesBack.value,
      managementSectorBack.value,
      areaTypeBack.value,
      programTypeBack.value,
      shiftTypeBack.value,
      ugelsBack.value,
    )

    progress.value = 40

    // console.log('IES preparadas para almacenamiento:', preparedIES)

    // PASO 5: Separar IEs a crear y actualizar (45%)
    informationWorker.value = 'Identificando IEs nuevas y existentes...'
    
    const { toCreate, toUpdate } = iesStoreAndUpdate(preparedIES, IESBack.value)

    iesForCreate.value = toCreate
    iesForUpdate.value = toUpdate
    console.log(`IEs para crear:`, iesForCreate.value, `IEs para actualizar: `, iesForUpdate.value)
    progress.value = 45

    // PASO 6: Crear IEs nuevas (45-75%)
    if (iesForCreate.value.length > 0) {
      const createStartTime = performance.now()

      informationWorker.value = `Creando ${iesForCreate.value.length} nuevas IEs...`
      await storeIEsInChunks(iesForCreate.value, batchStoreIES, 1000, 45, 75)

      const createEndTime = performance.now()
      const createDuration = ((createEndTime - createStartTime) / 1000).toFixed(2)

      console.log(`Creación completada: ${iesForCreate.value.length} IEs en ${createDuration}s (${(iesForCreate.value.length / parseFloat(createDuration)).toFixed(0)} IEs/s)`)
      notify.success(`Creación de IEs completada: ${iesForCreate.value.length} registros`)
    } else {
      progress.value = 75
    }

    //paso 7 una ve que culmine la creacion de ies nuevas proceder a crear los detalles de las ies
    if (detailsIEsData.value.length > 0) {
      const detailsStartTime = performance.now()

      informationWorker.value = `Creando detalles de IEs...`
      await storeDetailIEsInChunks(detailsIEsData.value, batchStoreDetails, 1000, 75, 85)

      const detailsEndTime = performance.now()
      const detailsDuration = ((detailsEndTime - detailsStartTime) / 1000).toFixed(2)

      console.log(`Creación completada: ${detailsIEsData.value.length} detalles de IEs en ${detailsDuration}s`)
      notify.success(`Detalles de IEs guardados: ${detailsIEsData.value.length} registros`)
    } else {
      progress.value = 75
    }


    // PASO 8: Actualizar IEs existentes (75-100%)
    if (iesForUpdate.value.length > 0) {
      const updateStartTime = performance.now()

      informationWorker.value = `Actualizando ${iesForUpdate.value.length} IEs existentes...`
      await storeIEsInChunks(iesForUpdate.value, batchUpdateIES, 500, 75, 100)

      const updateEndTime = performance.now()
      const updateDuration = ((updateEndTime - updateStartTime) / 1000).toFixed(2)

      console.log(`Actualización completada: ${iesForUpdate.value.length} IEs en ${updateDuration}s (${(iesForUpdate.value.length / parseFloat(updateDuration)).toFixed(0)} IEs/s)`)
      notify.success(`Actualización de IEs completada: ${iesForUpdate.value.length} registros`)
    } else {
      progress.value = 100
    }

    const totalEndTime = performance.now()
    const totalDuration = ((totalEndTime - totalStartTime) / 1000).toFixed(2)
    const totalRecords = (iesForCreate.value?.length || 0) + (iesForUpdate.value?.length || 0)

    console.log(`PROCESO TOTAL COMPLETADO en ${totalDuration}s (${totalRecords} IEs procesadas)`)
    informationWorker.value = `Proceso completado en ${totalDuration}s`
    notify.success(`Proceso completado en ${totalDuration}s. ${totalRecords} registros procesados.`)
  } catch (error) {
    console.error('Error en batchStoreCatalogs:', error)
    informationWorker.value = `Error: ${error.message}`
    notify.error('Error en la importación: ' + error.message)
  } finally {
    loading.value = false
  }
}

/* funcion que busca los codigo de las dre para asignar a missinUgel y enviarlos para su guardado*/
const findDreCodeForUgels = (ugelsList, dresList) => {
  return ugelsList.map(ugel => {
    const dre = dresList.find(dreItem => dreItem.code === ugel.code.substring(0, 4)) // Asume que los primeros 4 caracteres del código de UGEL corresponden al código de DRE
    
    return {
      ...ugel,
      dre_id: dre ? dre.id : null, // Asigna el código de la DRE o null si no se encuentra
    }
  })
}

/**
 * funcion que recorre las ies para asignar los ids de los catalogos relacionados y devolver un array listo para el guardado
 * @param {Array} iesList - lista de ies del excel
 * @param {Array} formAttentionsList - lista de formaciones de la base de datos
 * @param {Array} educationLevelsList - lista de niveles educativos de la base de datos
 * @param {Array} institutionCharacteristicsList - lista de caracteristicas de la base de datos
 * @param {Array} typeGenderList - lista de tipos de genero de la base de datos
 * @param {Array} managementTypesList - lista de tipos de gestion de la base de datos
 * @param {Array} managementSectorList - lista de sectores de gestion de la base de datos
 * @param {Array} areaTypeList - lista de tipos de area de la base de datos
 * @param {Array} programTypeList - lista de tipos de programa de la base de datos
 * @param {Array} shiftTypeList - lista de tipos de turno de la base de datos
 * @param {Array} ugelsList - lista de ugels de la base de datos
 * @returns {Array} - lista de ies lista para el guardado
 */
const prepareIESForStorage = (
  iesList,
  formAttentionsList,
  educationLevelsList,
  institutionCharacteristicsList,
  typeGenderList,
  managementTypesList,
  managementSectorList,
  areaTypeList,
  programTypeList,
  shiftTypeList,
  ugelsList,
) => {
  return iesList.map(ie => {
    const formAttention = formAttentionsList.find(item => item.name === ie.D_FORMA)
    const educationLevel = educationLevelsList.find(item => item.code === ie.NIV_MOD)
    const institutionCharacteristic = institutionCharacteristicsList.find(item => item.code === ie.COD_CAR)
    const typeGender = typeGenderList.find(item => item.code === ie.TIPSSEXO)
    const managementType = managementTypesList.find(item => item.code === ie.GESTION)
    const managementSector = managementSectorList.find(item => item.code === ie.GES_DEP)
    const areaType = areaTypeList.find(item => item.code === ie.AREA_CENSO)
    const programType = programTypeList.find(item => item.code === ie.TIPOPROG)
    const shiftType = shiftTypeList.find(item => item.code === ie.COD_TUR)
    const ugel = ugelsList.find(item => item.code === ie.CODOOII)

    return {
      ...ie,
      form_attention_id: formAttention ? formAttention.id : null,
      education_level_id: educationLevel ? educationLevel.id : null,
      institution_characteristic_id: institutionCharacteristic ? institutionCharacteristic.id : null,
      type_gender_id: typeGender ? typeGender.id : null,
      management_type_id: managementType ? managementType.id : null,
      management_sector_id: managementSector ? managementSector.id : null,
      area_type_id: areaType ? areaType.id : null,
      program_type_id: programType ? programType.id : null,
      shift_type_id: shiftType ? shiftType.id : null,
      ugel_id: ugel ? ugel.id : null,
    }
  })
}


/**
 * Extrae los campos indicados de cada objeto del array y devuelve
 * un array de objetos que contienen únicamente esos campos. Además
 * realiza deduplicado por la combinación de campos especificados (mantiene la primera ocurrencia).
 * - data: Array de objetos (filas ya procesadas)
 * - fields: Array de nombres de campo a extraer del Excel
 * - aliases: Opcional. Array paralelo a fields con los nombres que deben tener las claves resultantes.
 * - dedupFields: Opcional. Array de nombres de campo (del Excel) a usar para la deduplicación.
 *                Si no se pasa o está vacío, usa todos los campos de `fields`.
 *                Ejemplo: si fields = ['CODE','NAME','DESC'] y dedupFields = ['CODE'],
 *                         solo el campo CODE se usará para detectar duplicados.
 */
const extractAndDedupFields = (data, fields = [], aliases = [], dedupFields = []) => {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(fields) || fields.length === 0) return []

  const keyFields = Array.isArray(dedupFields) && dedupFields.length > 0 ? dedupFields : fields
  const seen = new Set()
  const out = []
  const aliasMap = aliases.length === fields.length ? aliases : fields

  for (const item of data) {
    // Construir clave de deduplicación optimizada
    const keyParts = []
    let hasAllKeyFields = true
    
    for (const f of keyFields) {
      const v = item[f]

      // Validar que los campos clave no estén vacíos
      if (v == null || v === '' || (typeof v === 'string' && v.trim() === '')) {
        hasAllKeyFields = false
        break
      }
      keyParts.push(String(v).trim().toLowerCase())
    }

    // Omitir si falta algún campo clave o todos los campos clave están vacíos
    if (!hasAllKeyFields || keyParts.length === 0) continue

    const key = keyParts.join('|')
    if (seen.has(key)) continue
    seen.add(key)

    // Construir objeto resultante
    const obj = {}
    let hasValidField = false
    let allFieldsValid = true

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const alias = aliasMap[i]
      const val = item[field]

      // Para catálogos, validar que campos importantes no estén vacíos
      // Si el campo está en keyFields, debe tener valor
      const isKeyField = keyFields.includes(field)
      
      if (isKeyField && (val == null || val === '' || (typeof val === 'string' && val.trim() === ''))) {
        allFieldsValid = false
        break
      }

      if (val != null && val !== '') {
        const trimmedVal = typeof val === 'string' ? val.trim() : val
        if (trimmedVal !== '') {
          obj[alias] = trimmedVal
          hasValidField = true
        }
      }
    }

    // Solo agregar si tiene valores válidos Y todos los campos clave tienen contenido
    if (hasValidField && allFieldsValid) out.push(obj)
  }
  
  return out
}

//extraer IEs SIN deduplicar (solo algunos campos) -----------------
// fields: nombres de columnas en el JSON (ajusta según tu hoja)
// aliases: nombres que quieres en el objeto resultante
const extractFieldsNoDedup = (data, fields = [], aliases = []) => {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(fields) || fields.length === 0) return []
  
  const aliasMap = aliases.length === fields.length ? aliases : fields
  const result = []

  for (const item of data) {
    const obj = {}
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const alias = aliasMap[i]

      obj[alias] = item[field] ?? null
    }
    result.push(obj)
  }
  
  return result
}

// Función para enviar IEsData en lotes (Chunking) con rango de progreso
const storeIEsInChunks = async (items, batchMethod, batchSize = 500, progressStart = 0, progressEnd = 100) => {
  if (!items || items.length === 0) return

  const total = items.length
  const progressRange = progressEnd - progressStart
  let processed = 0
  const chunkStartTime = performance.now()

  for (let i = 0; i < total; i += batchSize) {
    const chunk = items.slice(i, Math.min(i + batchSize, total))
    const payload = { resources: chunk }
    const batchNum = Math.floor(i / batchSize) + 1
    const batchStart = performance.now()

    try {
      await batchMethod(payload)
      processed += chunk.length

      const batchEnd = performance.now()
      const batchDuration = ((batchEnd - batchStart) / 1000).toFixed(2)
      const elapsed = ((batchEnd - chunkStartTime) / 1000).toFixed(1)
      const rate = (processed / (batchEnd - chunkStartTime) * 1000).toFixed(0)

      // Calcular progreso dentro del rango especificado
      const percentComplete = processed / total

      progress.value = Math.round(progressStart + (progressRange * percentComplete))
      informationWorker.value = `Lote ${batchNum}: ${processed}/${total} IEs (${rate} IEs/s, ${elapsed}s transcurridos)`
      
      console.log(`  Lote ${batchNum}: ${chunk.length} IEs en ${batchDuration}s`)
      
      // Pequeña pausa para no saturar
      await new Promise(r => setTimeout(r, 10))
    } catch (err) {
      console.error(`Error enviando lote ${batchNum}:`, err)
      throw err
    }
  }
}

// Función para enviar detalles de la IES en lotes (Chunking) con rango de progreso
const storeDetailIEsInChunks = async (items, batchMethod, batchSize = 500, progressStart = 0, progressEnd = 100) => {
  if (!items || items.length === 0) return

  const total = items.length
  const progressRange = progressEnd - progressStart
  let processed = 0
  const chunkStartTime = performance.now()

  for (let i = 0; i < total; i += batchSize) {
    const chunk = items.slice(i, Math.min(i + batchSize, total))
    const payload = { resources: chunk }
    const batchNum = Math.floor(i / batchSize) + 1
    const batchStart = performance.now()

    try {
      await batchMethod(payload)
      processed += chunk.length

      const batchEnd = performance.now()
      const batchDuration = ((batchEnd - batchStart) / 1000).toFixed(2)
      const elapsed = ((batchEnd - chunkStartTime) / 1000).toFixed(1)
      const rate = (processed / (batchEnd - chunkStartTime) * 1000).toFixed(0)

      // Calcular progreso dentro del rango especificado
      const percentComplete = processed / total

      progress.value = Math.round(progressStart + (progressRange * percentComplete))
      informationWorker.value = `Lote ${batchNum}: ${processed}/${total} IEs (${rate} IEs/s, ${elapsed}s transcurridos)`
      
      console.log(`  Lote  ${batchNum}: ${chunk.length} detalles IEs en ${batchDuration}s`)
      
      // Pequeña pausa para no saturar
      await new Promise(r => setTimeout(r, 10))
    } catch (err) {
      console.error(`❌ Error enviando lote ${batchNum}:`, err)
      throw err
    }
  }
}

const prettyPreview = computed(() => {
  if (!jsonData.value) return ''
  const preview = Array.isArray(jsonData.value) ? jsonData.value.slice(0, 20) : jsonData.value
  
  return JSON.stringify(preview, null, 2)
})


const clear = () => {
  jsonData.value = null
}
</script>

<style scoped>
/* Ajustes simples para que la vista previa se vea bien */
.json-preview {
  overflow: auto;
  padding: 12px;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 13px;
  line-height: 1.4;
  max-block-size: 50vh;
}
</style>
