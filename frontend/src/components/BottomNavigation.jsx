import { Link, useLocation } from 'react-router-dom'
import './BottomNavigation.css'

const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />,
  },
  {
    label: 'Reels',
    path: '/reels',
    icon: <path d="m8 5 11 7-11 7V5Z" />,
  },
  {
    label: 'Saved',
    path: '/saved',
    icon: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />,
  },
  {
    label: 'Profile',
    path: '/user/login',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  },
]

function BottomNavigation() {
  const { pathname } = useLocation()

  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {navigationItems.map((item) => {
        const isCurrent =
          pathname === item.path ||
          (item.label === 'Profile' && pathname === '/user/register')

        return (
          <Link
            className={`bottom-navigation-link${isCurrent ? ' is-current' : ''}`}
            to={item.path}
            aria-current={isCurrent ? 'page' : undefined}
            key={item.path}
          >
            <svg
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNavigation
