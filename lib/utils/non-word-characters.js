

const { config } = atom;


function getNonWordCharacters ( editor , point ){

    const scope = editor
        .scopeDescriptorForBufferPosition(point);

    const nonWordCharacters = config
        .get('editor.nonWordCharacters',{ scope });

    return nonWordCharacters;
}


module.exports = getNonWordCharacters;
