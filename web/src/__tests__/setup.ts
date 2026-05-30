import '@testing-library/jest-dom/vitest';

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: { width: 800, height: 600, x: 0, y: 0, top: 0, right: 800, bottom: 600, left: 0 } }] as ResizeObserverEntry[],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;
