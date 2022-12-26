
const getNonWordCharacters = require('./non-word-characters');
const escapeRegExp = require('./escape-reg-exp');
const { Range } = require('atom');


function isNonWord ( editor , range ){

    const { start } = range;

    const nonWords = escapeRegExp(
        getNonWordCharacters(editor,start));

    const pattern =
        new RegExp(`[ \t${ nonWords }]`);

    const text = editor
        .getTextInBufferRange(range);

    return pattern
        .test(text)
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

    const range = selection
        .getBufferRange();

    if( ! range.isSingleLine() )
        return false;


    const { start , end } = range;

    const lineRange = editor
        .bufferRangeForBufferRow(start.row);

    const nonWordCharacterToTheLeft =
        start.isEqual(lineRange.start) ||
        isNonWordCharacterToTheLeft(editor,selection);

    const nonWordCharacterToTheRight =
        end.isEqual(lineRange.end) ||
        isNonWordCharacterToTheRight(editor,selection);

    return nonWordCharacterToTheRight
        && nonWordCharacterToTheLeft
}


module.exports = isWordSelected;
