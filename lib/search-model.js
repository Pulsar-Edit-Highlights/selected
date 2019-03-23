const escapeRegExp = require('./utils/escape-reg-exp');
const getNonWordCharacters = require('./utils/non-word-characters');
const isWordSelected = require('./utils/is-word-selected');
const { getActiveEditor, getActiveEditors } = require('./utils/editor-finders');

class EarlyTerminationSignal extends Error {}

module.exports = class SearchModel {
  static hideHighlightOnSelectedWord(range, selections) {
    if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
      return false;
    }
    let outcome = false;
    for (let i = 0; i < selections.length; i += 1) {
      const selection = selections[i];
      const selectionRange = selection.getBufferRange();
      outcome =
        range.start.column === selectionRange.start.column &&
        range.start.row === selectionRange.start.row &&
        range.end.column === selectionRange.end.column &&
        range.end.row === selectionRange.end.row;
      if (outcome) {
        break;
      }
    }
    return outcome;
  }

  static makeClasses() {
    let className = 'highlight-selected';
    if (atom.config.get('highlight-selected.lightTheme')) {
      className += ' light-theme';
    }

    if (atom.config.get('highlight-selected.highlightBackground')) {
      className += ' background';
    }
    return className;
  }

  // This functions replicates `\bTEXT\b` regex with allowed non-word characters to be something
  // like: `(^|[ @$#\.])TEXT([ @$#\.]|$)`. This allows unicode characters to be highlighted. Also,
  // it allows characters such as `@` in Ruby to selected and highlighted.
  // This is the first part of highlighting the whole words. We need to run another regex later to
  // ensure we only highlight the selection from the Atom Editor.
  static updateRegexSearchForWholeWords(regexSearch, editor, lastSelection, regexFlags, text) {
    if (!atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
      return regexSearch;
    }

    if (!isWordSelected(editor, lastSelection)) {
      return regexSearch;
    }
    const selectionStart = lastSelection.getBufferRange().start;
    const nonWordCharacters = getNonWordCharacters(editor, selectionStart);
    const allowedCharactersToSelect = atom.config.get(
      'highlight-selected.allowedCharactersToSelect'
    );
    const nonWordCharactersToStrip = nonWordCharacters.replace(
      new RegExp(`[${allowedCharactersToSelect}]`, 'g'),
      ''
    );
    const regexForWholeWord = new RegExp(
      `[ \\t${escapeRegExp(nonWordCharactersToStrip)}]`,
      regexFlags
    );
    if (regexForWholeWord.test(text)) {
      return regexSearch;
    }
    const newRegexSearch = `(?:[ \\t${escapeRegExp(
      nonWordCharacters
    )}]|^)(${regexSearch})(?:[ \\t${escapeRegExp(nonWordCharacters)}]|$)`;

    return newRegexSearch;
  }

  constructor(selectionManager) {
    this.selectionManager = selectionManager;
  }

  handleSelection() {
    const editor = getActiveEditor();
    if (!editor) {
      return;
    }

    this.selectionManager.removeAllMarkers();

    if (this.selectionManager.disabled) {
      return;
    }
    if (editor.getLastSelection().isEmpty()) {
      return;
    }

    this.selections = editor.getSelections();
    const lastSelection = editor.getLastSelection();
    const text = lastSelection.getText();

    if (text.length < atom.config.get('highlight-selected.minimumLength')) {
      return;
    }
    if (text.includes('\n')) {
      return;
    }
    const regex = new RegExp('^\\s+$');
    if (regex.test(text)) {
      return;
    }

    let regexFlags = 'g';
    if (atom.config.get('highlight-selected.ignoreCase')) {
      regexFlags = 'gi';
    }

    let regexSearch = escapeRegExp(text);
    regexSearch = SearchModel.updateRegexSearchForWholeWords(
      regexSearch,
      editor,
      lastSelection,
      regexFlags,
      text
    );

    this.selectionManager.resultCount = 0;
    if (atom.config.get('highlight-selected.highlightInPanes')) {
      const originalEditor = editor;
      getActiveEditors().forEach(otherEditor => {
        return this.highlightSelectionInEditor(
          otherEditor,
          regexSearch,
          regexFlags,
          originalEditor
        );
      });
    } else {
      this.highlightSelectionInEditor(editor, regexSearch, regexFlags);
    }

    this.selectionManager.emitter.emit('did-finish-adding-markers');
  }

  highlightSelectionInEditor(editor, regexSearch, regexFlags, originalEditor) {
    if (!editor) {
      return;
    }
    const maximumHighlights = atom.config.get('highlight-selected.maximumHighlights');
    if (this.selectionManager.resultCount > maximumHighlights) {
      return;
    }

    const markerLayers = this.selectionManager.editorToMarkerLayerMap[editor.id];
    if (!markerLayers) {
      return;
    }
    const markerLayer = markerLayers.visibleMarkerLayer;
    const markerLayerForHiddenMarkers = markerLayers.selectedMarkerLayer;

    // We should have a marker layers. If not run away.
    if (!markerLayer || !markerLayerForHiddenMarkers) {
      return;
    }

    // HACK: `editor.scan` is a synchronous process which iterates the entire buffer,
    // executing a regex against every line and yielding each match. This can be
    // costly for very large files with many matches.
    //
    // While we can and do limit the maximum number of highlight markers,
    // `editor.scan` cannot be terminated early, meaning that we are forced to
    // pay the cost of iterating every line in the file, running the regex, and
    // returning matches, even if we shouldn't be creating any more markers.
    //
    // Instead, throw an exception. This isn't pretty, but it prevents the
    // scan from running to completion unnecessarily.
    try {
      editor.scan(new RegExp(regexSearch, regexFlags), result => {
        if (this.selectionManager.resultCount >= maximumHighlights) {
          throw new EarlyTerminationSignal();
        }

        let newResult = result;
        // The the following check allows the selection from the Atom Editor to have the marker on
        // it. If we do not redo the regex and update the found match, we will add a marker around
        // all non-word characters, rather than the allowed non-word characters.
        if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
          editor.scanInBufferRange(new RegExp(escapeRegExp(result.match[1])), result.range, e => {
            newResult = e;
          });
        }

        if (!newResult) {
          return;
        }
        this.selectionManager.resultCount += 1;

        const hideHighlight = SearchModel.hideHighlightOnSelectedWord(
          newResult.range,
          this.selections
        );

        // If we want to hide the highlight on the selected word, we will add it to a different
        // marker layer. The hidden marker layer is used for by the `scroll-marker` API to show
        // matches. We do not tell the editor to decorate this marker layer. We also use fire
        // different events. This is so other packages and render them differently if they want.
        if (hideHighlight && originalEditor && originalEditor.id === editor.id) {
          const marker = markerLayerForHiddenMarkers.markBufferRange(newResult.range);
          this.selectionManager.emitter.emit('did-add-selected-marker', marker);
          this.selectionManager.emitter.emit('did-add-selected-marker-for-editor', {
            marker,
            editor
          });
        } else {
          const marker = markerLayer.markBufferRange(newResult.range);
          this.selectionManager.emitter.emit('did-add-marker', marker);
          this.selectionManager.emitter.emit('did-add-marker-for-editor', {
            marker,
            editor
          });
        }
      });
    } catch (error) {
      if (!(error instanceof EarlyTerminationSignal)) {
        // If this is an early termination, just continue on.
        throw error;
      }
    }

    editor.decorateMarkerLayer(markerLayer, {
      type: 'highlight',
      class: SearchModel.makeClasses()
    });
  }
};
