const path = require('path');
const ScrollMarkersService = require('../../Source/scroll-markers/scroll-markers-service');

describe('ScrollMarkersService', () => {
  let scrollMarkersService;
  let selectionManager;
  let scrollMarkerApi;

  const createScrollMarkersService = () => {
    selectionManager = {
      onDidFinishAddingMarkers: () => {},
      onDidRemoveAllMarkers: () => {},
    };
    spyOn(selectionManager, 'onDidFinishAddingMarkers');
    spyOn(selectionManager, 'onDidRemoveAllMarkers');
    scrollMarkerApi = {};
    scrollMarkersService = new ScrollMarkersService(selectionManager);
    scrollMarkersService.setScrollMarkerAPI(scrollMarkerApi);
  };

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('highlight-selected'));
    atom.config.set('highlight-selected.showResultsOnScrollBar', true);
  });

  describe('constructor', () => {
    describe('when show results on scroll bar is enabled', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showResultsOnScrollBar', true);
      });

      it('ensures we have scroll marker package installed', () => {
        spyOn(ScrollMarkersService, 'ensureScrollViewInstalled');
        createScrollMarkersService();
        expect(ScrollMarkersService.ensureScrollViewInstalled).toHaveBeenCalled();
      });
    });
  });

  describe('destroyScrollMarkers', () => {
    beforeEach(() => {
      createScrollMarkersService();
    });

    describe('when there is no scroll marker API', () => {
      it('does not blow up', () => {
        scrollMarkersService.scrollMarkerAPI = null;
        scrollMarkersService.destroyScrollMarkers();
      });
    });

    it('destroys the marker view from the scroll bar API', () => {
      const editor = {};
      const markerView = { destroy: () => {} };
      scrollMarkerApi.scrollMarkerViewForEditor = () => markerView;
      spyOn(scrollMarkerApi, 'scrollMarkerViewForEditor').andCallThrough();
      spyOn(markerView, 'destroy');

      scrollMarkersService.destroyScrollMarkers(editor);
      expect(scrollMarkerApi.scrollMarkerViewForEditor).toHaveBeenCalledWith(editor);
      expect(markerView.destroy).toHaveBeenCalled();
    });
  });

  describe('setScrollMarkerView', () => {
    const editor = { id: 9999 };
    const layer = { syncToMarkerLayer: () => {} };
    const markerView = { getLayer: () => layer };
    const visibleMarkerLayer = {};
    const selectedMarkerLayer = {};

    beforeEach(() => {
      createScrollMarkersService();
      scrollMarkerApi.scrollMarkerViewForEditor = () => markerView;
      selectionManager.editorToMarkerLayerMap = {};
      selectionManager.editorToMarkerLayerMap[editor.id] = {
        visibleMarkerLayer,
        selectedMarkerLayer,
      };
    });

    describe('when show results on scroll bar is disabled', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showResultsOnScrollBar', false);
      });

      it('does not use the api', () => {
        scrollMarkerApi.scrollMarkerViewForEditor = () => {};
        spyOn(scrollMarkerApi, 'scrollMarkerViewForEditor');
        scrollMarkersService.setScrollMarkerView();
        expect(scrollMarkerApi.scrollMarkerViewForEditor).not.toHaveBeenCalled();
      });
    });

    describe('when the scroll marker API is not set', () => {
      it('does not blow up', () => {
        scrollMarkersService.scrollMarkerAPI = null;
        expect(scrollMarkersService.setScrollMarkerView()).toBeUndefined();
      });
    });

    it('gets the scroll marker view for the editor', () => {
      spyOn(scrollMarkerApi, 'scrollMarkerViewForEditor').andCallThrough();

      scrollMarkersService.setScrollMarkerView(editor);
      expect(scrollMarkerApi.scrollMarkerViewForEditor).toHaveBeenCalledWith(editor);
    });

    it('syncs the visibleMarkerLayer from selection manager to the scroll marker api', () => {
      spyOn(markerView, 'getLayer').andCallThrough();
      spyOn(layer, 'syncToMarkerLayer');

      scrollMarkersService.setScrollMarkerView(editor);

      expect(markerView.getLayer).toHaveBeenCalledWith('highlight-selected-marker-layer');
      expect(layer.syncToMarkerLayer).toHaveBeenCalledWith(visibleMarkerLayer);
    });

    it('syncs the selectedMarkerLayer from selection manager to the scroll marker api', () => {
      spyOn(markerView, 'getLayer').andCallThrough();
      spyOn(layer, 'syncToMarkerLayer');

      scrollMarkersService.setScrollMarkerView(editor);

      expect(markerView.getLayer).toHaveBeenCalledWith('highlight-selected-selected-marker-layer');
      expect(layer.syncToMarkerLayer).toHaveBeenCalledWith(selectedMarkerLayer);
    });
  });

  describe('setupConfigObserver', () => {
    beforeEach(() => {
      createScrollMarkersService();
    });

    describe('when enabling show results on scroll bar', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showResultsOnScrollBar', false);
      });

      it('ensures the scroll bar package is installed', () => {
        spyOn(ScrollMarkersService, 'ensureScrollViewInstalled');
        atom.config.set('highlight-selected.showResultsOnScrollBar', true);

        expect(ScrollMarkersService.ensureScrollViewInstalled).toHaveBeenCalled();
      });

      it('sets scroll marker view for any open editor', () => {
        atom.project.setPaths([path.join(__dirname, 'fixtures')]);
        waitsForPromise(() => atom.workspace.open('sample.php'));

        runs(() => {
          const editor = atom.workspace.getActiveTextEditor();
          spyOn(scrollMarkersService, 'setScrollMarkerView');
          atom.config.set('highlight-selected.showResultsOnScrollBar', true);
          expect(scrollMarkersService.setScrollMarkerView).toHaveBeenCalledWith(editor);
        });
      });
    });

    describe('when disabling show results on scroll bar', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showResultsOnScrollBar', true);
        // Turn off the editor subscriptions otherwise everything breaks as we have stubbed out the
        // Scroll Marker API. We do not want to actually run the thing.
        scrollMarkersService.editorSubscriptions.dispose();
      });

      it('destroys scroll markers for open editors', () => {
        atom.project.setPaths([path.join(__dirname, 'fixtures')]);
        waitsForPromise(() => atom.workspace.open('sample.php'));

        runs(() => {
          const editor = atom.workspace.getActiveTextEditor();
          spyOn(scrollMarkersService, 'destroyScrollMarkers');
          atom.config.set('highlight-selected.showResultsOnScrollBar', false);
          expect(scrollMarkersService.destroyScrollMarkers).toHaveBeenCalledWith(editor);
        });
      });
    });
  });
});
