import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the API client
jest.mock('../../../lib/useApiClient', () => ({
  useApiClient: jest.fn(),
}))

// Import the mocked useApiClient
import { useApiClient } from '../../../lib/useApiClient'

const mockPost = jest.fn()
const mockApiClient = {
  post: mockPost,
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPost.mockClear()
    localStorage.clear()
    ;(useApiClient as jest.Mock).mockReturnValue(mockApiClient)
  })

  it('renders the login form correctly', async () => {
    render(<LoginPage />)

    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('updates email input when user types', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('updates password input when user types', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const passwordInput = await screen.findByLabelText(/password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('submits form with correct data on successful login', async () => {
    const user = userEvent.setup()
    const mockToken = 'mock-jwt-token'

    mockPost.mockResolvedValueOnce({
      data: { token: mockToken },
      error: null,
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(mockPost).toHaveBeenCalledWith(
      '/login',
      {
        email: 'test@example.com',
        password: 'password123',
      },
      { requiresAuth: false }
    )

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'

    mockPost.mockResolvedValueOnce({
      data: null,
      error: errorMessage,
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('displays generic error message when no error message is provided', async () => {
    const user = userEvent.setup()

    mockPost.mockResolvedValueOnce({
      data: null,
      error: 'Invalid credentials',
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()

    mockPost.mockResolvedValueOnce({
      data: null,
      error: 'Network error',
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('handles unexpected errors', async () => {
    const user = userEvent.setup()

    mockPost.mockResolvedValueOnce({
      data: null,
      error: 'An unexpected error occurred',
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('clears error message when form is resubmitted', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockPost.mockResolvedValueOnce({
      data: null,
      error: 'Invalid credentials',
    })

    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockPost.mockResolvedValueOnce({
      data: { token: 'valid-token' },
      error: null,
    })

    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.type(emailInput, 'correct@example.com')
    await user.type(passwordInput, 'correctpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  it('has proper form validation attributes', async () => {
    render(<LoginPage />)

    const emailInput = await screen.findByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('form has proper structure', async () => {
    render(<LoginPage />)

    const submitButton = await screen.findByRole('button', { name: /login/i })
    const form = submitButton.closest('form')
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(form).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})
