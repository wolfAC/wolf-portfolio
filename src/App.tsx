import { Suspense } from 'react'
import { BrowserRouter } from 'react-router'
import { LazyMotion } from 'framer-motion'
import { AppRoutes } from './router/routes'

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation)

function App() {
  return (
    <BrowserRouter>
      <LazyMotion features={loadFeatures} strict>
        <Suspense fallback={null}>
          <AppRoutes />
        </Suspense>
      </LazyMotion>
    </BrowserRouter>
  )
}

export default App
