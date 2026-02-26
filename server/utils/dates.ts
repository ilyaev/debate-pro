export function normalizeDate(d: Date | string): string {
    return d instanceof Date ? d.toISOString() : d;
}
