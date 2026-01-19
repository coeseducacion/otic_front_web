import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupGuards } from './guards'

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])
    
    return route
  }
  
  // ✅ Guardar el meta original ANTES de setupLayouts
  const originalMeta = route.meta ? { ...route.meta } : {}
  
  // console.log('📋 Meta original de la ruta:', route.path, originalMeta)
  
  // Aplicar layouts
  const layoutRoute = setupLayouts([route])[0]
  
  // ✅ Restaurar/combinar el meta
  if (layoutRoute) {
    layoutRoute.meta = {
      ...layoutRoute.meta,    // Meta del layout (isLayout, etc)
      ...originalMeta,         // Meta original de definePage (public, layout, etc)
    }
    
    // console.log('✅ Meta final de la ruta:', layoutRoute.path, layoutRoute.meta)
  }
  
  return layoutRoute
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }
    
    return { top: 0 }
  },
  extendRoutes: pages => {
    // console.log('📚 Rutas originales:', pages.map(p => ({ path: p.path, meta: p.meta })))
    
    // ✅ Aplicar meta por defecto a rutas que lo necesitan
    const processedPages = pages.map(route => {
      // Si es second-page y no tiene meta, aplicar manualmente
      if (route.path === '/second-page' && !route.meta) {
        route.meta = {
          layout: 'blank',
          public: true,
        }
        // console.log('🔧 Meta aplicado manualmente a /second-page:', route.meta)
      }
      
      return recursiveLayouts(route)
    })
    
    return processedPages
  },
})

// ✅ CONFIGURAR GUARDS
setupGuards(router)

export { router }
export default function (app) {
  app.use(router)
}
