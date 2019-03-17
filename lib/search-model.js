const escapeRegExp = require('./utils/escape-reg-exp');
const getNonWordCharacters = require('./utils/non-word-characters');
const isWordSelected = require('./utils/is-word-selected');
const { getActiveEditor, getActiveEditors } = require('./utils/editor-finders');

class EarlyTerminationSignal extends Error {}

module.exports = class SearchModel {
  static showHighlightOnSelectedWord(range, selections) {
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

  constructor(areaView) {
    this.areaView = areaView;
  }

  handleSelection() {
    const editor = getActiveEditor();
    if (!editor) {
      return;
    }

    this.areaView.removeAllMarkers();

    if (this.areaView.disabled) {
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

    if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
      if (!isWordSelected(editor, lastSelection)) {
        return;
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
        return;
      }
      regexSearch = `(?:[ \\t${escapeRegExp(
        nonWordCharacters
      )}]|^)(${regexSearch})(?:[ \\t${escapeRegExp(nonWordCharacters)}]|$)`;
    }

    this.areaView.resultCount = 0;
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

    this.areaView.emitter.emit('did-finish-adding-markers');
  }

  highlightSelectionInEditor(editor, regexSearch, regexFlags, originalEditor) {
    if (!editor) {
      return;
    }
    const maximumHighlights = atom.config.get('highlight-selected.maximumHighlights');
    if (this.areaView.resultCount > maximumHighlights) {
      return;
    }

    const markerLayers = this.areaView.editorToMarkerLayerMap[editor.id];
    if (!markerLayers) {
      return;
    }
    const markerLayer = markerLayers.visibleMarkerLayer;
    const markerLayerForHiddenMarkers = markerLayers.selectedMarkerLayer;

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
        if (this.areaView.resultCount >= maximumHighlights) {
          throw new EarlyTerminationSignal();
        }

        let newResult = result;
        if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
          editor.scanInBufferRange(new RegExp(escapeRegExp(result.match[1])), result.range, e => {
            newResult = e;
          });
        }

        if (!newResult) {
          return;
        }
        this.areaView.resultCount += 1;

        const showHighlight = SearchModel.showHighlightOnSelectedWord(
          newResult.range,
          this.selections
        );

        if (showHighlight && originalEditor && originalEditor.id === editor.id) {
          const marker = markerLayerForHiddenMarkers.markBufferRange(newResult.range);
          this.areaView.emitter.emit('did-add-selected-marker', marker);
          this.areaView.emitter.emit('did-add-selected-marker-for-editor', {
            marker,
            editor
          });
        } else {
          const marker = markerLayer.markBufferRange(newResult.range);
          this.areaView.emitter.emit('did-add-marker', marker);
          this.areaView.emitter.emit('did-add-marker-for-editor', {
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
