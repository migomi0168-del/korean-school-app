// Lets a page (currently only chat mode) intercept the global home button
// instead of navigating immediately, e.g. to ask whether to save an
// in-progress conversation first. Most pages never register a handler, so
// the home button just navigates straight to /home.
type GuardHandler = () => void;
let handler: GuardHandler | null = null;

export function registerHomeGuard(fn: GuardHandler | null) {
  handler = fn;
}

export function requestGoHome(router: { push: (href: string) => void }) {
  if (handler) {
    handler();
  } else {
    router.push("/home");
  }
}
