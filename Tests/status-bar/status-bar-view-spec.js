const StatusBarView = require('../../Source/status-bar/status-bar-view');

describe('StatusBarView', () => {
  let statusBarView;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('highlight-selected'));
    statusBarView = new StatusBarView();
  });

  it('creates a div element', () => {
    expect(statusBarView.element.tagName).toBe('DIV');
  });

  it('div contains correct classes', () => {
    expect(statusBarView.element).toHaveClass('highlight-selected-status');
    expect(statusBarView.element).toHaveClass('inline-block');
  });

  it('returns element', () => {
    expect(statusBarView.element).toBe(statusBarView.element);
  });

  describe('updateCount', () => {
    it('updates with 0', () => {
      const expectedText = 'Highlighted: 0';
      statusBarView.updateCount(0);
      expect(statusBarView.element).toHaveClass('highlight-selected-hidden');
      expect(statusBarView.element).toHaveText(expectedText);
    });

    it('updates with 1', () => {
      const expectedText = 'Highlighted: 1';
      statusBarView.updateCount(1);
      expect(statusBarView.element).not.toHaveClass('highlight-selected-hidden');
      expect(statusBarView.element).toHaveText(expectedText);
    });

    it('updates with 55', () => {
      const expectedText = 'Highlighted: 55';
      statusBarView.updateCount(55);
      expect(statusBarView.element).not.toHaveClass('highlight-selected-hidden');
      expect(statusBarView.element).toHaveText(expectedText);
    });
  });

  it('removes the element from the parent', () => {
    const parentNode = { removeChild: () => {} };
    const element = { parentNode };

    spyOn(parentNode, 'removeChild');

    statusBarView.element = element;
    statusBarView.removeElement();

    expect(parentNode.removeChild).toHaveBeenCalledWith(element);
    expect(statusBarView.element).toBeNull();
  });
});
