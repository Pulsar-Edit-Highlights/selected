const { CompositeDisposable } = require('atom');
const main = require('../lib/main.js');
const SelectionManager = require('../lib/selection-manager.js');
const StatusBarService = require('../lib/status-bar/status-bar-service.js');
const ScrollMarkersService = require('../lib/scroll-markers/scroll-markers-service.js');

describe('Main', () => {
  describe('config', () => {
    it('has onlyHighlightWholeWords as boolean', () => {
      expect(main.config.onlyHighlightWholeWords.type).toBe('boolean');
    });

    it('has onlyHighlightWholeWords default is true', () => {
      expect(main.config.onlyHighlightWholeWords.default).toBe(true);
    });

    it('has hideHighlightOnSelectedWord as boolean', () => {
      expect(main.config.hideHighlightOnSelectedWord.type).toBe('boolean');
    });

    it('has hideHighlightOnSelectedWord default is flase', () => {
      expect(main.config.hideHighlightOnSelectedWord.default).toBe(false);
    });

    it('has ignoreCase type is boolean', () => {
      expect(main.config.ignoreCase.type).toBe('boolean');
    });

    it('has ignoreCase default is false', () => {
      expect(main.config.ignoreCase.default).toBe(false);
    });

    it('has lightTheme type to be boolean', () => {
      expect(main.config.lightTheme.type).toBe('boolean');
    });

    it('has lightTheme default to be false', () => {
      expect(main.config.lightTheme.default).toBe(false);
    });

    it('has highlightBackground type as boolean', () => {
      expect(main.config.highlightBackground.type).toBe('boolean');
    });

    it('has highlightBackground default as false', () => {
      expect(main.config.highlightBackground.default).toBe(false);
    });

    it('has minimumLength as type integer', () => {
      expect(main.config.minimumLength.type).toBe('integer');
    });

    it('has minimumLength default of 2', () => {
      expect(main.config.minimumLength.default).toBe(2);
    });

    it('has maximumHighlights as type integer', () => {
      expect(main.config.maximumHighlights.type).toBe('integer');
    });

    it('has maximumHighlights default of 500', () => {
      expect(main.config.maximumHighlights.default).toBe(500);
    });

    it('has timout as type integer', () => {
      expect(main.config.timeout.type).toBe('integer');
    });

    it('has timout defualt of 20', () => {
      expect(main.config.timeout.default).toBe(20);
    });

    it('has showInStatusBar as type boolean', () => {
      expect(main.config.showInStatusBar.type).toBe('boolean');
    });

    it('has showInStatusBar default of true', () => {
      expect(main.config.showInStatusBar.default).toBe(true);
    });

    it('has highlightInPanes as type boolean', () => {
      expect(main.config.highlightInPanes.type).toBe('boolean');
    });

    it('has highlightInPanes with default value of true', () => {
      expect(main.config.highlightInPanes.default).toBe(true);
    });

    it('has statusBarString as type string', () => {
      expect(main.config.statusBarString.type).toBe('string');
    });

    it('has statusBarString default of value that incldues %c', () => {
      expect(main.config.statusBarString.default).toBe('Highlighted: %c');
      expect(main.config.statusBarString.default.indexOf('%c') !== -1).toBe(true);
    });

    it('has allowedCharactersToSelect as type string', () => {
      expect(main.config.allowedCharactersToSelect.type).toBe('string');
    });

    it('has allowedCharactersToSelect with sensible default', () => {
      expect(main.config.allowedCharactersToSelect.default).toBe('$@%-');
    });

    it('has showResultsOnScrollBar with type boolean', () => {
      expect(main.config.showResultsOnScrollBar.type).toBe('boolean');
    });

    it('has showResultsOnScrollBar with default value of false', () => {
      expect(main.config.showResultsOnScrollBar.default).toBe(false);
    });
  });

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
