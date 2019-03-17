const StatusBarView = require('./status-bar-view');

module.exports = class StatusBarService {
  constructor(statusBar, selectionManager) {
    this.statusBar = statusBar;
    this.selectionManager = selectionManager;

    this.updateCount = this.updateCount.bind(this);

    this.listenForStatusBarConfigChange();
    this.setupListeners();

    this.setupStatusBarView();
  }

  destroy() {
    this.removeStatusBarView();
    if (this.selectionSubscription) {
      this.selectionSubscription.dispose();
    }
  }

  listenForStatusBarConfigChange() {
    return atom.config.onDidChange('highlight-selected.showInStatusBar', changed => {
      if (changed.newValue) {
        return this.setupStatusBarView();
      }
      return this.removeStatusBarView();
    });
  }

  setupListeners() {
    this.selectionManager.onDidFinishAddingMarkers(this.updateCount);
    this.selectionManager.onDidRemoveAllMarkers(this.updateCount);
  }

  setupStatusBarView() {
    if (this.statusBarElement) {
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

  removeStatusBarView() {
    if (!this.statusBarElement) {
      return;
    }
    this.statusBarElement.removeElement();
    if (this.statusBarTile) {
      this.statusBarTile.destroy();
    }
    this.statusBarTile = null;
    this.statusBarElement = null;
  }

  updateCount() {
    if (!this.statusBarElement) {
      return;
    }
    this.statusBarElement.updateCount(this.selectionManager.resultCount);
  }
};
