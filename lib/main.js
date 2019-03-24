const { CompositeDisposable } = require('atom');
const SelectionManager = require('./selection-manager');
const ScrollMarkersService = require('./scroll-markers/scroll-markers-service');
const StatusBarService = require('./status-bar/status-bar-service');

module.exports = {
  config: {
    onlyHighlightWholeWords: {
      type: 'boolean',
      default: true
    },
    hideHighlightOnSelectedWord: {
      type: 'boolean',
      default: false
    },
    ignoreCase: {
      type: 'boolean',
      default: false
    },
    lightTheme: {
      type: 'boolean',
      default: false
    },
    highlightBackground: {
      type: 'boolean',
      default: false
    },
    minimumLength: {
      type: 'integer',
      default: 2
    },
    maximumHighlights: {
      type: 'integer',
      default: 500,
      description: 'For performance purposes, the number of highlights is limited'
    },
    timeout: {
      type: 'integer',
      default: 20,
      description: 'Defers searching for matching strings for X ms'
    },
    showInStatusBar: {
      type: 'boolean',
      default: true,
      description: 'Show how many matches there are'
    },
    highlightInPanes: {
      type: 'boolean',
      default: true,
      description: 'Highlight selection in another panes'
    },
    statusBarString: {
      type: 'string',
      default: 'Highlighted: %c',
      description: 'The text to show in the status bar. %c = number of occurrences'
    },
    allowedCharactersToSelect: {
      type: 'string',
      default: '$@%-',
      description: 'Non Word Characters that are allowed to be selected'
    },
    showResultsOnScrollBar: {
      type: 'boolean',
      default: false,
      description: 'Show highlight on the scroll bar'
    }
  },

  selectionManager: null,

  activate() {
    this.selectionManager = new SelectionManager();
    this.subscriptions = new CompositeDisposable();

    return this.subscriptions.add(this.listenForCommands());
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
    this.scrollMarkersService = new ScrollMarkersService(this.selectionManager, scrollMarkerAPI);
  },

  listenForCommands() {
    return atom.commands.add('atom-workspace', {
      'highlight-selected:toggle': () => this.toggle(),
      'highlight-selected:select-all': () => this.selectAll()
    });
  }
};
