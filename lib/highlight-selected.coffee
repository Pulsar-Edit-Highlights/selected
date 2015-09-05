{CompositeDisposable} = require "atom"
HighlightedAreaView = require './highlighted-area-view'

module.exports =
  config:
    onlyHighlightWholeWords:
      type: 'boolean'
      default: true
    hideHighlightOnSelectedWord:
      type: 'boolean'
      default: false
    ignoreCase:
      type: 'boolean'
      default: false
    lightTheme:
      type: 'boolean'
      default: false
    highlightBackground:
      type: 'boolean'
      default: false
    minimumLength:
      type: 'integer'
      default: 0
    timeout:
      type: 'integer'
      default: 20
      description: 'Defers searching for matching strings for X ms'

  areaView: null

  activate: (state) ->
    @areaView = new HighlightedAreaView()
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.commands.add "atom-workspace",
        'highlight-selected:toggle': => @toggle()

  deactivate: ->
    @areaView?.destroy()
    @areaView = null
    @subscriptions?.dispose()
    @subscriptions = null

  provideHighlightSelectedV1: -> @areaView

  toggle: ->
    if @areaView.disabled
      @areaView.enable()
    else
      @areaView.disable()
