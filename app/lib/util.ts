export function sqldt(dt: Date): string {
  return dt.toISOString().split('T')[0];
}
