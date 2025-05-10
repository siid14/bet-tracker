import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LazyImage from "../../components/LazyImage";

// Mock the ImageCompression utility
jest.mock("../../utils/ImageCompression", () => ({
  compressImage: (src, options) => {
    // Set a timeout to simulate async compression
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!src) {
          reject(new Error("No image source provided"));
          return;
        }
        // Simulate successful compression for most images
        if (src.includes("error")) {
          reject(new Error("Mock compression error"));
          return;
        }
        resolve("data:image/jpeg;base64,mockCompressedImage");
      }, 50);
    });
  },
}));

describe("LazyImage Component", () => {
  // Create a mock IntersectionObserver before each test
  let mockIntersectionObserver;

  beforeEach(() => {
    // Suppress console errors
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock IntersectionObserver
    mockIntersectionObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    };

    window.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      mockIntersectionObserver.callback = callback;
      return mockIntersectionObserver;
    });
  });

  afterEach(() => {
    console.error.mockRestore();
    jest.restoreAllMocks();
  });

  it("should initially show a loading placeholder", () => {
    render(<LazyImage src="test.jpg" alt="Test" />);

    const imgElement = screen.getByTestId("lazy-image");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveClass("loading");
  });

  it("should load and display the image when in viewport", async () => {
    const mockOnLoad = jest.fn();

    // Render the component
    render(<LazyImage src="test.jpg" alt="Test" onLoad={mockOnLoad} />);

    // Get the image element
    const imgElement = screen.getByTestId("lazy-image");

    // Simulate the image coming into view by manually calling the callback
    mockIntersectionObserver.callback([
      { isIntersecting: true, target: imgElement },
    ]);

    // The image should eventually show as loaded
    await waitFor(
      () => {
        expect(imgElement).toHaveClass("loaded");
      },
      { timeout: 200 }
    );

    // The onLoad callback should have been called
    expect(mockOnLoad).toHaveBeenCalled();

    // The src should now be the compressed version
    expect(imgElement.src).toBe("data:image/jpeg;base64,mockCompressedImage");
  });

  it("should handle errors when image fails to load", async () => {
    const mockOnError = jest.fn();

    // Render with an image that will fail to load
    render(
      <LazyImage src="error-image.jpg" alt="Error Test" onError={mockOnError} />
    );

    // Get the image element
    const imgElement = screen.getByTestId("lazy-image");

    // Simulate the image coming into view
    mockIntersectionObserver.callback([
      { isIntersecting: true, target: imgElement },
    ]);

    // The image should eventually show as error
    await waitFor(
      () => {
        expect(imgElement).toHaveClass("error");
      },
      { timeout: 200 }
    );

    // The onError callback should have been called
    expect(mockOnError).toHaveBeenCalled();
  });

  it("should handle missing image source", () => {
    const mockOnError = jest.fn();

    // Render with no source
    render(<LazyImage src={null} alt="Missing Source" onError={mockOnError} />);

    // Get the image element
    const imgElement = screen.getByTestId("lazy-image");

    // The image should immediately show as error
    expect(imgElement).toHaveClass("error");

    // The onError callback should have been called
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should apply custom class names", () => {
    render(<LazyImage src="test.jpg" alt="Test" className="custom-class" />);

    const imgElement = screen.getByTestId("lazy-image");
    expect(imgElement).toHaveClass("custom-class");
  });

  it("should pass additional props to the image element", () => {
    render(
      <LazyImage src="test.jpg" alt="Test" data-custom="value" loading="lazy" />
    );

    const imgElement = screen.getByTestId("lazy-image");
    expect(imgElement).toHaveAttribute("data-custom", "value");
    expect(imgElement).toHaveAttribute("loading", "lazy");
  });
});
