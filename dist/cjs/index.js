"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
/**
 * Create a strictly-typed wrapper for a new RegExp.
 */
function parse(pattern, flags) {
    return new RegExp(pattern, flags || "");
}
