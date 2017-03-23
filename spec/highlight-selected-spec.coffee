path = require 'path'
{Range, Point} = require 'atom'
HighlightSelected = require '../lib/highlight-selected'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.

describe "HighlightSelected", ->
  [activationPromise, workspaceElement, minimap, statusBar,
   editor, editorElement, highlightSelected, minimapHS, minimapModule] = []

  hasMinimap = atom.packages.getAvailablePackageNames()
    .indexOf('minimap') isnt -1 and atom.packages.getAvailablePackageNames()
    .indexOf('minimap-highlight-selected') isnt -1

  hasStatusBar = atom.packages.getAvailablePackageNames()
    .indexOf('status-bar') isnt -1

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    atom.project.setPaths([path.join(__dirname, 'fixtures')])

  afterEach ->
    highlightSelected.deactivate()
    minimapHS?.deactivate()
    minimapModule?.deactivate()

  describe "when opening a coffee file", ->
    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage('status-bar').then (pack) ->
          statusBar = workspaceElement.querySelector("status-bar")

      waitsForPromise ->
        atom.packages.activatePackage('highlight-selected')
          .then ({mainModule}) ->
            highlightSelected = mainModule

      # if hasMinimap
      #   waitsForPromise ->
      #     atom.packages.activatePackage('minimap').then ({mainModule}) ->
      #       minimapModule = mainModule
      #   waitsForPromise ->
      #     atom.packages.activatePackage('minimap-highlight-selected')
      #       .then ({mainModule}) ->
      #         minimapHS = mainModule

      waitsForPromise ->
        atom.workspace.open('sample.coffee').then(
          (editor) -> editor
          ,
          (error) -> throw(error.stack)
        )

      runs ->
        jasmine.attachToDOM(workspaceElement)
        editor = atom.workspace.getActiveTextEditor()
        editorElement = atom.views.getView(editor)

    describe "updates debounce when config is changed", ->
      beforeEach ->
        spyOn(highlightSelected.areaView, 'debouncedHandleSelection')
        atom.config.set('highlight-selected.timeout', 20000)

      it 'calls createDebouce', ->
        expect(highlightSelected.areaView.debouncedHandleSelection)
          .toHaveBeenCalled()

    describe "when a whole word is selected", ->
      beforeEach ->
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "adds the decoration to all words", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(4)

      it "creates the highlight selected status bar element", ->
        expect(workspaceElement.querySelector('status-bar')).toExist()
        expect(workspaceElement.querySelector('.highlight-selected-status'))
          .toExist()

      it "updates the status bar with highlights number", ->
        content = workspaceElement.querySelector(
          '.highlight-selected-status').innerHTML
        expect(content).toBe('Highlighted: 4')

      describe "when the status bar is disabled", ->
        beforeEach ->
          atom.config.set('highlight-selected.showInStatusBar', false)

        it "highlight isn't attached", ->
          expect(workspaceElement.querySelector('status-bar')).toExist()
          expect(workspaceElement.querySelector('.highlight-selected-status'))
            .not.toExist()

    describe "when hide highlight on selected word is enabled", ->
      beforeEach ->
        atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true)

      describe "when a single line is selected", ->
        beforeEach ->
          range = new Range(new Point(8, 2), new Point(8, 8))
          editor.setSelectedBufferRange(range)
          advanceClock(20000)

        it "adds the decoration only on selected words", ->
          expect(editorElement.querySelectorAll(
            '.highlight-selected .region')).toHaveLength(3)

      describe "when multi lines are selected", ->
        beforeEach ->
          range1 = new Range(new Point(8, 2), new Point(8, 8))
          range2 = new Range(new Point(9, 2), new Point(9, 8))
          editor.setSelectedBufferRanges([range1, range2])
          advanceClock(20000)

        it "adds the decoration only on selected words", ->
          expect(editorElement.querySelectorAll(
            '.highlight-selected .region')).toHaveLength(2)

    describe "leading whitespace doesn't get used", ->
      beforeEach ->
        range = new Range(new Point(8, 0), new Point(8, 8))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "doesn't add regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(0)

    describe "will highlight non whole words", ->
      beforeEach ->
        atom.config.set('highlight-selected.onlyHighlightWholeWords', false)
        range = new Range(new Point(10, 13), new Point(10, 17))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "does add regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(3)

    describe "will not highlight non whole words", ->
      beforeEach ->
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true)
        range = new Range(new Point(10, 13), new Point(10, 17))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "does add regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(2)

    describe "will not highlight less than minimum length", ->
      beforeEach ->
        atom.config.set('highlight-selected.minimumLength', 7)
        range = new Range(new Point(4, 0), new Point(4, 6))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "doesn't add regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(0)

    describe "will not highlight words in different case", ->
      beforeEach ->
        range = new Range(new Point(4, 0), new Point(4, 6))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "does add regions", ->
        expect(editorElement.querySelectorAll('
          .highlight-selected .region')).toHaveLength(2)

    describe "will highlight words in different case", ->
      beforeEach ->
        atom.config.set('highlight-selected.ignoreCase', true)
        range = new Range(new Point(4, 0), new Point(4, 6))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "does add regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(5)

      describe "adds background to selected", ->
        beforeEach ->
          atom.config.set('highlight-selected.highlightBackground', true)
          range = new Range(new Point(8, 2), new Point(8, 8))
          editor.setSelectedBufferRange(range)
          advanceClock(20000)

        it "adds the background to all highlights", ->
          expect(editorElement.querySelectorAll('.highlight-selected.background
            .region')).toHaveLength(4)

      describe "adds light theme to selected", ->
        beforeEach ->
          atom.config.set('highlight-selected.lightTheme', true)
          range = new Range(new Point(8, 2), new Point(8, 8))
          editor.setSelectedBufferRange(range)
          advanceClock(20000)

        it "adds the background to all highlights", ->
          expect(editorElement.querySelectorAll('.highlight-selected.light-theme
            .region')).toHaveLength(4)

    # if hasMinimap
    #   describe "minimap highlight selected still works", ->
    #     beforeEach ->
    #       editor = atom.workspace.getActiveTextEditor()
    #       minimap = minimapModule.minimapForEditor(editor)
    #
    #       spyOn(minimap, 'decorateMarker').andCallThrough()
    #       range = new Range(new Point(8, 2), new Point(8, 8))
    #       editor.setSelectedBufferRange(range)
    #       advanceClock(20000)
    #
    #     it 'adds a decoration for the selection in the minimap', ->
    #       expect(minimap.decorateMarker).toHaveBeenCalled()

  describe "when opening a php file", ->
    beforeEach ->
      waitsForPromise ->
        atom.packages.activatePackage('highlight-selected')
          .then ({mainModule}) ->
            highlightSelected = mainModule

      waitsForPromise ->
        atom.workspace.open('sample.php').then(
          (editor) -> editor
          ,
          (error) -> throw(error.stack)
        )

      waitsForPromise ->
        atom.packages.activatePackage('language-php')

      runs ->
        jasmine.attachToDOM(workspaceElement)
        editor = atom.workspace.getActiveTextEditor()
        editorElement = atom.views.getView(editor)

    describe "being able to highlight variables with '$'", ->
      beforeEach ->
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true)
        range = new Range(new Point(1, 2), new Point(1, 7))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "finds 3 regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(3)

    describe "being able to highlight variables when not selecting '$'", ->
      beforeEach ->
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true)
        range = new Range(new Point(1, 3), new Point(1, 7))
        editor.setSelectedBufferRange(range)
        advanceClock(20000)

      it "finds 4 regions", ->
        expect(editorElement.querySelectorAll(
          '.highlight-selected .region')).toHaveLength(4)
