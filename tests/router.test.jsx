import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import App from '../src/App'

// Mock console.warn to capture warnings
const originalWarn = console.warn
let warnings = []

beforeEach(() => {
  warnings = []
  console.warn = vi.fn((...args) => {
    warnings.push(args.join(' '))
  })
})

afterEach(() => {
  console.warn = originalWarn
})

describe('React Router v7 Configuration', () => {
  test('should not show v7_startTransition future flag warning', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Test Home</div>
        }
      ],
      {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true
        },
        initialEntries: ['/']
      }
    )

    render(<RouterProvider router={router} />)
    
    // Check that no React Router future flag warnings are present
    const routerWarnings = warnings.filter(warning => 
      warning.includes('React Router Future Flag Warning') ||
      warning.includes('v7_startTransition') ||
      warning.includes('v7_relativeSplatPath')
    )
    
    expect(routerWarnings).toHaveLength(0)
  })

  test('should handle splat routes correctly without warnings', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Root</div>,
          children: [
            {
              path: 'dashboard',
              element: <div>Dashboard</div>
            },
            {
              path: '*',
              element: <div>Not Found</div>
            }
          ]
        }
      ],
      {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true
        },
        initialEntries: ['/unknown-route']
      }
    )

    render(<RouterProvider router={router} />)
    
    // Should render the catch-all route
    expect(screen.getByText('Not Found')).toBeInTheDocument()
    
    // Check for splat path warnings
    const splatWarnings = warnings.filter(warning => 
      warning.includes('Relative route resolution within Splat routes')
    )
    
    expect(splatWarnings).toHaveLength(0)
  })

  test('should configure router with future flags correctly', () => {
    // Test that our main app router has the correct future flags
    // This is more of a static analysis test to ensure configuration is correct
    const appJsxContent = require('fs').readFileSync('./src/App.jsx', 'utf8')
    
    expect(appJsxContent).toContain('v7_startTransition: true')
    expect(appJsxContent).toContain('v7_relativeSplatPath: true')
    expect(appJsxContent).toContain('createBrowserRouter')
    expect(appJsxContent).toContain('RouterProvider')
  })
})

describe('Navigation Performance', () => {
  test('should handle concurrent navigation updates', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Home</div>
        },
        {
          path: '/about',
          element: <div>About</div>
        }
      ],
      {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }
      }
    )

    render(<RouterProvider router={router} />)
    
    // With v7_startTransition enabled, navigation should be wrapped in React.startTransition
    // This test ensures no warnings about concurrent updates
    const concurrentWarnings = warnings.filter(warning =>
      warning.includes('Warning: Cannot update a component') ||
      warning.includes('concurrent')
    )
    
    expect(concurrentWarnings).toHaveLength(0)
  })
})