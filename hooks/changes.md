# The Problem

localStorage is not defined

## The Fix - Antigravity's Solution

The error you encountered is built around two overlapping rules in React and Next.js that often clash when working with localStorage:

### React's Rule (Cascading Renders)

When you use a useState initialized to a value, React renders your component with that value. By immediately calling setTodos directly in the synchronous body of useEffect, you invalidate that first render before the browser even gets a chance to paint it. React throws away the work it just did and forces another render right away (a cascading render). Newer React strict-linting rules heavily advise against doing this performance hazard.

### Next.js's Rule (Hydration Mismatches)

Next.js pre-renders pages on the server (SSR). Since window.localStorage doesn't exist on the server, the server will always generate the HTML using your dummyData. The Next.js client-side React component must match that HTML on its very first pass, or else you'll get a catastrophic "Hydration Mismatch" error. This is why you originally deferred using localStorage until after the useEffect fired!

### The Solution

Instead of trying to catch the useEffect and synchronously rewrite the state, antigravity modified /hooks/useTodos.ts to use a "Lazy Initialization + isMounted" strategy.

Here is exactly what antigravity did:

Lazy Initialization: We now check localStorage directly in a callback inside useState(...). This immediately scoops up the real data on the client without firing any extra calls to setState().
isMounted tracking via async callback: To prevent Next.js hydration mismatch errors (since the server expects dummyData), antigravity implemented an isMounted flag. Antigravity used a short setTimeout to set setIsMounted(true) which guarantees that the state setter avoids the "synchronous body of the effect" warning from React.
Serve Dummy first, actual later: For the first split-second frame while the client hydrates, we return dummyData. Then, a frame later, isMounted shifts to true and we feed your app the real authenticated todos without needing an extra re-re-render cycle.
