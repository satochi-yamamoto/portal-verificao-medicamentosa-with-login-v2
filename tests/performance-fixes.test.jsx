import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import ReactMarkdown from 'react-markdown'
import AnalysisReport from '../src/components/AnalysisReport'
import MarkdownErrorBoundary from '../src/components/MarkdownErrorBoundary'
import { optimizedSetTimeout, debounce, measurePerformance } from '../src/utils/performance'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  FileText: () => <div data-testid="file-text-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />
}))

describe('Performance Fixes', () => {
  beforeEach(() => {
    // Clear console
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ReactMarkdown className fix', () => {
    test('ReactMarkdown should not have className prop', () => {
      const TestComponent = () => (
        <ReactMarkdown components={{}}>
          # Test Markdown
        </ReactMarkdown>
      )

      expect(() => {
        render(<TestComponent />)
      }).not.toThrow()
    })

    test('ReactMarkdown with className should fail', () => {
      const TestComponentWithClassName = () => (
        <ReactMarkdown className="test-class">
          # Test Markdown
        </ReactMarkdown>
      )

      // This should cause an error in newer versions
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponentWithClassName />)
      }).toThrow()

      consoleSpy.mockRestore()
    })

    test('AnalysisReport renders without className on ReactMarkdown', () => {
      const mockProps = {
        analysis: '# Test Analysis\n\nThis is a test analysis.',
        medications: [
          { name: 'Test Medication', dosage: '10mg' }
        ],
        onDownload: vi.fn(),
        createdAt: new Date(),
        isHistoryView: false
      }

      render(<AnalysisReport {...mockProps} />)
      
      expect(screen.getByText('Relatório de Análise Medicamentosa')).toBeInTheDocument()
      expect(screen.getByText('Test Medication')).toBeInTheDocument()
    })
  })

  describe('Markdown Error Boundary', () => {
    test('MarkdownErrorBoundary catches and displays error fallback', () => {
      const ThrowError = () => {
        throw new Error('Test markdown error')
      }

      render(
        <MarkdownErrorBoundary fallback="Fallback content">
          <ThrowError />
        </MarkdownErrorBoundary>
      )

      expect(screen.getByText('Erro ao renderizar conteúdo Markdown')).toBeInTheDocument()
      expect(screen.getByText('Fallback content')).toBeInTheDocument()
    })

    test('MarkdownErrorBoundary renders children when no error', () => {
      render(
        <MarkdownErrorBoundary>
          <div>Normal content</div>
        </MarkdownErrorBoundary>
      )

      expect(screen.getByText('Normal content')).toBeInTheDocument()
      expect(screen.queryByText('Erro ao renderizar conteúdo Markdown')).not.toBeInTheDocument()
    })
  })

  describe('Performance utilities', () => {
    test('optimizedSetTimeout uses requestAnimationFrame for short delays', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
      
      const callback = vi.fn()
      optimizedSetTimeout(callback, 10) // Short delay
      
      expect(requestAnimationFrameSpy).toHaveBeenCalled()
      expect(setTimeoutSpy).not.toHaveBeenCalled()

      requestAnimationFrameSpy.mockRestore()
      setTimeoutSpy.mockRestore()
    })

    test('optimizedSetTimeout uses setTimeout for long delays', () => {
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
      
      const callback = vi.fn()
      optimizedSetTimeout(callback, 1000) // Long delay
      
      expect(setTimeoutSpy).toHaveBeenCalled()
      expect(requestAnimationFrameSpy).not.toHaveBeenCalled()

      requestAnimationFrameSpy.mockRestore()
      setTimeoutSpy.mockRestore()
    })

    test('debounce function works correctly', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Call multiple times quickly
      debouncedFn('test1')
      debouncedFn('test2')
      debouncedFn('test3')
      
      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled()
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be called only once with last argument
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('test3')
    })

    test('measurePerformance logs performance metrics', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const slowFunction = () => new Promise(resolve => 
        setTimeout(resolve, 60) // Simulate 60ms operation
      )
      
      await measurePerformance('test-operation', slowFunction)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance: test-operation took')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Performance monitoring', () => {
    test('Performance warnings are logged for slow operations', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const verySlowFunction = () => new Promise(resolve => 
        setTimeout(resolve, 100) // Simulate 100ms operation (slow)
      )
      
      await measurePerformance('slow-operation', verySlowFunction)
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance: slow-operation took')
      )

      consoleWarnSpy.mockRestore()
    })

    test('Fast operations do not trigger warnings', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const fastFunction = () => new Promise(resolve => 
        setTimeout(resolve, 10) // Simulate 10ms operation (fast)
      )
      
      await measurePerformance('fast-operation', fastFunction)
      
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance: fast-operation took')
      )

      consoleWarnSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })
})

describe('Integration Tests', () => {
  test('AnalysisReport with MarkdownErrorBoundary handles errors gracefully', () => {
    const mockProps = {
      analysis: '# Test Analysis\n\n**Bold text** with *italic*', // Valid markdown
      medications: [{ name: 'Test Med', dosage: '5mg' }],
      onDownload: vi.fn(),
      createdAt: new Date()
    }

    render(<AnalysisReport {...mockProps} />)
    
    // Should render successfully without errors
    expect(screen.getByText('Relatório de Análise Medicamentosa')).toBeInTheDocument()
    expect(screen.getByText('Test Med')).toBeInTheDocument()
  })

  test('System handles complex markdown content without performance issues', async () => {
    const complexAnalysis = `
# Complex Analysis Report

## Drug Interactions

### High Priority
- **Drug A** vs **Drug B**: Major interaction
- **Drug C** vs **Drug D**: Contraindicated

### Medium Priority
- *Drug E* with *Drug F*: Monitor closely

### Low Priority
- Drug G and Drug H: Minimal interaction

> **Note**: Always consult with healthcare provider

## Recommendations

1. Discontinue Drug B
2. Monitor Drug F levels
3. Consider alternatives

---

**References**:
- Study 1: https://example.com/study1
- Study 2: DOI: 10.1234/example
    `

    const mockProps = {
      analysis: complexAnalysis,
      medications: Array.from({ length: 10 }, (_, i) => ({
        name: `Drug ${String.fromCharCode(65 + i)}`,
        dosage: `${(i + 1) * 10}mg`
      })),
      onDownload: vi.fn(),
      createdAt: new Date()
    }

    const startTime = performance.now()
    render(<AnalysisReport {...mockProps} />)
    const renderTime = performance.now() - startTime

    // Render should complete in reasonable time
    expect(renderTime).toBeLessThan(100)

    // Content should be rendered
    expect(screen.getByText('Complex Analysis Report')).toBeInTheDocument()
    expect(screen.getByText('Drug A')).toBeInTheDocument()
  })
})