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
      range = new Range(new Point(7, 2), new Point(7, 8))
      editor.setSelectedBufferRange(range)

    it "adds the decoration to all words", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(4)

  describe "when hide highlight on selected word is enabled", ->
    beforeEach ->
      atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true)
      range = new Range(new Point(7, 2), new Point(7, 8))
      editor.setSelectedBufferRange(range)

    it "adds the decoration to all words", ->
      expect(editorView.find('.highlight-selected .region')).toHaveLength(3)
