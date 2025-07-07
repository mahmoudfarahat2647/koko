# Hydration Mismatch Prevention Rules

This document outlines best practices to prevent hydration mismatches in Next.js applications. Hydration mismatches occur when the server-rendered HTML differs from the client-rendered content, leading to errors and potential UI flickering.

## 1. Avoid Client-Side Only Code in Server Components

Do not directly use browser-specific APIs (like `window`, `document`, `localStorage`) in components that are rendered on the server. If a component needs to access these, ensure it's a Client Component and load it dynamically or use `useEffect` to run the code only on the client.

**Bad Practice:**
```tsx
// This component will be rendered on the server first
function MyComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading state
  }

  // This will cause a mismatch if window is accessed directly during SSR
  return <div>{window.innerWidth}</div>;
}
```

**Good Practice:**
```tsx
// Use a Client Component for browser-specific logic
'use client';

import { useState, useEffect } from 'react';

function MyComponent() {
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  return <div>{innerWidth}</div>;
}

// Or, for simpler cases, render conditionally
function MyOtherComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && <p>This content only renders on the client: {window.innerHeight}</p>}
    </div>
  );
}
```

## 2. Handle Time-Dependent or Random Values

Values that change between server and client rendering (e.g., `Date.now()`, `Math.random()`, or locale-specific date/time formatting) will cause mismatches.

**Bad Practice:**
```tsx
function TimeComponent() {
  // Date will differ between server and client render
  return <p>Current time: {new Date().toLocaleString()}</p>;
}
```

**Good Practice:**
```tsx
'use client';

import { useState, useEffect } from 'react';

function TimeComponent() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  return <p>Current time: {currentTime}</p>;
}
```

## 3. Ensure Valid HTML Structure

React expects a valid HTML structure. Mismatches can occur if the server renders invalid HTML that the browser attempts to correct before React hydrates.

**Example of invalid nesting:**
```html
<p>
  <div>This div inside a paragraph is invalid HTML.</div>
</p>
```

Always ensure your JSX produces valid HTML. Use tools like ESLint with `jsx-a11y` rules to catch common issues.

## 4. Consistent Data Fetching

If data is fetched on the server, ensure that the same data is available and used consistently for hydration on the client. For external data, consider sending a snapshot of the data with the HTML or using a library like TanStack Query (React Query) that handles server-state synchronization.

## 5. Use `suppressHydrationWarning` Sparingly

The `suppressHydrationWarning` prop on an HTML element tells React to suppress warnings about hydration mismatches for that element and its children. Use this only when you explicitly know a mismatch is unavoidable or intentional (e.g., third-party scripts injecting content). It hides the symptom, not the cause.

**When to use (rarely):**
```tsx
<div suppressHydrationWarning>
  {/* Content that might intentionally mismatch */}
</div>
```

**Avoid using it as a general solution for all mismatches.** Focus on resolving the root cause of the mismatch by following the other guidelines.

## 6. Check Browser Extensions

Sometimes, browser extensions can inject HTML or modify the DOM before React hydrates, leading to false-positive hydration errors. If you encounter persistent issues that seem unrelated to your code, try disabling browser extensions.
