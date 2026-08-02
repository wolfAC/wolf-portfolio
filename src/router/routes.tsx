import { lazy } from 'react'
import { Routes, Route } from 'react-router'
import { RootLayout } from '../layouts/RootLayout'
import { HomePage } from '../pages/HomePage'

const StubPage = lazy(() =>
  import('../pages/stubs/StubPage').then((m) => ({ default: m.StubPage })),
)
const ProductsIndexPage = lazy(() =>
  import('../pages/ProductsIndexPage').then((m) => ({
    default: m.ProductsIndexPage,
  })),
)
const ProductDetailPage = lazy(() =>
  import('../pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  })),
)
const AleayPage = lazy(() =>
  import('../pages/AleayPage').then((m) => ({ default: m.AleayPage })),
)
const CarcaranPage = lazy(() =>
  import('../pages/CarcaranPage').then((m) => ({ default: m.CarcaranPage })),
)
const PulsePage = lazy(() =>
  import('../pages/PulsePage').then((m) => ({ default: m.PulsePage })),
)
const NotFoundPage = lazy(() =>
  import('../pages/stubs/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsIndexPage />} />
        <Route path="products/aleay" element={<AleayPage />} />
        <Route path="products/carcaran" element={<CarcaranPage />} />
        <Route path="products/pulse" element={<PulsePage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="lab" element={<StubPage index="03" title="LAB" />} />
        <Route path="system" element={<StubPage index="04" title="SYSTEM" />} />
        <Route path="about" element={<StubPage index="06" title="ABOUT" />} />
        <Route path="contact" element={<StubPage index="07" title="CONTACT" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
