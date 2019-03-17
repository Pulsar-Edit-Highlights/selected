module.exports = class StatusBarView {
  constructor() {
    this.getElement = this.getElement.bind(this);
    this.removeElement = this.removeElement.bind(this);
    this.element = document.createElement('div');
    this.element.classList.add('highlight-selected-status', 'inline-block');
  }

  updateCount(count) {
    const statusBarString = atom.config.get('highlight-selected.statusBarString');
    this.element.textContent = statusBarString.replace('%c', count);
    if (count === 0) {
      this.element.classList.add('highlight-selected-hidden');
    } else {
      this.element.classList.remove('highlight-selected-hidden');
    }
  }

  getElement() {
    return this.element;
  }

  removeElement() {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  }
};
