const StatusBarService = require('../../Source/status-bar/status-bar-service');

describe('StatusBarService', () => {
  let statusBarService;
  let selectionManager;
  let statusBarApi;
  const tile = { destroy: () => {} };

  const createStatusBarService = () => {
    statusBarApi = {
      addLeftTile: () => tile,
    };
    spyOn(statusBarApi, 'addLeftTile').andCallThrough();
    selectionManager = {
      onDidFinishAddingMarkers: () => {},
      onDidRemoveAllMarkers: () => {},
    };
    spyOn(selectionManager, 'onDidFinishAddingMarkers');
    spyOn(selectionManager, 'onDidRemoveAllMarkers');
    statusBarService = new StatusBarService(statusBarApi, selectionManager);
  };

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('highlight-selected'));
    waitsForPromise(() => atom.packages.activatePackage('status-bar'));
  });

  it('listens for once all markers are added', () => {
    createStatusBarService();
    expect(selectionManager.onDidFinishAddingMarkers).toHaveBeenCalled();
  });

  it('listens for for when all markers have been removed', () => {
    createStatusBarService();
    expect(selectionManager.onDidRemoveAllMarkers).toHaveBeenCalled();
  });

  describe('destroy', () => {
    let selectionSubscriptionSpy;

    beforeEach(() => {
      createStatusBarService();
      selectionSubscriptionSpy = {
        dispose: () => {},
      };
      spyOn(selectionSubscriptionSpy, 'dispose');
      statusBarService.selectionSubscription = selectionSubscriptionSpy;
      spyOn(statusBarService, 'removeStatusBarView');
    });

    it('removes subscriptions', () => {
      statusBarService.destroy();
      expect(selectionSubscriptionSpy.dispose).toHaveBeenCalled();
    });

    it('removes status bar', () => {
      statusBarService.destroy();
      expect(statusBarService.removeStatusBarView).toHaveBeenCalled();
    });
  });

  describe('listenForStatusBarConfigChange', () => {
    beforeEach(() => {
      createStatusBarService();
    });

    describe('when it is enabled', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showInStatusBar', true);
        const selectionSubscriptionSpy = {
          dispose: () => {},
        };
        spyOn(selectionSubscriptionSpy, 'dispose');
        statusBarService.selectionSubscription = selectionSubscriptionSpy;
      });

      it('calls removeStatusBarView when set to false', () => {
        spyOn(statusBarService, 'removeStatusBarView');
        atom.config.set('highlight-selected.showInStatusBar', false);
        expect(statusBarService.removeStatusBarView).toHaveBeenCalled();
      });
    });

    describe('when it is disabled', () => {
      beforeEach(() => {
        spyOn(statusBarService, 'removeStatusBarView');
        atom.config.set('highlight-selected.showInStatusBar', false);
      });

      it('calls setupStatusBarView when set to true', () => {
        spyOn(statusBarService, 'setupStatusBarView');
        atom.config.set('highlight-selected.showInStatusBar', true);
        expect(statusBarService.setupStatusBarView).toHaveBeenCalled();
      });
    });
  });

  describe('setupStatusBarView', () => {
    describe('when we already have an element setup', () => {
      const element = {
        temp: 'Object',
      };

      beforeEach(() => {
        createStatusBarService();
        statusBarService.statusBarElement = element;
      });

      it('does not overwrite element', () => {
        statusBarService.setupStatusBarView();
        expect(statusBarService.statusBarElement).toBe(element);
      });
    });

    describe('when we have not enabled the status bar', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showInStatusBar', false);
        createStatusBarService();
      });

      it('does not have an element', () => {
        expect(statusBarService.statusBarElement).toBeUndefined();
      });
    });

    describe('when we have enabled the status bar', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.showInStatusBar', true);
        createStatusBarService();
      });

      it('adds the status bar to the left hand side', () => {
        expect(statusBarApi.addLeftTile).toHaveBeenCalledWith({
          item: statusBarService.statusBarElement.getElement(),
          priority: 100,
        });
      });
    });
  });

  describe('removeStatusBarView', () => {
    beforeEach(() => {
      atom.config.set('highlight-selected.showInStatusBar', true);
      createStatusBarService();
    });

    describe('when there is not an element', () => {
      beforeEach(() => {
        statusBarService.statusBarElement = null;
      });

      it('does not destroy the tile', () => {
        spyOn(tile, 'destroy');
        statusBarService.removeStatusBarView();
        expect(tile.destroy).not.toHaveBeenCalled();
      });
    });

    describe('when there is an element', () => {
      let statusBarElement;

      beforeEach(() => {
        ({ statusBarElement } = statusBarService);
        spyOn(statusBarElement, 'removeElement');
      });

      it('removes the element', () => {
        statusBarService.removeStatusBarView();
        expect(statusBarElement.removeElement).toHaveBeenCalled();
      });

      it('destroys the tile', () => {
        spyOn(tile, 'destroy');
        statusBarService.removeStatusBarView();
        expect(tile.destroy).toHaveBeenCalled();
      });

      it('sets the tile to be null', () => {
        expect(statusBarService.statusBarTile).not.toBeNull();
        statusBarService.removeStatusBarView();
        expect(statusBarService.statusBarTile).toBeNull();
      });

      it('sets the element to be null', () => {
        expect(statusBarService.statusBarElement).not.toBeNull();
        statusBarService.removeStatusBarView();
        expect(statusBarService.statusBarElement).toBeNull();
      });
    });
  });

  describe('updateCount', () => {
    beforeEach(() => {
      createStatusBarService();
    });

    describe('when there is no element', () => {
      beforeEach(() => {
        statusBarService.statusBarElement = null;
      });

      it('does not error', () => {
        statusBarService.updateCount();
      });
    });

    it('calls the updateCount function on the element', () => {
      const { statusBarElement } = statusBarService;
      spyOn(statusBarElement, 'updateCount');
      statusBarService.updateCount();
      expect(statusBarElement.updateCount).toHaveBeenCalled();
    });

    it("uses the selection manager's resultCount", () => {
      const number = 123;
      selectionManager.resultCount = number;
      const { statusBarElement } = statusBarService;
      spyOn(statusBarElement, 'updateCount');
      statusBarService.updateCount();
      expect(statusBarElement.updateCount).toHaveBeenCalledWith(number);
    });
  });
});
