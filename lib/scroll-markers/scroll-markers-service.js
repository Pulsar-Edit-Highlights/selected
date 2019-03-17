const { CompositeDisposable } = require('atom');

module.exports = class ScrollMarkersService {
  static ensureScrollViewInstalled() {
    if (!atom.inSpecMode()) {
      /* eslint-disable */
      require('atom-package-deps').install('highlight-selected', true);
      /* eslint-enable */
    }
  }

  constructor(selectionManager, scrollMarkerAPI) {
    this.selectionManager = selectionManager;
    this.scrollMarkerAPI = scrollMarkerAPI;

    if (atom.config.get('highlight-selected.showResultsOnScrollBar')) {
      ScrollMarkersService.ensureScrollViewInstalled();
      atom.workspace.getTextEditors().forEach(editor => this.setScrollMarkerView(editor));
    }

    this.setupEditorSubscriptions();
    this.setupConfigObserver();
  }

  destroy() {
    this.editorSubscriptions.dispose();
    this.enableScrollViewObserveSubscription.dispose();
  }

  setupEditorSubscriptions() {
    this.editorSubscriptions = new CompositeDisposable();
    this.editorSubscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.setScrollMarkerView(editor);
      })
    );

    this.editorSubscriptions.add(
      atom.workspace.onWillDestroyPaneItem(item => {
        if (item.item.constructor.name !== 'TextEditor') {
          return;
        }
        const editor = item.item;
        this.destroyScrollMarkers(editor);
      })
    );
  }

  setupConfigObserver() {
    this.enableScrollViewObserveSubscription = atom.config.observe(
      'highlight-selected.showResultsOnScrollBar',
      enabled => {
        if (enabled) {
          ScrollMarkersService.ensureScrollViewInstalled();
          atom.workspace.getTextEditors().forEach(editor => this.setScrollMarkerView(editor));
        } else {
          atom.workspace.getTextEditors().forEach(editor => this.destroyScrollMarkers(editor));
        }
      }
    );
  }

  setScrollMarkerView(editor) {
    if (!atom.config.get('highlight-selected.showResultsOnScrollBar')) {
      return;
    }
    if (!this.scrollMarkerAPI) {
      return;
    }

    const scrollMarkerView = this.scrollMarkerAPI.scrollMarkerViewForEditor(editor);

    const markerLayer = this.selectionManager.editorToMarkerLayerMap[editor.id].visibleMarkerLayer;
    const { selectedMarkerLayer } = this.selectionManager.editorToMarkerLayerMap[editor.id];

    scrollMarkerView.getLayer('highlight-selected-marker-layer').syncToMarkerLayer(markerLayer);
    scrollMarkerView
      .getLayer('highlight-selected-selected-marker-layer')
      .syncToMarkerLayer(selectedMarkerLayer);
  }

  destroyScrollMarkers(editor) {
    if (!this.scrollMarkerAPI) {
      return;
    }

    const scrollMarkerView = this.scrollMarkerAPI.scrollMarkerViewForEditor(editor);
    scrollMarkerView.destroy();
  }
};
