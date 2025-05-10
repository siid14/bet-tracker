// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock IntersectionObserver for tests
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper method for tests
  triggerIntersection(isIntersecting) {
    const entries = Array.from(this.elements).map((element) => ({
      isIntersecting,
      target: element,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: isIntersecting ? element.getBoundingClientRect() : null,
      rootBounds: null,
      time: Date.now(),
    }));

    this.callback(entries);
  }
}

// Mock canvas functions for image compression tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  // Mock HTMLCanvasElement.prototype.getContext
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = function () {
      return {
        drawImage: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
      };
    };
  }

  // Mock HTMLCanvasElement.prototype.toDataURL
  if (!HTMLCanvasElement.prototype.toDataURL) {
    HTMLCanvasElement.prototype.toDataURL = function () {
      return "data:image/png;base64,mockImageData";
    };
  }
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
