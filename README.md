# Highlight Selected

[![Join the chat at https://gitter.im/richrace/highlight-selected](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/richrace/highlight-selected?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
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
atom-text-editor, atom-text-editor::shadow {
  // Box
  .highlights .highlight-selected .region {
    border-color: #ddd;
  }
  // Background
  .highlights .highlight-selected.background .region {
    background-color: rgba(155, 149, 0, 0.6);
  }
  // Light theme box (set in settings)
  .highlights .highlight-selected.light-theme .region {
    border-color: rgba(255, 128, 64, 0.4);
  }
  // Light theme background (set in settings)
  .highlights .highlight-selected.light-theme.background .region {
    background-color: rgba(255, 128, 64, 0.2);
  }
}
```


# Issues and Todo

- Should we highlight symbols?
- Merge this feature in the
[find-and-replace](https://github.com/atom/find-and-replace) package
