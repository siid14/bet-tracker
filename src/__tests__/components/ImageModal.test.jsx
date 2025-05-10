import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageModal from "../../components/ImageModal";

// Mock the SafeLoader utility
jest.mock("../../utils/SafeLoader", () => ({
  safeLoadImage: (src, onLoad, onError) => {
    // Set a timeout to simulate async loading
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful load by default
        if (src && !src.includes("error")) {
          if (onLoad) onLoad();
          resolve();
        } else {
          // Create a simple object instead of an error instance
          const errorObj = { message: "Mock image load error" };
          if (onError) onError(errorObj);
          // Resolve the promise instead of rejecting to avoid test failures
          resolve(errorObj);
        }
      }, 50);
    });
  },
}));

describe("ImageModal Component", () => {
  const mockTranslations = {
    closeImage: "Close Image",
    loadingImage: "Loading image...",
    imageError: "Unable to load image",
  };

  beforeEach(() => {
    // Suppress console errors
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should not render when isOpen is false", () => {
    render(
      <ImageModal
        isOpen={false}
        imageUrl="test.jpg"
        onClose={jest.fn()}
        translations={mockTranslations}
      />
    );

    // Modal should not be visible
    expect(screen.queryByTestId("image-modal")).not.toBeInTheDocument();
  });

  it("should render modal with loading state initially", async () => {
    render(
      <ImageModal
        isOpen={true}
        imageUrl="test.jpg"
        onClose={jest.fn()}
        translations={mockTranslations}
      />
    );

    // Modal should be visible
    expect(screen.getByTestId("image-modal")).toBeInTheDocument();

    // Should show loading state initially
    expect(screen.getByTestId("image-loading")).toBeInTheDocument();

    // Wait for image to "load"
    await waitFor(
      () => {
        expect(screen.queryByTestId("image-loading")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );

    // After loading, image should be visible
    expect(screen.getByTestId("modal-image")).toBeInTheDocument();
  });

  it("should handle image loading errors", async () => {
    render(
      <ImageModal
        isOpen={true}
        imageUrl="error-image.jpg"
        onClose={jest.fn()}
        translations={mockTranslations}
      />
    );

    // Wait for error state to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("image-error")).toBeInTheDocument();
      },
      { timeout: 200 }
    );

    // Error message should be visible
    expect(screen.getByText(mockTranslations.imageError)).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const mockClose = jest.fn();

    render(
      <ImageModal
        isOpen={true}
        imageUrl="test.jpg"
        onClose={mockClose}
        translations={mockTranslations}
      />
    );

    // Click close button
    fireEvent.click(screen.getByTestId("modal-close-button"));

    // onClose should have been called
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when clicking outside the modal content", () => {
    const mockClose = jest.fn();

    render(
      <ImageModal
        isOpen={true}
        imageUrl="test.jpg"
        onClose={mockClose}
        translations={mockTranslations}
      />
    );

    // Click on the overlay (outside content)
    fireEvent.click(screen.getByTestId("image-modal"));

    // onClose should have been called
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should handle Escape key to close the modal", () => {
    const mockClose = jest.fn();

    render(
      <ImageModal
        isOpen={true}
        imageUrl="test.jpg"
        onClose={mockClose}
        translations={mockTranslations}
      />
    );

    // Press Escape key
    fireEvent.keyDown(document, { key: "Escape" });

    // onClose should have been called
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should not close when clicking inside the modal content", async () => {
    const mockClose = jest.fn();

    render(
      <ImageModal
        isOpen={true}
        imageUrl="test.jpg"
        onClose={mockClose}
        translations={mockTranslations}
      />
    );

    // Wait for image to load
    await waitFor(
      () => {
        expect(screen.queryByTestId("image-loading")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );

    // Get modal content and click inside it (not the image directly)
    const modalContent = screen.getByTestId("modal-image").parentElement;
    fireEvent.click(modalContent);

    // onClose should not have been called
    expect(mockClose).not.toHaveBeenCalled();
  });
});
