module.exports = {
  getActiveEditor() {
    return atom.workspace.getActiveTextEditor();
  },

  getActiveEditors() {
    return atom.workspace.getPanes().map(pane => {
      const { activeItem } = pane;
      if (activeItem && activeItem.constructor.name === 'TextEditor') {
        return activeItem;
      }
      return null;
    });
  }
};
