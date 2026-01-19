import { defineBoot } from '#q-app/wrappers'
import messages from 'src/i18n'
import { createI18n } from 'vue-i18n'

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: 'es_PE',
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
