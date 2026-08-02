import { lazy } from 'react'
import { Routes, Route, Link } from 'react-router'
import { RootLayout } from '../layouts/RootLayout'
import { HomePage } from '../pages/HomePage'
import { projects } from '../data/projects'
import { Meta } from '../components/typography'

const StubPage = lazy(() =>
  import('../pages/stubs/StubPage').then((m) => ({ default: m.StubPage })),
)
const ProductStubPage = lazy(() =>
  import('../pages/stubs/ProductStubPage').then((m) => ({
    default: m.ProductStubPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('../pages/stubs/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="products"
          element={
            <StubPage index="02" title="PRODUCTS">
              <ul className="mt-12 flex flex-col gap-4">
                {projects.map((project) => (
                  <li key={project.slug}>
                    <Meta
                      as={Link}
                      to={`/products/${project.slug}`}
                      className="text-fg transition-colors hover:text-accent"
                    >
                      {project.name} — {project.tagline}
                    </Meta>
                  </li>
                ))}
              </ul>
            </StubPage>
          }
        />
        <Route path="products/:slug" element={<ProductStubPage />} />
        <Route path="lab" element={<StubPage index="03" title="LAB" />} />
        <Route path="system" element={<StubPage index="04" title="SYSTEM" />} />
        <Route path="about" element={<StubPage index="06" title="ABOUT" />} />
        <Route path="contact" element={<StubPage index="07" title="CONTACT" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
