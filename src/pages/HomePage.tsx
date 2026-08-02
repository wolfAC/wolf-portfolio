import { Hero } from '../components/hero/Hero'
import { IntroSection } from '../components/intro/IntroSection'
import { ProductsPreview } from '../components/products/ProductsPreview'
import { CurrentlyBuilding } from '../components/currently-building/CurrentlyBuilding'
import { useHashScroll } from '../hooks/useHashScroll'

export function HomePage() {
  useHashScroll()

  return (
    <>
      <Hero />
      <IntroSection />
      <ProductsPreview />
      <CurrentlyBuilding />
    </>
  )
}
