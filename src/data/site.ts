export const site = {
  name: 'WOLF',
  role: 'PRODUCT ENGINEER',
  tagline: 'I BUILD PRODUCTS, NOT JUST WEBSITES.',
  secondary: 'I design and build digital products from idea to production.',
  statusLabel: 'AVAILABLE FOR SELECT PROJECTS',
}

export interface NavItem {
  label: string
  to: string
  /** Present when this item should scroll to an in-page section on the home route. */
  homeHash?: string
}

export const navItems: NavItem[] = [
  { label: 'PRODUCTS', to: '/products', homeHash: '#products' },
  { label: 'LAB', to: '/lab' },
  { label: 'SYSTEM', to: '/system' },
  { label: 'ABOUT', to: '/about' },
  { label: 'CONTACT', to: '/contact' },
]

export interface SocialLink {
  label: string
  href: string
}

export const socialLinks: SocialLink[] = [
  { label: 'GITHUB', href: 'https://github.com/wolfAC' },
  { label: 'EMAIL', href: 'mailto:tharun@byepo.in' },
]
