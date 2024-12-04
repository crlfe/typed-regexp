/**
 * Create a strictly-typed wrapper for a new RegExp.
 */
export function parse(pattern, flags) {
    return new RegExp(pattern, flags || "");
}
