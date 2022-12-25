
const getNonWordCharacters = require('./non-word-characters');
const escapeRegExp = require('./escape-reg-exp');
const { Range } = require('atom');


function isNonWord ( editor , range ){

    const nonWordCharacters =
        getNonWordCharacters(editor, range.start);

    const text = editor
        .getTextInBufferRange(range);

    return new RegExp(`[ \t${
        escapeRegExp(nonWordCharacters)
    }]`).test(text);
}


function isNonWordCharacterToTheLeft ( editor , selection ){

    const { start } = selection
        .getBufferRange();

    const range = Range
        .fromPointWithDelta(start,0,-1);

    return isNonWord(editor,range)
}


function isNonWordCharacterToTheRight ( editor , selection ){

    const { end } = selection
        .getBufferRange();

    const range = Range
        .fromPointWithDelta(end,0,1);

    return isNonWord(editor,range);
}


function isWordSelected ( editor , selection ){

    if( ! selection.getBufferRange().isSingleLine() )
        return false;

    const selectionRange = selection
        .getBufferRange();

    const lineRange = editor
        .bufferRangeForBufferRow(selectionRange.start.row);

    const nonWordCharacterToTheLeft =
        selectionRange.start.isEqual(lineRange.start) ||
        isNonWordCharacterToTheLeft(editor, selection);

    const nonWordCharacterToTheRight =
        selectionRange.end.isEqual(lineRange.end) ||
        isNonWordCharacterToTheRight(editor, selection);

    return nonWordCharacterToTheRight
        && nonWordCharacterToTheLeft
}


module.exports = isWordSelected;
