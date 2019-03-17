const { Range, CompositeDisposable, Emitter } = require('atom');
const StatusBarView = require('./status-bar-view');
const escapeRegExp = require('./escape-reg-exp');

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

  static getNonWordCharacters(editor, point) {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(point);
    const nonWordCharacters = atom.config.get('editor.nonWordCharacters', {
      scope: scopeDescriptor
    });

    return nonWordCharacters;
  }

  static ensureScrollViewInstalled() {
    if (!atom.inSpecMode()) {
      /* eslint-disable */
      require('atom-package-deps').install('highlight-selected', true);
      /* eslint-enable */
    }
  }

  static isWordSelected(selection) {
    if (selection.getBufferRange().isSingleLine()) {
      const selectionRange = selection.getBufferRange();
      const lineRange = HighlightedAreaView.getActiveEditor().bufferRangeForBufferRow(
        selectionRange.start.row
      );
      const nonWordCharacterToTheLeft =
        selectionRange.start.isEqual(lineRange.start) ||
        HighlightedAreaView.isNonWordCharacterToTheLeft(selection);
      const nonWordCharacterToTheRight =
        selectionRange.end.isEqual(lineRange.end) ||
        HighlightedAreaView.isNonWordCharacterToTheRight(selection);

      return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
    }
    return false;
  }

  static isNonWord(editor, range) {
    const nonWordCharacters = HighlightedAreaView.getNonWordCharacters(editor, range.start);
    const text = editor.getTextInBufferRange(range);
    return new RegExp(`[ \t${escapeRegExp(nonWordCharacters)}]`).test(text);
  }

  static isNonWordCharacterToTheLeft(selection) {
    const selectionStart = selection.getBufferRange().start;
    const range = Range.fromPointWithDelta(selectionStart, 0, -1);
    return HighlightedAreaView.isNonWord(HighlightedAreaView.getActiveEditor(), range);
  }

  static isNonWordCharacterToTheRight(selection) {
    const selectionEnd = selection.getBufferRange().end;
    const range = Range.fromPointWithDelta(selectionEnd, 0, 1);
    return HighlightedAreaView.isNonWord(HighlightedAreaView.getActiveEditor(), range);
  }

  constructor() {
    this.destroy = this.destroy.bind(this);
    this.onDidAddMarker = this.onDidAddMarker.bind(this);
    this.onDidAddSelectedMarker = this.onDidAddSelectedMarker.bind(this);
    this.onDidAddMarkerForEditor = this.onDidAddMarkerForEditor.bind(this);
    this.onDidAddSelectedMarkerForEditor = this.onDidAddSelectedMarkerForEditor.bind(this);
    this.onDidRemoveAllMarkers = this.onDidRemoveAllMarkers.bind(this);
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.setStatusBar = this.setStatusBar.bind(this);
    this.debouncedHandleSelection = this.debouncedHandleSelection.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.removeAllMarkers = this.removeAllMarkers.bind(this);
    this.removeMarkers = this.removeMarkers.bind(this);
    this.setupStatusBar = this.setupStatusBar.bind(this);
    this.removeStatusBar = this.removeStatusBar.bind(this);
    this.listenForStatusBarChange = this.listenForStatusBarChange.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.setScrollMarker = this.setScrollMarker.bind(this);
    this.setupMarkerLayers = this.setupMarkerLayers.bind(this);
    this.setScrollMarkerView = this.setScrollMarkerView.bind(this);
    this.destroyScrollMarkers = this.destroyScrollMarkers.bind(this);
    this.emitter = new Emitter();
    this.editorToMarkerLayerMap = {};
    this.markerLayers = [];
    this.resultCount = 0;

    this.editorSubscriptions = new CompositeDisposable();
    this.editorSubscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.setupMarkerLayers(editor);
        return this.setScrollMarkerView(editor);
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
        this.destroyScrollMarkers(editor);
      })
    );

    this.enable();
    this.listenForTimeoutChange();
    this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem(() => {
      this.debouncedHandleSelection();
      return this.subscribeToActiveTextEditor();
    });
    this.subscribeToActiveTextEditor();
    this.listenForStatusBarChange();

    this.enableScrollViewObserveSubscription = atom.config.observe(
      'highlight-selected.showResultsOnScrollBar',
      enabled => {
        if (enabled) {
          HighlightedAreaView.ensureScrollViewInstalled();
          return atom.workspace.getTextEditors().forEach(this.setScrollMarkerView);
        }
        return atom.workspace.getTextEditors().forEach(this.destroyScrollMarkers);
      }
    );
  }

  destroy() {
    clearTimeout(this.handleSelectionTimeout);
    this.activeItemSubscription.dispose();
    if (this.selectionSubscription != null) {
      this.selectionSubscription.dispose();
    }
    if (this.enableScrollViewObserveSubscription != null) {
      this.enableScrollViewObserveSubscription.dispose();
    }
    if (this.editorSubscriptions != null) {
      this.editorSubscriptions.dispose();
    }
    if (this.statusBarView != null) {
      this.statusBarView.removeElement();
    }
    if (this.statusBarTile != null) {
      this.statusBarTile.destroy();
    }
    this.statusBarTile = null;
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

  setStatusBar(statusBar) {
    this.statusBar = statusBar;
    return this.setupStatusBar();
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
    if (this.selectionSubscription != null) {
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
      if (!HighlightedAreaView.isWordSelected(lastSelection)) {
        return;
      }
      const selectionStart = lastSelection.getBufferRange().start;
      const nonWordCharacters = HighlightedAreaView.getNonWordCharacters(editor, selectionStart);
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

    if (this.statusBarElement) {
      this.statusBarElement.updateCount(this.resultCount);
    }
  }

  highlightSelectionInEditor(editor, regexSearch, regexFlags, originalEditor) {
    if (editor == null) {
      return;
    }
    const maximumHighlights = atom.config.get('highlight-selected.maximumHighlights');
    if (!(this.resultCount < maximumHighlights)) {
      return;
    }

    const markerLayers = this.editorToMarkerLayerMap[editor.id];
    if (markerLayers == null) {
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

        if (newResult == null) {
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
    return Object.keys(this.editorToMarkerLayerMap).forEach(this.removeMarkers);
  }

  removeMarkers(editorId) {
    if (this.editorToMarkerLayerMap[editorId] == null) {
      return;
    }

    const markerLayer = this.editorToMarkerLayerMap[editorId].visibleMarkerLayer;
    const { selectedMarkerLayer } = this.editorToMarkerLayerMap[editorId];

    markerLayer.clear();
    selectedMarkerLayer.clear();

    if (this.statusBarElement != null) {
      this.statusBarElement.updateCount(0);
    }

    this.emitter.emit('did-remove-marker-layer');
  }

  setupStatusBar() {
    if (this.statusBarElement != null) {
      return;
    }
    if (!atom.config.get('highlight-selected.showInStatusBar')) {
      return;
    }
    this.statusBarElement = new StatusBarView();
    this.statusBarTile = this.statusBar.addLeftTile({
      item: this.statusBarElement.getElement(),
      priority: 100
    });
  }

  removeStatusBar() {
    if (this.statusBarElement == null) {
      return;
    }
    if (this.statusBarTile != null) {
      this.statusBarTile.destroy();
    }
    this.statusBarTile = null;
    this.statusBarElement = null;
  }

  listenForStatusBarChange() {
    return atom.config.onDidChange('highlight-selected.showInStatusBar', changed => {
      if (changed.newValue) {
        return this.setupStatusBar();
      }
      return this.removeStatusBar();
    });
  }

  selectAll() {
    const editor = HighlightedAreaView.getActiveEditor();
    const markerLayers = this.editorToMarkerLayerMap[editor.id];
    if (markerLayers == null) {
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

  setScrollMarker(scrollMarkerAPI) {
    this.scrollMarker = scrollMarkerAPI;
    if (atom.config.get('highlight-selected.showResultsOnScrollBar')) {
      HighlightedAreaView.ensureScrollViewInstalled();
      atom.workspace.getTextEditors().forEach(this.setScrollMarkerView);
    }
  }

  setupMarkerLayers(editor) {
    let markerLayer;
    let markerLayerForHiddenMarkers;
    if (this.editorToMarkerLayerMap[editor.id] != null) {
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

  setScrollMarkerView(editor) {
    if (!atom.config.get('highlight-selected.showResultsOnScrollBar')) {
      return;
    }
    if (this.scrollMarker == null) {
      return;
    }

    const scrollMarkerView = this.scrollMarker.scrollMarkerViewForEditor(editor);

    const markerLayer = this.editorToMarkerLayerMap[editor.id].visibleMarkerLayer;
    const { selectedMarkerLayer } = this.editorToMarkerLayerMap[editor.id];

    scrollMarkerView.getLayer('highlight-selected-marker-layer').syncToMarkerLayer(markerLayer);
    scrollMarkerView
      .getLayer('highlight-selected-selected-marker-layer')
      .syncToMarkerLayer(selectedMarkerLayer);
  }

  destroyScrollMarkers(editor) {
    if (this.scrollMarker == null) {
      return;
    }

    const scrollMarkerView = this.scrollMarker.scrollMarkerViewForEditor(editor);
    scrollMarkerView.destroy();
  }
};
