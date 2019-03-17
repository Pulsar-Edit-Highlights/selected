module.exports = function getNonWordCharacters(editor, point) {
  const scopeDescriptor = editor.scopeDescriptorForBufferPosition(point);
  const nonWordCharacters = atom.config.get('editor.nonWordCharacters', {
    scope: scopeDescriptor
  });

  return nonWordCharacters;
};
