<script setup>
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useRoleUsers } from '@/composables/useRolUsers'
import { useTypeDocuments } from '@/composables/useTypeDocuments'
import { useUsers } from '@/composables/useUsers'


const { createUser, updateUser, loading } = useUsers()
const { getTypeDocuments, loading: loadingTypeDocuments } = useTypeDocuments()
const { getRoleUsers, loading: loadingRoles } = useRoleUsers()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      role_id: null,
      type_document_id: null,
      document: '',
      name: '',
      email: '',
      password: '',
      phone: '',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const userData = ref({
  id: 0,
  role_id: null,
  type_document_id: null,
  document: '',
  name: '',
  email: '',
  password: '',
  phone: '',
})
const typeDocuments = ref([])
const roles = ref([])


const formUserRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos del usuario
watch(
  () => props.data,
  (newData) => {
    userData.value = { ...newData }
  },
  { immediate: true }
)

//funcion que se lanza al ser montado
onMounted(async () => {
  try {
    const [typeDocs, rolesList] = await Promise.all([
      getTypeDocuments(),
      getRoleUsers(),
    ])
    typeDocuments.value = typeDocs
    roles.value = rolesList
    // console.log('Type Documents loaded:', typeDocuments.value)
  } catch (error) {
    console.error('❌ Error al cargar datos:', error)
  }
})


/**
 * Maneja el envío del formulario.
 * Verifica si el formulario es válido antes de crear o actualizar un usuario.
 */
const onFormSubmit = async () => {
  try {
    // verificar si el formulario es válido
    const isValid = await formUserRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }
    if (userData.value.id > 0) {
      // Actualiza un usuario existente
      await updateUser(userData.value.id, userData.value)
    } else {
      // Crea un nuevo usuario
      const createdUser = await createUser(userData.value)
      userData.value = createdUser
    }
    emit('update:isDialogVisible', false)
    emit('onSaved:data', userData.value)
  } catch (error) {
    console.error('❌ Error al guardar usuario:', error)
  }
}

/**
 * Reinicia el formulario y cierra el diálogo.
 */
const onFormReset = () => {
  userData.value = {
    id: 0,
    role_id: null,
    type_document_id: null,
    document: '',
    name: '',
    email: '',
    password: '',
    phone: '',
  }
  emit('update:isDialogVisible', false)
  emit('update:data', userData.value)
}

/**
 * Maneja el cierre del diálogo y reinicia los datos del usuario.
 * @param {boolean} val - Indica si el diálogo debe estar visible o no.
 */
const dialogModelValueUpdate = (val) => {
  userData.value = {
    id: 0,
    role_id: null,
    type_document_id: null,
    document: '',
    name: '',
    email: '',
    password: '',
    phone: '',
  }
  emit('update:isDialogVisible', val)
  emit('update:data', userData.value)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-4 pa-2">
      <!-- 👉 Title -->
      <VCardTitle>{{ userData.id > 0 ? 'Editar Usuario' : 'Crear Usuario' }}</VCardTitle>
      <VCardText class="pa-2">
        <!-- 👉 Form -->
        <VForm ref="formUserRef"
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Role -->
            <VCol cols="12" md="6">
              <AppSelect
                v-model="userData.role_id"
                label="Rol"
                :items="roles.data" 
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar rol"
              />
            </VCol>

            <!-- 👉 Type Document -->
            <VCol cols="12" md="6">
              <AppSelect
                v-model="userData.type_document_id"
                label="Tipo de Documento"
                :items="typeDocuments.data"
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar tipo de documento"
              />
            </VCol>

            <!-- 👉 Document -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.document"
                label="Documento"
                maxlength="15"
                :rules="[requiredValidator('El Documento')]"
              />
            </VCol>

            <!-- 👉 Name -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.name"
                label="Nombre"
                maxlength="255"
                :rules="[requiredValidator('El Nombre')]"
              />
            </VCol>

            <!-- 👉 Email -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.email"
                label="Email"
                maxlength="255"
                :rules="[requiredValidator('El Email')]"
              />
            </VCol>

            <!-- 👉 Password -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.password"
                label="Contraseña"
                type="password"
                maxlength="255"
                :rules="[requiredValidator('La Contraseña')]"
              />
            </VCol>

            <!-- 👉 Phone -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="userData.phone"
                label="Teléfono"
                maxlength="9"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit" :loading="loading">
                <VIcon
                  start
                  icon="tabler-device-floppy"
                />
                Guardar
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                <VIcon
                  start
                  icon="tabler-x"
                />
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
