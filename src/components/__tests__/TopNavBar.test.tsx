import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import TopNavBar from '../TopNavBar'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

describe('TopNavBar', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders the navigation bar with correct elements', () => {
    render(<TopNavBar />)

    // Check if the app title is rendered
    expect(screen.getByText('Market Data')).toBeInTheDocument()

    // Check if the logout button is rendered
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('has correct CSS classes and structure', () => {
    render(<TopNavBar />)

    // Check nav element structure
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-background', 'border-b')

    // Check title styling
    const title = screen.getByText('Market Data')
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-foreground')

    // Check logout button styling
    const logoutButton = screen.getByText('Logout')
    expect(logoutButton).toHaveClass('text-muted-foreground', 'hover:text-destructive', 'hover:cursor-pointer')
  })

  it('clears localStorage tokens when logout is clicked', async () => {
    const user = userEvent.setup()
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Verify localStorage.removeItem was called with correct keys
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2)
  })

  it('clears sessionStorage tokens when logout is clicked', async () => {
    const user = userEvent.setup()
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Verify sessionStorage.removeItem was called with correct keys
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    expect(mockSessionStorage.removeItem).toHaveBeenCalledTimes(2)
  })

  it('redirects to login page when logout is clicked', async () => {
    const user = userEvent.setup()
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Verify router.push was called with login path
    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('handles logout with fireEvent (alternative event handling test)', () => {
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    // Verify all storage cleanup happened
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refreshToken')

    // Verify navigation happened
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('performs complete logout workflow in correct order', async () => {
    const user = userEvent.setup()
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)

    // Verify the complete logout sequence
    expect(mockLocalStorage.removeItem).toHaveBeenNthCalledWith(1, 'token')
    expect(mockLocalStorage.removeItem).toHaveBeenNthCalledWith(2, 'refreshToken')
    expect(mockSessionStorage.removeItem).toHaveBeenNthCalledWith(1, 'token')
    expect(mockSessionStorage.removeItem).toHaveBeenNthCalledWith(2, 'refreshToken')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('button is accessible and has correct role', () => {
    render(<TopNavBar />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
    expect(logoutButton.tagName).toBe('BUTTON')
  })

  it('renders without crashing when clicked multiple times', async () => {
    const user = userEvent.setup()
    render(<TopNavBar />)

    const logoutButton = screen.getByText('Logout')

    // Click multiple times to ensure no errors
    await user.click(logoutButton)
    await user.click(logoutButton)
    await user.click(logoutButton)

    // Should still be in the document and functional
    expect(logoutButton).toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledTimes(3)
  })
})
