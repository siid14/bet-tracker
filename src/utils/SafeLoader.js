/**
 * Utility functions for safely loading resources
 */

/**
 * Safely load an image with error handling
 * @param {string} src - The image source URL
 * @param {function} onLoad - Callback when image is loaded successfully
 * @param {function} onError - Callback when image fails to load
 * @returns {Promise} A promise that resolves with the image or rejects with an error
 */
export const safeLoadImage = (src, onLoad, onError) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      const error = new Error("No image source provided");
      if (onError) onError(error);
      reject(error);
      return;
    }

    const img = new Image();

    img.onload = () => {
      if (onLoad) onLoad(img);
      resolve(img);
    };

    img.onerror = (e) => {
      const error = new Error(`Failed to load image: ${src}`);
      if (onError) onError(error);
      reject(error);
    };

    img.src = src;
  });
};

/**
 * Safe data fetcher that handles errors and returns a default value if fetching fails
 * @param {function} fetchFunction - The function that fetches data
 * @param {any} defaultValue - The default value to return if fetching fails
 * @returns {Promise} A promise that resolves with the fetched data or the default value
 */
export const safeDataFetch = async (fetchFunction, defaultValue) => {
  try {
    const data = await fetchFunction();
    return data || defaultValue;
  } catch (error) {
    console.error("Error fetching data:", error);
    return defaultValue;
  }
};

/**
 * Safely convert a value to a number
 * @param {any} value - The value to convert
 * @param {number} defaultValue - The default value to return if conversion fails
 * @returns {number} The converted number or the default value
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Safely format a number as currency
 * @param {any} value - The value to format
 * @param {string} currency - The currency symbol
 * @param {number} decimals - The number of decimal places
 * @returns {string} The formatted currency string
 */
export const safeCurrency = (value, currency = "€", decimals = 2) => {
  const num = safeNumber(value);
  return `${currency}${num.toFixed(decimals)}`;
};

/**
 * Sanitize data for Recharts to prevent rendering errors
 * @param {Array} data - The data array to sanitize
 * @param {Array} requiredFields - Fields that must be present and valid
 * @returns {Array} The sanitized data array
 */
export const sanitizeChartsData = (data, requiredFields = []) => {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => {
      // Must be an object
      if (!item || typeof item !== "object") return false;

      // All required fields must be present and valid
      if (requiredFields.length > 0) {
        return requiredFields.every((field) => {
          const value = item[field];
          return value !== undefined && value !== null && !isNaN(Number(value));
        });
      }

      return true;
    })
    .map((item) => {
      // Create a new object with sanitized values
      const sanitized = { ...item };

      // Convert all numeric values to numbers
      Object.keys(sanitized).forEach((key) => {
        const value = sanitized[key];
        if (typeof value === "string" && !isNaN(Number(value))) {
          sanitized[key] = Number(value);
        } else if (value === null || value === undefined) {
          // Provide defaults for missing values
          if (
            typeof key === "string" &&
            (key.includes("profit") ||
              key.includes("loss") ||
              key.includes("stake") ||
              key.includes("odds") ||
              key.includes("gains"))
          ) {
            sanitized[key] = 0;
          } else if (typeof key === "string" && key.includes("date")) {
            sanitized[key] = "";
          }
        }
      });

      return sanitized;
    });
};
