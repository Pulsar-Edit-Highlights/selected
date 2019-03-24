const path = require('path');
const getNonWordCharacters = require('../../lib/utils/non-word-characters.js');

describe('with a CoffeeScript file', () => {
  const nonWordCharacters = '{}[]<>';
  let workspaceElement;
  let editor;
  let selectionStart;

  beforeEach(() => {
    // Need this package to be active otherwise we do not use the source in the
    // `getNonWordCharacters` function
    waitsForPromise(() => atom.packages.activatePackage('language-coffee-script'));

    atom.config.set('editor.nonWordCharacters', nonWordCharacters, {
      scopeSelector: '.source.coffee'
    });

    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join('..', '..', 'fixtures')]);

    waitsForPromise(() => atom.workspace.open('sample.coffee'));

    runs(() => {
      jasmine.attachToDOM(workspaceElement);
      editor = atom.workspace.getActiveTextEditor();
      const editorElement = atom.views.getView(editor);
      editorElement.setHeight(250);
      editorElement.component.measureDimensions();
      selectionStart = editor.getLastSelection().getBufferRange().start;
    });
  });

  it('returns differently than the editor.nonWordCharacters', () => {
    expect(getNonWordCharacters(editor, selectionStart)).not.toBe(
      atom.config.get('editor.nonWordCharacters')
    );
  });

  it('returns the correct non word characters', () => {
    expect(getNonWordCharacters(editor, selectionStart)).toBe(nonWordCharacters);
  });
});
