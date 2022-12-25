const { CompositeDisposable } = require('atom');
const main = require('../Source/App.js');
const SelectionManager = require('../Source/selection-manager.js');
const StatusBarService = require('../Source/status-bar/status-bar-service.js');
const ScrollMarkersService = require('../Source/scroll-markers/scroll-markers-service.js');

describe('Main', () => {

  describe('active', () => {
    it('creates a SelectionManager', () => {
      main.activate();
      expect(main.selectionManager instanceof SelectionManager).toBe(true);
    });

    it('will listen to commands', () => {
      spyOn(main, 'listenForCommands').andCallThrough();
      main.activate();
      expect(main.listenForCommands).toHaveBeenCalled();
    });

    it('has subscriptions that is a CompositeDisposable', () => {
      main.activate();
      expect(main.subscriptions instanceof CompositeDisposable).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('destroys the selection manager and sets it to null', () => {
      const selectionManager = jasmine.createSpyObj('SelectionManager', ['destroy']);
      main.selectionManager = selectionManager;
      main.deactivate();
      expect(selectionManager.destroy).toHaveBeenCalled();
      expect(main.selectionManager).toBeNull();
    });

    it('disposes of the subscriptions and sets it to null', () => {
      const subscriptions = jasmine.createSpyObj('subscriptions', ['dispose']);
      main.subscriptions = subscriptions;
      main.deactivate();
      expect(subscriptions.dispose).toHaveBeenCalled();
      expect(main.subscriptions).toBeNull();
    });

    it('destroys the scrollMarkersService and sets it to null', () => {
      const scrollMarkersService = jasmine.createSpyObj('scrollMarkersService', ['destroy']);
      main.scrollMarkersService = scrollMarkersService;
      main.deactivate();
      expect(scrollMarkersService.destroy).toHaveBeenCalled();
      expect(main.scrollMarkersService).toBeNull();
    });

    it('destroys the statusBarService and sets it to null', () => {
      const statusBarService = jasmine.createSpyObj('statusBarService', ['destroy']);
      main.statusBarService = statusBarService;
      main.deactivate();
      expect(statusBarService.destroy).toHaveBeenCalled();
      expect(main.statusBarService).toBeNull();
    });
  });

  describe('consumeStatusBar', () => {
    let statusBar;
    let selectionManager;

    beforeEach(() => {
      statusBar = {};
      selectionManager = {
        onDidFinishAddingMarkers: () => {},
        onDidRemoveAllMarkers: () => {},
      };
      main.selectionManager = selectionManager;
      main.consumeStatusBar(statusBar);
    });

    it('creates a StatusBarService', () => {
      expect(main.statusBarService instanceof StatusBarService).toBe(true);
    });

    it('assings selection manager correctly', () => {
      expect(main.statusBarService.selectionManager).toBe(selectionManager);
    });

    it('assings status bar object correctly', () => {
      expect(main.statusBarService.statusBar).toBe(statusBar);
    });
  });

  describe('toggle', () => {
    let selectionManager;

    describe('when selection manager is disabled', () => {
      beforeEach(() => {
        selectionManager = {
          disabled: true,
          enable: () => {},
          disable: () => {},
        };

        spyOn(selectionManager, 'enable');
        spyOn(selectionManager, 'disable');
        main.selectionManager = selectionManager;
      });

      it('enables the selection manager', () => {
        main.toggle();
        expect(selectionManager.enable).toHaveBeenCalled();
        expect(selectionManager.disable).not.toHaveBeenCalled();
      });
    });

    describe('when selection manager is enabled', () => {
      beforeEach(() => {
        selectionManager = {
          disabled: false,
          enable: () => {},
          disable: () => {},
        };

        spyOn(selectionManager, 'enable');
        spyOn(selectionManager, 'disable');
        main.selectionManager = selectionManager;
      });

      it('disables the selection manager', () => {
        main.toggle();
        expect(selectionManager.enable).not.toHaveBeenCalled();
        expect(selectionManager.disable).toHaveBeenCalled();
      });
    });
  });

  describe('selectAll', () => {
    it('calls selectAll on selectionMananger', () => {
      const selectionManager = jasmine.createSpyObj('selectionManager', ['selectAll']);
      main.selectionManager = selectionManager;
      main.selectAll();
      expect(selectionManager.selectAll).toHaveBeenCalled();
    });
  });

  describe('consumeScrollMarker', () => {
    let scrollMarkerAPI;
    let selectionManager;

    beforeEach(() => {
      scrollMarkerAPI = {};
      selectionManager = {
        onDidFinishAddingMarkers: () => {},
        onDidRemoveAllMarkers: () => {},
      };
      main.scrollMarkersService = new ScrollMarkersService(selectionManager);
      main.selectionManager = selectionManager;
      main.consumeScrollMarker(scrollMarkerAPI);
    });

    it('creates a ScrollMarkersService', () => {
      expect(main.scrollMarkersService instanceof ScrollMarkersService).toBe(true);
    });

    it('assings selection manager correctly', () => {
      expect(main.scrollMarkersService.selectionManager).toBe(selectionManager);
    });

    it('assings status bar object correctly', () => {
      expect(main.scrollMarkersService.scrollMarkerAPI).toBe(scrollMarkerAPI);
    });
  });

  describe('listenForCommands', () => {
    beforeEach(() => {
      main.listenForCommands();
    });

    it('adds a toggle command', () => {
      expect(atom.commands.registeredCommands['highlight-selected:toggle']).toBe(true);
    });

    it('and select all commands', () => {
      expect(atom.commands.registeredCommands['highlight-selected:select-all']).toBe(true);
    });
  });
});
