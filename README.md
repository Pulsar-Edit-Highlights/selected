# Highlight Selected

Double click on a word to highlight it throughout the open file.

This is something hacky I've put together as I missed the functionality that Sublime gave. As such, it's doesn't work 100% but is good enough to start!

Some code and has been take from Atom's find and replace package ([link](https://github.com/atom/find-and-replace))

Please log any issues and pull requests are more than welcome!

![Gif in action](http://i.imgur.com/C5FnzzQ.gif)

# Issues and Todo

- Some double click events are not triggered
- Refactor and tidy up the code
- Add specs to test it
- When "show hidden characters" is enabled, clicking on them highlights them all. Should it do this?
- Add better support for non-words (e.g. symbols)
