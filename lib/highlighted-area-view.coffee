{Range, CompositeDisposable, Emitter, MarkerLayer} = require 'atom'
StatusBarView = require './status-bar-view'
escapeRegExp = require './escape-reg-exp'

module.exports =
class HighlightedAreaView

  constructor: ->
    @emitter = new Emitter
    @editorToMarkerLayerMap = {}
    @markerLayers = []
    @resultCount = 0

    @editorSubscriptions = new CompositeDisposable()
    @editorSubscriptions.add(atom.workspace.observeTextEditors((editor) =>
      @setupMarkerLayers(editor)
      @setScrollMarkerView(editor)
    ))

    @editorSubscriptions.add(atom.workspace.onWillDestroyPaneItem((item) =>
      return unless item.item.constructor.name == 'TextEditor'
      editor = item.item
      @removeMarkers(editor.id)
      delete @editorToMarkerLayerMap[editor.id]
      @destroyScrollMarkers(editor)
    ))

    @enable()
    @listenForTimeoutChange()
    @activeItemSubscription = atom.workspace.onDidChangeActivePaneItem =>
      @debouncedHandleSelection()
      @subscribeToActiveTextEditor()
    @subscribeToActiveTextEditor()
    @listenForStatusBarChange()

    @enableScrollViewObserveSubscription =
      atom.config.observe 'highlight-selected.showResultsOnScrollBar', (enabled) =>
        if enabled
          @ensureScrollViewInstalled()
          atom.workspace.getTextEditors().forEach(@setScrollMarkerView)
        else
          atom.workspace.getTextEditors().forEach(@destroyScrollMarkers)

  destroy: =>
    clearTimeout(@handleSelectionTimeout)
    @activeItemSubscription.dispose()
    @selectionSubscription?.dispose()
    @enableScrollViewObserveSubscription?.dispose()
    @editorSubscriptions?.dispose()
    @statusBarView?.removeElement()
    @statusBarTile?.destroy()
    @statusBarTile = null

  onDidAddMarker: (callback) =>
    Grim = require 'grim'
    Grim.deprecate("Please do not use. This method will be removed.")
    @emitter.on 'did-add-marker', callback

  onDidAddSelectedMarker: (callback) =>
    Grim = require 'grim'
    Grim.deprecate("Please do not use. This method will be removed.")
    @emitter.on 'did-add-selected-marker', callback

  onDidAddMarkerForEditor: (callback) =>
    @emitter.on 'did-add-marker-for-editor', callback

  onDidAddSelectedMarkerForEditor: (callback) =>
    @emitter.on 'did-add-selected-marker-for-editor', callback

  onDidRemoveAllMarkers: (callback) =>
    @emitter.on 'did-remove-marker-layer', callback

  disable: =>
    @disabled = true
    @removeAllMarkers()

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
    editor = @getActiveEditor()
    return unless editor

    @removeAllMarkers()

    return if @disabled
    return if editor.getLastSelection().isEmpty()

    @selections = editor.getSelections()
    lastSelection = editor.getLastSelection()
    text = lastSelection.getText()

    return if text.length < atom.config.get('highlight-selected.minimumLength')
    return if text.includes('\n')
    regex = new RegExp("^\\s+$")
    return if regex.test(text)

    regexFlags = 'g'
    if atom.config.get('highlight-selected.ignoreCase')
      regexFlags = 'gi'

    regexSearch = escapeRegExp(text)

    if atom.config.get('highlight-selected.onlyHighlightWholeWords')
      return unless @isWordSelected(lastSelection)
      selectionStart = lastSelection.getBufferRange().start
      nonWordCharacters = @getNonWordCharacters(editor, selectionStart)
      allowedCharactersToSelect = atom.config.get('highlight-selected.allowedCharactersToSelect')
      nonWordCharactersToStrip = nonWordCharacters.replace(
        new RegExp("[#{allowedCharactersToSelect}]", 'g'), '')
      regexForWholeWord = new RegExp("[ \\t#{escapeRegExp(nonWordCharactersToStrip)}]", regexFlags)
      return if regexForWholeWord.test(text)
      regexSearch =
        "(?:[ \\t#{escapeRegExp(nonWordCharacters)}]|^)(" +
        regexSearch +
        ")(?:[ \\t#{escapeRegExp(nonWordCharacters)}]|$)"

    @resultCount = 0
    if atom.config.get('highlight-selected.highlightInPanes')
      originalEditor = editor
      @getActiveEditors().forEach (editor) =>
        @highlightSelectionInEditor(editor, regexSearch, regexFlags, originalEditor)
    else
      @highlightSelectionInEditor(editor, regexSearch, regexFlags)

    @statusBarElement?.updateCount(@resultCount)

  highlightSelectionInEditor: (editor, regexSearch, regexFlags, originalEditor) ->
    return unless editor?
    maximumHighlights = atom.config.get('highlight-selected.maximumHighlights')
    return unless this.resultCount < maximumHighlights

    markerLayers =  @editorToMarkerLayerMap[editor.id]
    return unless markerLayers?
    markerLayer = markerLayers['visibleMarkerLayer']
    markerLayerForHiddenMarkers = markerLayers['selectedMarkerLayer']

    # HACK: `editor.scan` is a synchronous process which iterates the entire buffer,
    # executing a regex against every line and yielding each match. This can be
    # costly for very large files with many matches.
    #
    # While we can and do limit the maximum number of highlight markers,
    # `editor.scan` cannot be terminated early, meaning that we are forced to
    # pay the cost of iterating every line in the file, running the regex, and
    # returning matches, even if we shouldn't be creating any more markers.
    #
    # Instead, throw an exception. This isn't pretty, but it prevents the
    # scan from running to completion unnecessarily.
    try
      editor.scan new RegExp(regexSearch, regexFlags),
        (result) =>
          if (this.resultCount >= maximumHighlights)
            throw new EarlyTerminationSignal

          newResult = result
          if atom.config.get('highlight-selected.onlyHighlightWholeWords')
            editor.scanInBufferRange(
              new RegExp(escapeRegExp(result.match[1])),
              result.range,
              (e) -> newResult = e
            )

          return unless newResult?
          @resultCount += 1

          if @showHighlightOnSelectedWord(newResult.range, @selections) &&
             originalEditor?.id == editor.id
            marker = markerLayerForHiddenMarkers.markBufferRange(newResult.range)
            @emitter.emit 'did-add-selected-marker', marker
            @emitter.emit 'did-add-selected-marker-for-editor',
              marker: marker
              editor: editor
          else
            marker = markerLayer.markBufferRange(newResult.range)
            @emitter.emit 'did-add-marker', marker
            @emitter.emit 'did-add-marker-for-editor',
              marker: marker
              editor: editor
    catch error
      if error not instanceof EarlyTerminationSignal
        # If this is an early termination, just continue on.
        throw error

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

  removeAllMarkers: =>
    Object.keys(@editorToMarkerLayerMap).forEach(@removeMarkers)

  removeMarkers: (editorId) =>
    return unless @editorToMarkerLayerMap[editorId]?

    markerLayer = @editorToMarkerLayerMap[editorId]['visibleMarkerLayer']
    selectedMarkerLayer = @editorToMarkerLayerMap[editorId]['selectedMarkerLayer']

    markerLayer.clear()
    selectedMarkerLayer.clear()

    @statusBarElement?.updateCount(0)
    @emitter.emit 'did-remove-marker-layer'

  isWordSelected: (selection) ->
    if selection.getBufferRange().isSingleLine()
      selectionRange = selection.getBufferRange()
      lineRange = @getActiveEditor().bufferRangeForBufferRow(
        selectionRange.start.row)
      nonWordCharacterToTheLeft =
        selectionRange.start.isEqual(lineRange.start) or
        @isNonWordCharacterToTheLeft(selection)
      nonWordCharacterToTheRight =
        selectionRange.end.isEqual(lineRange.end) or
        @isNonWordCharacterToTheRight(selection)

      nonWordCharacterToTheLeft and nonWordCharacterToTheRight
    else
      false

  getNonWordCharacters: (editor, point) ->
    scopeDescriptor = editor.scopeDescriptorForBufferPosition(point)
    nonWordCharacters = atom.config.get('editor.nonWordCharacters', scope: scopeDescriptor)

  isNonWord: (editor, range) ->
    nonWordCharacters = @getNonWordCharacters(editor, range.start)
    text = editor.getTextInBufferRange(range)
    new RegExp("[ \t#{escapeRegExp(nonWordCharacters)}]").test(text)

  isNonWordCharacterToTheLeft: (selection) ->
    selectionStart = selection.getBufferRange().start
    range = Range.fromPointWithDelta(selectionStart, 0, -1)
    @isNonWord(@getActiveEditor(), range)

  isNonWordCharacterToTheRight: (selection) ->
    selectionEnd = selection.getBufferRange().end
    range = Range.fromPointWithDelta(selectionEnd, 0, 1)
    @isNonWord(@getActiveEditor(), range)

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

  selectAll: =>
    editor = @getActiveEditor()
    markerLayers = @editorToMarkerLayerMap[editor.id]
    return unless markerLayers?
    ranges = []
    for markerLayer in [markerLayers['visibleMarkerLayer'], markerLayers['selectedMarkerLayer']]
      for marker in markerLayer.getMarkers()
        ranges.push marker.getBufferRange()

    if ranges.length > 0
      editor.setSelectedBufferRanges(ranges, flash: true)

  setScrollMarker: (scrollMarkerAPI) =>
    @scrollMarker = scrollMarkerAPI
    if atom.config.get('highlight-selected.showResultsOnScrollBar')
      @ensureScrollViewInstalled()
      atom.workspace.getTextEditors().forEach(@setScrollMarkerView)

  ensureScrollViewInstalled: ->
    unless atom.inSpecMode()
      require('atom-package-deps').install 'highlight-selected', true

  setupMarkerLayers: (editor) =>
    if @editorToMarkerLayerMap[editor.id]?
      markerLayer = @editorToMarkerLayerMap[editor.id]['visibleMarkerLayer']
      markerLayerForHiddenMarkers  = @editorToMarkerLayerMap[editor.id]['selectedMarkerLayer']
    else
      markerLayer = editor.addMarkerLayer()
      markerLayerForHiddenMarkers = editor.addMarkerLayer()
      @editorToMarkerLayerMap[editor.id] =
        visibleMarkerLayer: markerLayer
        selectedMarkerLayer: markerLayerForHiddenMarkers

  setScrollMarkerView: (editor) =>
    return unless atom.config.get('highlight-selected.showResultsOnScrollBar')
    return unless @scrollMarker?

    scrollMarkerView = @scrollMarker.scrollMarkerViewForEditor(editor)

    markerLayer = @editorToMarkerLayerMap[editor.id]['visibleMarkerLayer']
    selectedMarkerLayer = @editorToMarkerLayerMap[editor.id]['selectedMarkerLayer']

    scrollMarkerView.getLayer("highlight-selected-marker-layer")
                    .syncToMarkerLayer(markerLayer)
    scrollMarkerView.getLayer("highlight-selected-selected-marker-layer")
                    .syncToMarkerLayer(selectedMarkerLayer)

  destroyScrollMarkers: (editor) =>
    return unless @scrollMarker?

    scrollMarkerView = @scrollMarker.scrollMarkerViewForEditor(editor)
    scrollMarkerView.destroy()

class EarlyTerminationSignal extends Error
