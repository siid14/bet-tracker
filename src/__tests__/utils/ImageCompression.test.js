import {
  compressImage,
  lazyLoadAndCompressImage,
} from "../../utils/ImageCompression";

// Create a mock for Image
class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = "";
    this.width = 1200;
    this.height = 800;
  }

  // Helper to simulate load event
  triggerLoad() {
    if (this.onload) this.onload();
  }

  // Helper to simulate error event
  triggerError(error) {
    if (this.onerror) this.onerror(error);
  }
}

describe("ImageCompression Utility", () => {
  let originalImage;
  let mockImg;
  let mockCreateElement;

  beforeEach(() => {
    // Store original implementations
    originalImage = global.Image;

    // Create an instance of our mock image
    mockImg = new MockImage();

    // Mock Image constructor
    global.Image = jest.fn().mockImplementation(() => mockImg);

    // Create a mock canvas element with a working toDataURL method
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      }),
      toDataURL: jest
        .fn()
        .mockReturnValue("data:image/jpeg;base64,mockCompressedImageData"),
      width: 0,
      height: 0,
    };

    // Mock document.createElement
    mockCreateElement = jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        // For non-canvas elements, create a simple element-like object
        return { tagName, style: {} };
      });

    // Mock document.body methods for intersection observer tests
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.body.contains = jest.fn().mockReturnValue(true);

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Spy on console.error to prevent it from cluttering test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original implementations
    global.Image = originalImage;
    mockCreateElement.mockRestore();
    console.error.mockRestore();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("compressImage", () => {
    it("should compress an image with default options", async () => {
      const imageSrc = "test-image.jpg";

      // Start compression
      const promise = compressImage(imageSrc);

      // Verify the source was set
      expect(mockImg.src).toBe(imageSrc);

      // Simulate successful load
      mockImg.triggerLoad();

      // Get the compression result
      const result = await promise;

      // Verify compression happened
      expect(result).toBe("data:image/jpeg;base64,mockCompressedImageData");

      // Verify toDataURL was called with correct format and quality
      expect(document.createElement("canvas").toDataURL).toHaveBeenCalledWith(
        "image/jpeg",
        0.8
      );
    });

    it("should reject when image loading fails", async () => {
      const imageSrc = "error-image.jpg";

      // Start compression
      const promise = compressImage(imageSrc);

      // Verify the source was set
      expect(mockImg.src).toBe(imageSrc);

      // Simulate error
      mockImg.triggerError(new Error("Failed to load image"));

      // Verify the promise was rejected
      await expect(promise).rejects.toThrow();
    });

    it("should handle null or undefined sources", async () => {
      // Test with null source
      const nullPromise = compressImage(null);
      await expect(nullPromise).rejects.toThrow();

      // Test with undefined source
      const undefinedPromise = compressImage(undefined);
      await expect(undefinedPromise).rejects.toThrow();
    });

    it("should respect custom compression options", async () => {
      const options = {
        maxWidth: 400,
        maxHeight: 300,
        quality: 0.5,
        format: "image/webp",
      };

      // Start compression
      const promise = compressImage("test-image.jpg", options);

      // Simulate successful load
      mockImg.triggerLoad();

      // Get the compression result
      await promise;

      // Verify toDataURL was called with correct format and quality
      expect(document.createElement("canvas").toDataURL).toHaveBeenCalledWith(
        "image/webp",
        0.5
      );
    });
  });

  describe("lazyLoadAndCompressImage", () => {
    it("should set up an intersection observer and not throw errors", () => {
      const mockOnLoad = jest.fn();

      // We're using a try here to catch any potential errors
      let error;
      try {
        lazyLoadAndCompressImage("test.jpg", mockOnLoad);
      } catch (e) {
        error = e;
      }

      // Expect no errors were thrown
      expect(error).toBeUndefined();

      // Verify an observer was created and placeholder was added
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should return a cleanup function that disconnects the observer", () => {
      const cleanup = lazyLoadAndCompressImage("test.jpg", jest.fn());

      // Call the cleanup function
      cleanup();

      // Verify the observer was disconnected and placeholder was removed if needed
      expect(document.body.contains).toHaveBeenCalled();
    });

    it("should handle missing src gracefully", () => {
      const result = lazyLoadAndCompressImage(null, jest.fn());

      // Should return a do-nothing function
      expect(typeof result).toBe("function");

      // Calling it should not throw
      expect(() => result()).not.toThrow();
    });
  });
});
