import { Suspense } from 'react'
import { BrowserRouter } from 'react-router'
import { LazyMotion } from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import { AppRoutes } from './router/routes'
import { SplashScreen } from './components/splash/SplashScreen'

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation)

function App() {
  return (
    <ReactLenis root options={{ anchors: true }}>
      <LazyMotion features={loadFeatures} strict>
        <SplashScreen />
        <BrowserRouter>
          <Suspense fallback={null}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </LazyMotion>
    </ReactLenis>
  )
}

export default App
