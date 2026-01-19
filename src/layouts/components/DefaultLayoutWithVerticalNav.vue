<script setup>
import { useAuthApp } from '@/composables/useAuthApp';
import { themeConfig } from '@themeConfig';

// Components
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import UserProfile from '@/layouts/components/UserProfile.vue';
import NavBarI18n from '@core/components/I18n.vue';

// @layouts plugin
import { VerticalNavLayout } from '@layouts';
import { onMounted } from 'vue';

const { getPermissions, loading } = useAuthApp();

const navItems = ref([]);

const transformMenuStructure = (arr = []) => {
  return arr.map(item => {
    const transformed = {
      id: item.id,
      title: item.name,
      module_id: item.module_id,
      parent_id: item.parent_id,
    };

    if (item.icon) {
      transformed.icon = { icon: item.icon };
    }

    if (item.main_options && item.main_options.length > 0) {
      transformed.main_options = item.main_options;
    }

    if (item.route) {
      if (!item.children || item.children.length === 0) {
        transformed.to = { name: item.route };
      }
    }

    if (item.children && item.children.length > 0) {
      transformed.children = transformMenuStructure(item.children);
    }

    return transformed;
  });
};

onMounted(async () => {
  const userPermissions = await getPermissions();
  navItems.value = transformMenuStructure(userPermissions);
});

</script>

<template>
  
  <VerticalNavLayout :nav-items="navItems" :loading="loading"  >
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        
        <h3 class="text-white" style="font-weight: 400;">Sistema Integrado de Defensa Nacional y Gestion de Riesgos y Desastres </h3>
        <VSpacer />

        <NavbarThemeSwitcher />
        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <UserProfile />
      </div>
      
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <!-- <template #footer>
      <Footer />
    </template> -->

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
     
  </VerticalNavLayout>
</template>
