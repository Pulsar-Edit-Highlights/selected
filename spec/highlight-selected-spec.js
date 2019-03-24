const path = require('path');
const { Range, Point } = require('atom');

// This spec is more of an end-to-end test.
describe('HighlightSelected', () => {
  let [
    workspaceElement,
    minimap,
    editor,
    editorElement,
    highlightSelected,
    minimapHS,
    minimapModule
  ] = Array.from([]);

  const hasMinimap =
    atom.packages.getAvailablePackageNames().indexOf('minimap') !== -1 &&
    atom.packages.getAvailablePackageNames().indexOf('minimap-highlight-selected') !== -1;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'fixtures')]);
  });

  afterEach(() => {
    highlightSelected.deactivate();
    if (minimapHS) {
      minimapHS.deactivate();
    }
    if (minimapModule) {
      minimapModule.deactivate();
    }
  });

  describe('when opening a coffee file', () => {
    beforeEach(() => {
      waitsForPromise(() =>
        atom.packages.activatePackage('status-bar').then(() => {
          workspaceElement.querySelector('status-bar');
        })
      );

      waitsForPromise(() =>
        atom.packages.activatePackage('highlight-selected').then(({ mainModule }) => {
          highlightSelected = mainModule;
        })
      );

      if (hasMinimap) {
        waitsForPromise(() =>
          atom.packages.activatePackage('minimap').then(({ mainModule }) => {
            minimapModule = mainModule;
          })
        );
        waitsForPromise(() =>
          atom.packages.activatePackage('minimap-highlight-selected').then(({ mainModule }) => {
            minimapHS = mainModule;
          })
        );
      }

      waitsForPromise(() =>
        atom.workspace.open('sample.coffee').then(
          () => null,
          error => {
            throw error.stack;
          }
        )
      );

      runs(() => {
        jasmine.attachToDOM(workspaceElement);
        editor = atom.workspace.getActiveTextEditor();
        editorElement = atom.views.getView(editor);
        editorElement.setHeight(250);
        editorElement.component.measureDimensions();
      });
    });

    describe('updates debounce when config is changed', () => {
      beforeEach(() => {
        spyOn(highlightSelected.selectionManager, 'debouncedHandleSelection');
        atom.config.set('highlight-selected.timeout', 20000);
      });

      it('calls createDebouce', () => {
        expect(highlightSelected.selectionManager.debouncedHandleSelection).toHaveBeenCalled();
      });
    });

    describe('when a whole word is selected', () => {
      beforeEach(() => {
        const range = new Range(new Point(8, 2), new Point(8, 8));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('adds the decoration to all words', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
      });

      it('creates the highlight selected status bar element', () => {
        expect(workspaceElement.querySelector('status-bar')).toExist();
        expect(workspaceElement.querySelector('.highlight-selected-status')).toExist();
      });

      it('updates the status bar with highlights number', () => {
        const content = workspaceElement.querySelector('.highlight-selected-status').innerHTML;
        expect(content).toBe('Highlighted: 4');
      });

      describe('when the status bar is disabled', () => {
        beforeEach(() => atom.config.set('highlight-selected.showInStatusBar', false));

        it("highlight isn't attached", () => {
          expect(workspaceElement.querySelector('status-bar')).toExist();
          expect(workspaceElement.querySelector('.highlight-selected-status')).not.toExist();
        });
      });
    });

    describe('when hide highlight on selected word is enabled', () => {
      beforeEach(() => atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true));

      describe('when a single line is selected', () => {
        beforeEach(() => {
          const range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          advanceClock(20000);
        });

        it('adds the decoration only on selected words', () => {
          expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });

      describe('when multi lines are selected', () => {
        beforeEach(() => {
          const range1 = new Range(new Point(8, 2), new Point(8, 8));
          const range2 = new Range(new Point(9, 2), new Point(9, 8));
          editor.setSelectedBufferRanges([range1, range2]);
          advanceClock(20000);
        });

        it('adds the decoration only on selected words', () => {
          expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
    });

    describe("leading whitespace doesn't get used", () => {
      beforeEach(() => {
        const range = new Range(new Point(8, 0), new Point(8, 8));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it("doesn't add regions", () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });
    });

    describe('ignores whitespace only selections', () => {
      beforeEach(() => atom.config.set('highlight-selected.onlyHighlightWholeWords', false));

      it('ignores space only selections', () => {
        const range = new Range(new Point(8, 0), new Point(8, 2));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });

      it('allows selections to include whitespace', () => {
        const range = new Range(new Point(8, 0), new Point(8, 8));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
      });
    });

    describe('ignores selections that contain a new line', () => {
      beforeEach(() => atom.config.set('highlight-selected.onlyHighlightWholeWords', false));

      it('ignores a selection of a single newline', () => {
        const range = new Range(new Point(7, 14), new Point(8, 0)); // '\n'
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });

      it('ignores any selection containing a newline', () => {
        const range = new Range(new Point(7, 14), new Point(8, 8)); // '\n  string'
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });
    });

    describe('will highlight non whole words', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.onlyHighlightWholeWords', false);
        const range = new Range(new Point(10, 13), new Point(10, 17));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('does add regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
      });
    });

    describe('will not highlight non whole words', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
        const range = new Range(new Point(10, 13), new Point(10, 17));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('does add regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
      });
    });

    describe('will not highlight less than minimum length', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.minimumLength', 7);
        const range = new Range(new Point(4, 0), new Point(4, 6));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it("doesn't add regions", () =>
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0));
    });

    describe('will not highlight words in different case', () => {
      beforeEach(() => {
        const range = new Range(new Point(4, 0), new Point(4, 6));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('does add regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
      });
    });

    describe('will highlight words in different case', () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.ignoreCase', true);
        const range = new Range(new Point(4, 0), new Point(4, 6));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('does add regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
      });

      describe('adds background to selected', () => {
        beforeEach(() => {
          atom.config.set('highlight-selected.highlightBackground', true);
          const range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          advanceClock(20000);
        });

        it('adds the background to all highlights', () => {
          expect(
            editorElement.querySelectorAll('.highlight-selected.background .region')
          ).toHaveLength(4);
        });
      });

      describe('adds light theme to selected', () => {
        beforeEach(() => {
          atom.config.set('highlight-selected.lightTheme', true);
          const range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          advanceClock(20000);
        });

        it('adds the background to all highlights', () =>
          expect(
            editorElement.querySelectorAll('.highlight-selected.light-theme .region')
          ).toHaveLength(4));
      });
    });

    if (hasMinimap) {
      describe('minimap highlight selected still works', () => {
        beforeEach(() => {
          editor = atom.workspace.getActiveTextEditor();
          minimap = minimapModule.minimapForEditor(editor);

          spyOn(minimap, 'decorateMarker').andCallThrough();
          const range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          advanceClock(20000);
        });

        it('adds a decoration for the selection in the minimap', () => {
          expect(minimap.decorateMarker).toHaveBeenCalled();
        });
      });
    }
  });

  describe('when opening a php file', () => {
    beforeEach(() => {
      waitsForPromise(() =>
        atom.packages.activatePackage('highlight-selected').then(({ mainModule }) => {
          highlightSelected = mainModule;
        })
      );

      waitsForPromise(() =>
        atom.workspace.open('sample.php').then(
          () => editor,
          error => {
            throw error.stack;
          }
        )
      );

      waitsForPromise(() => atom.packages.activatePackage('language-php'));

      runs(() => {
        jasmine.attachToDOM(workspaceElement);
        editor = atom.workspace.getActiveTextEditor();
        editorElement = atom.views.getView(editor);
      });
    });

    describe("being able to highlight variables with '$'", () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
        const range = new Range(new Point(1, 2), new Point(1, 7));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('finds 3 regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
      });
    });

    describe("not being able to highlight variables when not selecting '$'", () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
        const range = new Range(new Point(1, 3), new Point(1, 7));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('finds 0 regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });
    });

    describe("being able to highlight other strings when not selecting '@'", () => {
      beforeEach(() => {
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
        const range = new Range(new Point(3, 6), new Point(3, 10));
        editor.setSelectedBufferRange(range);
        advanceClock(20000);
      });

      it('finds 0 regions', () => {
        expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
      });
    });
  });
});
