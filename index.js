exports.TypedRegExp = RegExp;
exports.concat = (...strings) => String.prototype.concat(...strings);
exports.join = (sep, ...strings) => strings.join(sep);
