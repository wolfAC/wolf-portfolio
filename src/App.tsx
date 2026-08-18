import { Suspense } from 'react'
import { BrowserRouter } from 'react-router'
import { LazyMotion } from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import { AppRoutes } from './router/routes'
import { SplashScreen } from './components/splash/SplashScreen'
import { DebugModeProvider } from './context/DebugModeProvider'
import { SoundProvider } from './context/SoundProvider'
import { QuoteToastProvider } from './context/QuoteToastProvider'
import { getQuote } from './content/quotes'

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation)

// Fires exactly once, on module evaluation (not a React effect, so
// StrictMode's dev double-invoke can't double-print it) — the console
// print "alongside the ASCII logo on load" the spec describes.
const loadQuote = getQuote('load')
if (loadQuote) console.log(loadQuote)

function App() {
  return (
    <ReactLenis root options={{ anchors: true }}>
      <LazyMotion features={loadFeatures} strict>
        <SplashScreen />
        <DebugModeProvider>
          <SoundProvider>
            <QuoteToastProvider>
              <BrowserRouter>
                <Suspense fallback={null}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </QuoteToastProvider>
          </SoundProvider>
        </DebugModeProvider>
      </LazyMotion>
    </ReactLenis>
  )
}

export default App
