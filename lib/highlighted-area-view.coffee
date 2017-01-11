{Range, CompositeDisposable, Emitter, MarkerLayer} = require 'atom'
_ = require 'underscore-plus'
StatusBarView = require './status-bar-view'

module.exports =
class HighlightedAreaView

  constructor: ->
    @emitter = new Emitter
    @markerLayers = []
    @resultCount = 0
    @enable()
    @listenForTimeoutChange()
    @activeItemSubscription = atom.workspace.onDidChangeActivePaneItem =>
      @debouncedHandleSelection()
      @subscribeToActiveTextEditor()
    @subscribeToActiveTextEditor()
    @listenForStatusBarChange()

  destroy: =>
    clearTimeout(@handleSelectionTimeout)
    @activeItemSubscription.dispose()
    @selectionSubscription?.dispose()
    @statusBarView?.removeElement()
    @statusBarTile?.destroy()
    @statusBarTile = null

  onDidAddMarker: (callback) =>
    @emitter.on 'did-add-marker', callback

  onDidAddSelectedMarker: (callback) =>
    @emitter.on 'did-add-selected-marker', callback

  onDidRemoveAllMarkers: (callback) =>
    @emitter.on 'did-remove-marker-layer', callback

  disable: =>
    @disabled = true
    @removeMarkers()

  enable: =>
    @disabled = false
    @debouncedHandleSelection()

  setStatusBar: (statusBar) =>
    @statusBar = statusBar
    @setupStatusBar()

  debouncedHandleSelection: =>
    clearTimeout(@handleSelectionTimeout)
    @handleSelectionTimeout = setTimeout =>
      @handleSelection()
    , atom.config.get('highlight-selected.timeout')

  listenForTimeoutChange: ->
    atom.config.onDidChange 'highlight-selected.timeout', =>
      @debouncedHandleSelection()

  subscribeToActiveTextEditor: ->
    @selectionSubscription?.dispose()

    editor = @getActiveEditor()
    return unless editor

    @selectionSubscription = new CompositeDisposable

    @selectionSubscription.add(
      editor.onDidAddSelection @debouncedHandleSelection
    )
    @selectionSubscription.add(
      editor.onDidChangeSelectionRange @debouncedHandleSelection
    )
    @handleSelection()

  getActiveEditor: ->
    atom.workspace.getActiveTextEditor()

  getActiveEditors: ->
    atom.workspace.getPanes().map (pane) ->
      activeItem = pane.activeItem
      activeItem if activeItem and activeItem.constructor.name == 'TextEditor'

  handleSelection: =>
    @removeMarkers()

    return if @disabled

    editor = @getActiveEditor()

    return unless editor
    return if editor.getLastSelection().isEmpty()
    return unless @isWordSelected(editor.getLastSelection())

    @selections = editor.getSelections()

    text = _.escapeRegExp(@selections[0].getText())
    regex = new RegExp("\\S*\\w*\\b", 'gi')
    result = regex.exec(text)

    return unless result?
    return if result[0].length < atom.config.get(
      'highlight-selected.minimumLength') or
              result.index isnt 0 or
              result[0] isnt result.input

    regexFlags = 'g'
    if atom.config.get('highlight-selected.ignoreCase')
      regexFlags = 'gi'

    range =  [[0, 0], editor.getEofBufferPosition()]

    @ranges = []
    regexSearch = result[0]

    if atom.config.get('highlight-selected.onlyHighlightWholeWords')
      if regexSearch.indexOf("\$") isnt -1 \
      and editor.getGrammar()?.name is 'PHP'
        regexSearch = regexSearch.replace("\$", "\$\\b")
      else
        regexSearch =  "\\b" + regexSearch
      regexSearch = regexSearch + "\\b"

    @resultCount = 0
    if atom.config.get('highlight-selected.highlightInPanes')
      @getActiveEditors().forEach (editor) =>
        @highlightSelectionInEditor(editor, regexSearch, regexFlags, range)
    else
      @highlightSelectionInEditor(editor, regexSearch, regexFlags, range)

    @statusBarElement?.updateCount(@resultCount)

  highlightSelectionInEditor: (editor, regexSearch, regexFlags, range) ->
    markerLayer = editor?.addMarkerLayer()
    return unless markerLayer?
    markerLayerForHiddenMarkers = editor.addMarkerLayer()
    @markerLayers.push(markerLayer)
    @markerLayers.push(markerLayerForHiddenMarkers)
    editor.scanInBufferRange new RegExp(regexSearch, regexFlags), range,
      (result) =>
        @resultCount += 1
        if @showHighlightOnSelectedWord(result.range, @selections)
          marker = markerLayerForHiddenMarkers.markBufferRange(result.range)
          @emitter.emit 'did-add-selected-marker', marker
        else
          marker = markerLayer.markBufferRange(result.range)
          @emitter.emit 'did-add-marker', marker
    editor.decorateMarkerLayer(markerLayer, {
      type: 'highlight',
      class: @makeClasses()
    })

  makeClasses: ->
    className = 'highlight-selected'
    if atom.config.get('highlight-selected.lightTheme')
      className += ' light-theme'

    if atom.config.get('highlight-selected.highlightBackground')
      className += ' background'
    className

  showHighlightOnSelectedWord: (range, selections) ->
    return false unless atom.config.get(
      'highlight-selected.hideHighlightOnSelectedWord')
    outcome = false
    for selection in selections
      selectionRange = selection.getBufferRange()
      outcome = (range.start.column is selectionRange.start.column) and
                (range.start.row is selectionRange.start.row) and
                (range.end.column is selectionRange.end.column) and
                (range.end.row is selectionRange.end.row)
      break if outcome
    outcome

  removeMarkers: =>
    @markerLayers.forEach (markerLayer) ->
      markerLayer.destroy()
    @markerLayers = []
    @statusBarElement?.updateCount(0)
    @emitter.emit 'did-remove-marker-layer'

  isWordSelected: (selection) ->
    if selection.getBufferRange().isSingleLine()
      selectionRange = selection.getBufferRange()
      lineRange = @getActiveEditor().bufferRangeForBufferRow(
        selectionRange.start.row)
      nonWordCharacterToTheLeft =
        _.isEqual(selectionRange.start, lineRange.start) or
        @isNonWordCharacterToTheLeft(selection)
      nonWordCharacterToTheRight =
        _.isEqual(selectionRange.end, lineRange.end) or
        @isNonWordCharacterToTheRight(selection)

      nonWordCharacterToTheLeft and nonWordCharacterToTheRight
    else
      false

  isNonWordCharacter: (character) ->
    nonWordCharacters = atom.config.get('editor.nonWordCharacters')
    new RegExp("[ \t#{_.escapeRegExp(nonWordCharacters)}]").test(character)

  isNonWordCharacterToTheLeft: (selection) ->
    selectionStart = selection.getBufferRange().start
    range = Range.fromPointWithDelta(selectionStart, 0, -1)
    @isNonWordCharacter(@getActiveEditor().getTextInBufferRange(range))

  isNonWordCharacterToTheRight: (selection) ->
    selectionEnd = selection.getBufferRange().end
    range = Range.fromPointWithDelta(selectionEnd, 0, 1)
    @isNonWordCharacter(@getActiveEditor().getTextInBufferRange(range))

  setupStatusBar: =>
    return if @statusBarElement?
    return unless atom.config.get('highlight-selected.showInStatusBar')
    @statusBarElement = new StatusBarView()
    @statusBarTile = @statusBar.addLeftTile(
      item: @statusBarElement.getElement(), priority: 100)

  removeStatusBar: =>
    return unless @statusBarElement?
    @statusBarTile?.destroy()
    @statusBarTile = null
    @statusBarElement = null

  listenForStatusBarChange: =>
    atom.config.onDidChange 'highlight-selected.showInStatusBar', (changed) =>
      if changed.newValue
        @setupStatusBar()
      else
        @removeStatusBar()
