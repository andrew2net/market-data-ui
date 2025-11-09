import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function that can be extended with providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  return localStorageMock
}

export const mockFetch = () => {
  const fetchMock = jest.fn()
  global.fetch = fetchMock
  return fetchMock
}

export const createMockResponse = (data: unknown, ok: boolean = true) => ({
  ok,
  json: async () => data,
})

export const waitForApiCall = (mockFetch: jest.MockedFunction<typeof fetch>, expectedUrl: string) => {
  return new Promise<void>((resolve) => {
    const checkCall = () => {
      const calls = mockFetch.mock.calls
      if (calls.some((call: unknown[]) => call[0] === expectedUrl)) {
        resolve()
      } else {
        setTimeout(checkCall, 10)
      }
    }
    checkCall()
  })
}
