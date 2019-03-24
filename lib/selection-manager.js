const { CompositeDisposable, Emitter } = require('atom');
const debounce = require('debounce');
const SearchModel = require('./search-model');
const { getActiveEditor } = require('./utils/editor-finders');

module.exports = class SelectionManager {
  constructor() {
    this.debouncedHandleSelection = this.debouncedHandleSelection.bind(this);

    this.searchModel = new SearchModel(this);

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
    this.handleSelectionDebounce.clear();
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
    if (!this.handleSelectionDebounce) {
      this.handleSelectionDebounce = debounce(() => {
        this.searchModel.handleSelection();
      }, atom.config.get('highlight-selected.timeout'));
    }
    return this.handleSelectionDebounce();
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

    const editor = getActiveEditor();
    if (!editor) {
      return;
    }

    this.selectionSubscription = new CompositeDisposable();

    this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
    this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
    this.searchModel.handleSelection();
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

    const { visibleMarkerLayer, selectedMarkerLayer } = this.editorToMarkerLayerMap[editorId];

    visibleMarkerLayer.clear();
    selectedMarkerLayer.clear();

    this.resultCount = 0;
    this.emitter.emit('did-remove-marker-layer');
  }

  selectAll() {
    const editor = getActiveEditor();
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
