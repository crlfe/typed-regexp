export function parse(pattern, flags) {
  return new RegExp(pattern, flags || "");
}
