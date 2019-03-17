module.exports = function escapeRegExp(string) {
  if (string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  return '';
};
