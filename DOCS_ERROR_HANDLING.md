# Standardized Error Handling and Retry UI

This document describes the unified error handling patterns implemented in the StellarBill project to provide a consistent and user-friendly experience when API requests fail.

## Overview

The application now uses a centralized `ErrorState` component to handle various failure scenarios:
1. **API Failures**: Displays a user-friendly message with a "Retry" button.
2. **Offline Mode**: Detects when the user has no internet connection and provides specific guidance.
3. **Action Failures**: Handles errors during specific user actions (like pausing a subscription).
4. **Troubleshooting**: Provides an expandable "Technical Details" section for advanced users and developers.

## The `ErrorState` Component

Location: `src/components/ErrorState.tsx`

### Usage

Integrate the component into any page or container that performs data fetching:

```tsx
import { useState, useCallback } from 'react';
import ErrorState from '../components/ErrorState';
import { ApiError } from '../api/client';

function MyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await myApiCall();
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  if (error) {
    return (
      <ErrorState 
        message={error.message}
        technicalDetails={error.technicalDetails}
        onRetry={fetchData}
        isRetrying={loading}
        type={error.isOffline ? 'offline' : 'error'}
      />
    );
  }

  // ... render data
}
```

## API Client Integration

The `api` client in `src/api/client.ts` has been enhanced to return structured `ApiError` objects:

```typescript
interface ApiError extends Error {
  status?: number;           // HTTP status code
  technicalDetails?: string; // Detailed error message from backend or stack
  isOffline?: boolean;       // True if the error was caused by a network disconnection
}
```

### Simulation for Testing

You can simulate different error states by adding query parameters to the URL:
- `?simulate_error`: Simulates a 500 Internal Server Error with technical details.
- `?simulate_offline`: Simulates a network disconnection.
- `?fail_action`: Simulates a failure when performing a specific action (like pausing).

## Testing

Unit tests for the error UI are located in `src/components/ErrorState.test.tsx`.

Run tests:
```bash
npm test src/components/ErrorState.test.tsx
```

### Key Test Cases
- **Renders content**: Verifies titles, messages, and icons appear correctly.
- **Retry trigger**: Ensures the `onRetry` callback is called when the button is clicked.
- **Loading state**: Verifies the button is disabled and shows "Retrying..." during active requests.
- **Details toggle**: Checks that technical details can be expanded and collapsed.
- **Offline detection**: Confirms that specific offline UI is shown when appropriate.
