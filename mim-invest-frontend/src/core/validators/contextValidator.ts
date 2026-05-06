export function validateContext(context: unknown, name: string) {
  if (!context) {
    throw new Error(`use${name}Context must be used within a ${name}Provider`);
  }
}
