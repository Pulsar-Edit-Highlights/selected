# Highlight Selected

[![Build Status](https://travis-ci.org/richrace/highlight-selected.svg?branch=master)](https://travis-ci.org/richrace/highlight-selected)

Double click on a word to highlight it throughout the open file.

This is something hacky I've put together as I missed the functionality that
Sublime gave.

Some code and has been taken from Atom's
  [find and replace](https://github.com/atom/find-and-replace) package

Please log any issues and pull requests are more than welcome!

![Gif in action](http://i.imgur.com/C5FnzzQ.gif)

Change the following CSS in your StyleSheet to change the colours to suit your
theme. Either set the light theme check box in settings to be able to toggle
between styles or just overwrite the default box/background.

```scss
.editor {
  // Box
  .highlight-selected .region {
    border-color: #ddd;
  }
  // Background
  .highlight-selected.background .region {
    background-color: rgba(155, 149, 0, 0.6);
  }
  // Light theme box (set in settings)
  .highlight-selected.light-theme .region {
    border-color: rgba(255,0,0, 0.8);
  }
  // Light theme background (set in settings)
  .highlight-selected.light-theme.background .region {
    background-color: rgba(252,0,0, 0.3);
  }
}
```


# Issues and Todo

- Add specs to test it
- Should we highlight symbols?
- Merge this feature in the
[find-and-replace](https://github.com/atom/find-and-replace) package
