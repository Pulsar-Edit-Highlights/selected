path = require 'path'
{WorkspaceView, Range, Point} = require 'atom'
HighlightSelected = require '../lib/highlight-selected'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.

describe "DecorationExample", ->
  [activationPromise, editor, editorView, highlightSelected] = []

  beforeEach ->
    atom.workspaceView = new WorkspaceView
    atom.project.setPath(path.join(__dirname, 'fixtures'))

    waitsForPromise ->
      atom.workspace.open('sample.coffee')

    runs ->
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()
      editor = editorView.getEditor()

      activationPromise = atom.packages
        .activatePackage('highlight-selected').then ({mainModule}) ->
          {highlightSelected} = mainModule

    waitsForPromise ->
      activationPromise

  describe "when the view is loaded", ->
    it "attaches the view", ->
      expect(atom.workspaceView.find('.highlight-selected')).toExist()

  describe "when a whole word is selected", ->
    beforeEach ->
      range = new Range(new Point(8, 2), new Point(8, 8))
      editor.setSelectedBufferRange(range)

    it "adds the decoration to all words", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(4)

  describe "when hide highlight on selected word is enabled", ->
    beforeEach ->
      atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true)
      range = new Range(new Point(8, 2), new Point(8, 8))
      editor.setSelectedBufferRange(range)

    it "adds the decoration to all words", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(3)

  describe "leading whitespace doesn't get used", ->
    beforeEach ->
      range = new Range(new Point(8, 0), new Point(8, 8))
      editor.setSelectedBufferRange(range)

    it "doesn't add regions", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(0)

  describe "will highlight non whole words", ->
    beforeEach ->
      range = new Range(new Point(10, 13), new Point(10, 17))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(3)

  describe "will not highlight non whole words", ->
    beforeEach ->
      atom.config.set('highlight-selected.onlyHighlightWholeWords', true)
      range = new Range(new Point(10, 13), new Point(10, 17))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(2)

  describe "will not highlight words in different case", ->
    beforeEach ->
      range = new Range(new Point(4, 0), new Point(4, 6))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(2)

  describe "will highlight words in different case", ->
    beforeEach ->
      atom.config.set('highlight-selected.ignoreCase', true)
      range = new Range(new Point(4, 0), new Point(4, 6))
      editor.setSelectedBufferRange(range)

    it "does add regions", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(5)

    describe "adds background to selected", ->
      beforeEach ->
        atom.config.set('highlight-selected.highlightBackground', true)
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it "adds the background to all highlights", ->
        expect(editorView.find('.highlight-selected.background .region'))
          .toHaveLength(4)

    describe "adds light theme to selected", ->
      beforeEach ->
        atom.config.set('highlight-selected.lightTheme', true)
        range = new Range(new Point(8, 2), new Point(8, 8))
        editor.setSelectedBufferRange(range)

      it "adds the background to all highlights", ->
        expect(editorView.find('.highlight-selected.light-theme .region'))
          .toHaveLength(4)
