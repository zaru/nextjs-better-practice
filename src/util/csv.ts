/**
 * Generic CSV utility functions
 * Domain-agnostic CSV parsing and serialization
 */

import type { z } from "zod";

/**
 * Parse a single CSV line considering quoted fields
 * Handles commas within quotes
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert an array of objects to CSV text
 * @param objects - Array of objects to convert
 * @param headers - Column headers (must match object keys)
 * @returns CSV formatted string with headers
 */
export function csvObjectsToText<T extends Record<string, string>>(
  objects: T[],
  headers: readonly (keyof T)[],
): string {
  const headerRow = headers.join(",");
  const dataRows = objects.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        // Quote values containing commas
        if (value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Parse CSV text into array of objects
 * @param csvText - CSV formatted string
 * @param expectedHeaders - Expected column headers for validation
 * @returns Array of objects with keys matching headers
 * @throws Error if CSV is empty or missing expected headers
 */
export function parseCsvText(
  csvText: string,
  expectedHeaders: readonly string[],
): Record<string, string>[] {
  const lines = csvText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  // Validate headers
  const headers = lines[0].split(",").map((h) => h.trim());

  if (!expectedHeaders.every((h) => headers.includes(h))) {
    throw new Error(`CSV must have headers: ${expectedHeaders.join(", ")}`);
  }

  // Parse data rows
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const rowData: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = values[j] || "";
    }

    result.push(rowData);
  }

  return result;
}

/**
 * Parse CSV text and validate with Zod schema
 * Combines CSV parsing with schema validation, collecting both valid rows and errors
 * @param csvText - CSV formatted string
 * @param expectedHeaders - Expected column headers for validation
 * @param schema - Zod schema for row validation
 * @returns Object containing valid rows and validation errors
 */
export function parseCsvWithSchema<T>(
  csvText: string,
  expectedHeaders: readonly string[],
  schema: z.ZodSchema<T>,
): {
  validRows: T[];
  errors: Array<{ row: number; message: string }>;
} {
  const errors: Array<{ row: number; message: string }> = [];
  const validRows: T[] = [];

  // Parse CSV (throws on structural errors like missing headers)
  const parsedRows = parseCsvText(csvText, expectedHeaders);

  // Validate each row with Zod schema
  for (let i = 0; i < parsedRows.length; i++) {
    const result = schema.safeParse(parsedRows[i]);

    if (result.success) {
      validRows.push(result.data);
    } else {
      errors.push({
        row: i + 2, // +2 because: 0-indexed + 1 for header row
        message: result.error.issues.map((e) => e.message).join(", "),
      });
    }
  }

  return { validRows, errors };
}
