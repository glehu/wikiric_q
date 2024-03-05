import { boot } from 'quasar/wrappers'
import { useRouter } from 'vue-router'
import 'virtual:uno.css'
import WikiricSdk from 'src/libs/wikiric-sdk'

export default boot(({ app }) => {
  app.config.globalProperties.$router = useRouter()
  app.config.globalProperties.$connector = WikiricSdk
})
