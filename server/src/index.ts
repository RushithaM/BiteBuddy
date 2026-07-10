import { app } from './app'
import { PORT } from './env'

app.listen(PORT, () => {
  console.log(`bitebuddy-server listening on http://localhost:${PORT}`)
})
