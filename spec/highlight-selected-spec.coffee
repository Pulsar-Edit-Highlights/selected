path = require 'path'
{Range, Point} = require 'atom'
HighlightSelected = require '../lib/highlight-selected'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.

describe "HighlightSelected", ->
  [activationPromise, workspaceElement, minimap,
   editor, editorElement, highlightSelected, minimapHS, minimapModule] = []

  hasMinimap = atom.packages.getAvailablePackageNames()
    .indexOf('minimap') isnt -1 and atom.packages.getAvailablePackageNames()
    .indexOf('minimap-highlight-selected') isnt -1

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    atom.project.setPaths([path.join(__dirname, 'fixtures')])

    waitsForPromise ->
      atom.packages.activatePackage('highlight-selected').then ({mainModule}) ->
        highlightSelected = mainModule

    if hasMinimap
      waitsForPromise ->
        atom.packages.activatePackage('minimap').then ({mainModule}) ->
          minimapModule = mainModule
      waitsForPromise ->
        atom.packages.activatePackage('minimap-highlight-selected')
          .then ({mainModule}) ->
            minimapHS = mainModule

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

  afterEach ->
    highlightSelected.deactivate()
    minimapHS?.deactivate()
    minimapModule?.deactivate()

  describe "when the view is loaded", ->
    it "does not attach to the view", ->
      expect(workspaceElement
        .querySelectorAll('.highlight-selected')
        ).toHaveLength(0)

  describe "when a whole word is selected", ->
    beforeEach ->
      range = new Range(new Point(8, 2), new Point(8, 8))
      editor.setSelectedBufferRange(range)

    it "adds the decoration to all words", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(4)

  describe "when hide highlight on selected word is enabled", ->
    beforeEach ->
      atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true)

    describe "when a single line is selected", ->
      beforeEach ->
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it "adds the decoration only no selected words", ->
        expect(editorElement.shadowRoot
          .querySelectorAll('.highlight-selected .region')
          ).toHaveLength(3)

    describe "when multi lines are selected", ->
      beforeEach ->
        range1 = new Range(new Point(8, 2), new Point(8, 8))
        range2 = new Range(new Point(9, 2), new Point(9, 8))
        editor.setSelectedBufferRanges([range1, range2])

      it "adds the decoration only no selected words", ->
        expect(editorElement.shadowRoot
          .querySelectorAll('.highlight-selected .region')
          ).toHaveLength(2)

  describe "leading whitespace doesn't get used", ->
    beforeEach ->
      range = new Range(new Point(8, 0), new Point(8, 8))
      editor.setSelectedBufferRange(range)

    it "doesn't add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(0)

  describe "will highlight non whole words", ->
    beforeEach ->
      range = new Range(new Point(10, 13), new Point(10, 17))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(3)

  describe "will not highlight non whole words", ->
    beforeEach ->
      atom.config.set('highlight-selected.onlyHighlightWholeWords', true)
      range = new Range(new Point(10, 13), new Point(10, 17))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(2)

  describe "will not highlight less than minimum length", ->
    beforeEach ->
      atom.config.set('highlight-selected.minimumLength', 7)
      range = new Range(new Point(4, 0), new Point(4, 6))
      editor.setSelectedBufferRange(range)

    it "doesn't add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(0)

  describe "will not highlight words in different case", ->
    beforeEach ->
      range = new Range(new Point(4, 0), new Point(4, 6))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(2)

  describe "will highlight words in different case", ->
    beforeEach ->
      atom.config.set('highlight-selected.ignoreCase', true)
      range = new Range(new Point(4, 0), new Point(4, 6))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorElement.shadowRoot
        .querySelectorAll('.highlight-selected .region')
        ).toHaveLength(5)

    describe "adds background to selected", ->
      beforeEach ->
        atom.config.set('highlight-selected.highlightBackground', true)
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it "adds the background to all highlights", ->
        expect(editorElement.shadowRoot
          .querySelectorAll('.highlight-selected.background .region')
          ).toHaveLength(4)

    describe "adds light theme to selected", ->
      beforeEach ->
        atom.config.set('highlight-selected.lightTheme', true)
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it "adds the background to all highlights", ->
        expect(editorElement.shadowRoot
          .querySelectorAll('.highlight-selected.light-theme .region')
          ).toHaveLength(4)

  if hasMinimap
    describe "minimap highlight selected still works", ->
      beforeEach ->
        editor = atom.workspace.getActiveTextEditor()
        minimap = minimapModule.minimapForEditor(editor)

        spyOn(minimap, 'decorateMarker').andCallThrough()
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it 'adds a decoration for the selection in the minimap', ->
        expect(minimap.decorateMarker).toHaveBeenCalled()
