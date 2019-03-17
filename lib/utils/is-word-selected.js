const { Range } = require('atom');
const escapeRegExp = require('./escape-reg-exp');
const getNonWordCharacters = require('./non-word-characters');

function isNonWord(editor, range) {
  const nonWordCharacters = getNonWordCharacters(editor, range.start);
  const text = editor.getTextInBufferRange(range);
  return new RegExp(`[ \t${escapeRegExp(nonWordCharacters)}]`).test(text);
}

function isNonWordCharacterToTheLeft(editor, selection) {
  const selectionStart = selection.getBufferRange().start;
  const range = Range.fromPointWithDelta(selectionStart, 0, -1);
  return isNonWord(editor, range);
}

function isNonWordCharacterToTheRight(editor, selection) {
  const selectionEnd = selection.getBufferRange().end;
  const range = Range.fromPointWithDelta(selectionEnd, 0, 1);
  return isNonWord(editor, range);
}

module.exports = function isWordSelected(editor, selection) {
  if (selection.getBufferRange().isSingleLine()) {
    const selectionRange = selection.getBufferRange();
    const lineRange = editor.bufferRangeForBufferRow(selectionRange.start.row);
    const nonWordCharacterToTheLeft =
      selectionRange.start.isEqual(lineRange.start) ||
      isNonWordCharacterToTheLeft(editor, selection);
    const nonWordCharacterToTheRight =
      selectionRange.end.isEqual(lineRange.end) || isNonWordCharacterToTheRight(editor, selection);

    return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
  }
  return false;
};
