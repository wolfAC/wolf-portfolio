import { Suspense } from 'react'
import { BrowserRouter } from 'react-router'
import { AppRoutes } from './router/routes'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
