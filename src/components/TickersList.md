# TickersList Component

A React component that fetches and displays ticker data from the `/api/v1/tickers` endpoint.

## Features

- ✅ Fetches data from `/api/v1/tickers` endpoint
- ✅ Displays tickers in a clean, responsive UI
- ✅ Shows loading state during API calls
- ✅ Handles and displays error states
- ✅ Shows empty state when no tickers are available
- ✅ Fully tested with Jest and React Testing Library

## Usage

### Basic Usage

```tsx
import TickersList from '../components/TickersList';

export default function MyPage() {
  return (
    <div>
      <h1>Market Dashboard</h1>
      <TickersList />
    </div>
  );
}
```

### Expected API Response Format

The component expects the API endpoint `/api/v1/tickers` to return data in this format:

```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc."
    },
    {
      "symbol": "GOOGL",
      "name": "Alphabet Inc."
    },
    {
      "symbol": "MSFT",
      "name": "Microsoft Corporation"
    }
  ]
}
```

## Component States

### Loading State

- Shows a spinner and "Loading tickers..." message
- Displayed while fetching data from the API

### Success State

- Displays tickers in a clean list format
- Shows ticker count in the header
- Each ticker shows symbol and company name
- Hover effects for better UX

### Error State

- Red error box with error message
- Shown when API call fails or returns an error

### Empty State

- "No tickers available" message
- Shown when API returns empty data array

## Authentication

The component uses the existing `useApiClient` hook which:

- Automatically includes authentication headers
- Handles 401 unauthorized responses
- Redirects to login page when needed

## Testing

Run the component tests:

```bash
npm test -- --testPathPatterns=TickersList.test.tsx
```

The test suite covers:

- Loading state rendering
- Successful data fetching and display
- Error handling
- Empty state handling
- API endpoint verification
- Network error handling

## Integration Example

The component is already integrated into the dashboard page at `/src/app/dashboard/page.tsx` as a demonstration.
