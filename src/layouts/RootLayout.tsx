import { Outlet } from 'react-router'
import { SiteNav } from '../components/nav/SiteNav'
import { SiteFooter } from '../components/footer/SiteFooter'
import { PageTransition } from '../components/motion/PageTransition'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main-content" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <SiteFooter />
    </div>
  )
}
