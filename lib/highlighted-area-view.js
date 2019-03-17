const { CompositeDisposable, Emitter } = require('atom');
const escapeRegExp = require('./utils/escape-reg-exp');
const getNonWordCharacters = require('./utils/non-word-characters');
const isWordSelected = require('./utils/is-word-selected');

class EarlyTerminationSignal extends Error {}

module.exports = class HighlightedAreaView {
  static getActiveEditor() {
    return atom.workspace.getActiveTextEditor();
  }

  static getActiveEditors() {
    return atom.workspace.getPanes().map(pane => {
      const { activeItem } = pane;
      if (activeItem && activeItem.constructor.name === 'TextEditor') {
        return activeItem;
      }
      return null;
    });
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

  constructor() {
    this.debouncedHandleSelection = this.debouncedHandleSelection.bind(this);

    this.emitter = new Emitter();
    this.editorToMarkerLayerMap = {};
    this.markerLayers = [];
    this.resultCount = 0;

    this.editorSubscriptions = new CompositeDisposable();
    this.editorSubscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.setupMarkerLayers(editor);
      })
    );

    this.editorSubscriptions.add(
      atom.workspace.onWillDestroyPaneItem(item => {
        if (item.item.constructor.name !== 'TextEditor') {
          return;
        }
        const editor = item.item;
        this.removeMarkers(editor.id);
        delete this.editorToMarkerLayerMap[editor.id];
      })
    );

    this.enable();
    this.listenForTimeoutChange();
    this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem(() => {
      this.debouncedHandleSelection();
      return this.subscribeToActiveTextEditor();
    });
    this.subscribeToActiveTextEditor();
  }

  destroy() {
    clearTimeout(this.handleSelectionTimeout);
    this.activeItemSubscription.dispose();
    if (this.selectionSubscription) {
      this.selectionSubscription.dispose();
    }
    if (this.editorSubscriptions) {
      this.editorSubscriptions.dispose();
    }
  }

  onDidAddMarker(callback) {
    const Grim = require('grim'); // eslint-disable-line global-require
    Grim.deprecate('Please do not use. This method will be removed.');
    this.emitter.on('did-add-marker', callback);
  }

  onDidAddSelectedMarker(callback) {
    const Grim = require('grim'); // eslint-disable-line global-require
    Grim.deprecate('Please do not use. This method will be removed.');
    this.emitter.on('did-add-selected-marker', callback);
  }

  onDidAddMarkerForEditor(callback) {
    this.emitter.on('did-add-marker-for-editor', callback);
  }

  onDidAddSelectedMarkerForEditor(callback) {
    this.emitter.on('did-add-selected-marker-for-editor', callback);
  }

  onDidFinishAddingMarkers(callback) {
    this.emitter.on('did-finish-adding-markers', callback);
  }

  onDidRemoveAllMarkers(callback) {
    this.emitter.on('did-remove-marker-layer', callback);
  }

  disable() {
    this.disabled = true;
    return this.removeAllMarkers();
  }

  enable() {
    this.disabled = false;
    return this.debouncedHandleSelection();
  }

  debouncedHandleSelection() {
    clearTimeout(this.handleSelectionTimeout);
    this.handleSelectionTimeout = setTimeout(() => {
      this.handleSelection();
    }, atom.config.get('highlight-selected.timeout'));
    return this.handleSelectionTimeout;
  }

  listenForTimeoutChange() {
    return atom.config.onDidChange('highlight-selected.timeout', () => {
      return this.debouncedHandleSelection();
    });
  }

  subscribeToActiveTextEditor() {
    if (this.selectionSubscription) {
      this.selectionSubscription.dispose();
    }

    const editor = HighlightedAreaView.getActiveEditor();
    if (!editor) {
      return;
    }

    this.selectionSubscription = new CompositeDisposable();

    this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
    this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
    this.handleSelection();
  }

  handleSelection() {
    const editor = HighlightedAreaView.getActiveEditor();
    if (!editor) {
      return;
    }

    this.removeAllMarkers();

    if (this.disabled) {
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

    this.resultCount = 0;
    if (atom.config.get('highlight-selected.highlightInPanes')) {
      const originalEditor = editor;
      HighlightedAreaView.getActiveEditors().forEach(otherEditor => {
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

    this.emitter.emit('did-finish-adding-markers');
  }

  highlightSelectionInEditor(editor, regexSearch, regexFlags, originalEditor) {
    if (!editor) {
      return;
    }
    const maximumHighlights = atom.config.get('highlight-selected.maximumHighlights');
    if (this.resultCount > maximumHighlights) {
      return;
    }

    const markerLayers = this.editorToMarkerLayerMap[editor.id];
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
        if (this.resultCount >= maximumHighlights) {
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
        this.resultCount += 1;

        const showHighlight = HighlightedAreaView.showHighlightOnSelectedWord(
          newResult.range,
          this.selections
        );

        if (showHighlight && originalEditor && originalEditor.id === editor.id) {
          const marker = markerLayerForHiddenMarkers.markBufferRange(newResult.range);
          this.emitter.emit('did-add-selected-marker', marker);
          this.emitter.emit('did-add-selected-marker-for-editor', {
            marker,
            editor
          });
        } else {
          const marker = markerLayer.markBufferRange(newResult.range);
          this.emitter.emit('did-add-marker', marker);
          this.emitter.emit('did-add-marker-for-editor', {
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
      class: HighlightedAreaView.makeClasses()
    });
  }

  removeAllMarkers() {
    return Object.keys(this.editorToMarkerLayerMap).forEach(editorId =>
      this.removeMarkers(editorId)
    );
  }

  removeMarkers(editorId) {
    if (!this.editorToMarkerLayerMap[editorId]) {
      return;
    }

    const markerLayer = this.editorToMarkerLayerMap[editorId].visibleMarkerLayer;
    const { selectedMarkerLayer } = this.editorToMarkerLayerMap[editorId];

    markerLayer.clear();
    selectedMarkerLayer.clear();

    this.resultCount = 0;
    this.emitter.emit('did-remove-marker-layer');
  }

  selectAll() {
    const editor = HighlightedAreaView.getActiveEditor();
    const markerLayers = this.editorToMarkerLayerMap[editor.id];
    if (!markerLayers) {
      return;
    }
    const ranges = [];
    [markerLayers.visibleMarkerLayer, markerLayers.selectedMarkerLayer].forEach(markerLayer => {
      markerLayer.getMarkers().forEach(marker => {
        ranges.push(marker.getBufferRange());
      });
    });

    if (ranges.length > 0) {
      editor.setSelectedBufferRanges(ranges, { flash: true });
    }
  }

  setupMarkerLayers(editor) {
    let markerLayer;
    let markerLayerForHiddenMarkers;
    if (this.editorToMarkerLayerMap[editor.id]) {
      markerLayer = this.editorToMarkerLayerMap[editor.id].visibleMarkerLayer;
      markerLayerForHiddenMarkers = this.editorToMarkerLayerMap[editor.id].selectedMarkerLayer;
    }
    markerLayer = editor.addMarkerLayer();
    markerLayerForHiddenMarkers = editor.addMarkerLayer();
    this.editorToMarkerLayerMap[editor.id] = {
      visibleMarkerLayer: markerLayer,
      selectedMarkerLayer: markerLayerForHiddenMarkers
    };
  }
};
