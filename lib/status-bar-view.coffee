module.exports =
class StatusBarView
  constructor: ->
    @element = document.createElement 'div'
    @element.classList.add("highlight-selected-status","inline-block")

  updateCount: (count) ->
    @element.textContent = "Highlighted: " + count
    if count == 0
      @element.classList.add("highlight-selected-hidden")
    else
      @element.classList.remove("highlight-selected-hidden")

  getElement: =>
    @element

  removeElement: =>
    @element.parentNode.removeChild(@element)
    @element = null
