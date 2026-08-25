/** Tiny className joiner (keeps us off extra deps like clsx). */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ')
