import { useAuthApp } from '@/composables/useAuthApp';
import { useAuthStore } from '@/stores/useAuthStore';

function transformMenuStructure(arr) {
  return arr.map(item => {
    const transformed = {
      id: item.id,
      title: item.name,
      module_id: item.module_id,
      parent_id: item.parent_id
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

    return { heading: 'Apps & Pages' },transformed;
  });
}

// Exportar una función async que retorne los mains
export async function getMainsMenu() {
  const { getPermissions } = useAuthApp();
  const userPermissions = await getPermissions();
  
  const authStore = useAuthStore();
  authStore.setPermissions(userPermissions);
  
  return transformMenuStructure(userPermissions);
}

export default getMainsMenu;
