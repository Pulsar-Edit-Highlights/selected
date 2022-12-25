const { CompositeDisposable } = require('atom');
const SelectionManager = require('./selection-manager');
const ScrollMarkersService = require('./scroll-markers/scroll-markers-service');
const StatusBarService = require('./status-bar/status-bar-service');

module.exports = {

  selectionManager: null,

  activate() {
    this.selectionManager = new SelectionManager();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.listenForCommands());

    this.scrollMarkersService = new ScrollMarkersService(this.selectionManager);
  },

  deactivate() {
    if (this.selectionManager) {
      this.selectionManager.destroy();
    }
    this.selectionManager = null;
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    if (this.scrollMarkersService) {
      this.scrollMarkersService.destroy();
    }
    this.scrollMarkersService = null;
    if (this.statusBarService) {
      this.statusBarService.destroy();
    }
    this.statusBarService = null;
  },

  provideHighlightSelectedV1Deprecated() {
    return this.selectionManager;
  },

  provideHighlightSelectedV2() {
    return this.selectionManager;
  },

  consumeStatusBar(statusBar) {
    this.statusBarService = new StatusBarService(statusBar, this.selectionManager);
  },

  toggle() {
    if (this.selectionManager.disabled) {
      return this.selectionManager.enable();
    }
    return this.selectionManager.disable();
  },

  selectAll() {
    return this.selectionManager.selectAll();
  },

  consumeScrollMarker(scrollMarkerAPI) {
    this.scrollMarkersService.setScrollMarkerAPI(scrollMarkerAPI);
  },

  listenForCommands() {
    return atom.commands.add('atom-workspace', {
      'highlight-selected:toggle': () => this.toggle(),
      'highlight-selected:select-all': () => this.selectAll(),
    });
  },
};
