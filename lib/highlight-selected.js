const { CompositeDisposable } = require('atom');
const HighlightedAreaView = require('./highlighted-area-view');

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

  areaView: null,

  activate() {
    this.areaView = new HighlightedAreaView();
    this.subscriptions = new CompositeDisposable();

    return this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'highlight-selected:toggle': () => this.toggle(),
        'highlight-selected:select-all': () => this.selectAll()
      })
    );
  },

  deactivate() {
    if (this.areaView != null) {
      this.areaView.destroy();
    }
    this.areaView = null;
    if (this.subscriptions != null) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  },

  provideHighlightSelectedV1Deprecated() {
    return this.areaView;
  },

  provideHighlightSelectedV2() {
    return this.areaView;
  },

  consumeStatusBar(statusBar) {
    return this.areaView.setStatusBar(statusBar);
  },

  toggle() {
    if (this.areaView.disabled) {
      return this.areaView.enable();
    }
    return this.areaView.disable();
  },

  selectAll() {
    return this.areaView.selectAll();
  },

  consumeScrollMarker(scrollMarkerAPI) {
    return this.areaView.setScrollMarker(scrollMarkerAPI);
  }
};
