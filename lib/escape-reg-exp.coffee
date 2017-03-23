# https://github.com/atom/underscore-plus/blob/4a022cf72/src/underscore-plus.coffee#L136-L140

module.exports = (string) ->
  if string
    string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  else
    ''
