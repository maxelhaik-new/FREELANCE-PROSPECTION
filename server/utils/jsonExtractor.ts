/**
 * Utility to reliably extract and parse JSON from LLM responses,
 * even when wrapped in markdown codeblocks or surrounded by conversational text.
 */
export function extractJsonFromText<T = any>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== "string") {
    return fallback;
  }

  const trimmed = rawText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue to advanced extraction
  }

  // 2. Extract from markdown code blocks: ```json ... ``` or ``` ... ```
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(markdownRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim()) as T;
    } catch {
      // Continue to bracket detection
    }
  }

  // 3. Find first outer JSON array [...] or object {...}
  const firstArray = trimmed.indexOf("[");
  const lastArray = trimmed.lastIndexOf("]");
  if (firstArray !== -1 && lastArray !== -1 && lastArray > firstArray) {
    try {
      const slice = trimmed.substring(firstArray, lastArray + 1);
      return JSON.parse(slice) as T;
    } catch {
      // Continue
    }
  }

  const firstObject = trimmed.indexOf("{");
  const lastObject = trimmed.lastIndexOf("}");
  if (firstObject !== -1 && lastObject !== -1 && lastObject > firstObject) {
    try {
      const slice = trimmed.substring(firstObject, lastObject + 1);
      return JSON.parse(slice) as T;
    } catch {
      // Fallback
    }
  }

  return fallback;
}
