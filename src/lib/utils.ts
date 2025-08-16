import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to extract plain text from Tiptap JSON content
export function getPlainTextFromTiptapJson(jsonContent: string | null): string {
  if (!jsonContent) {
    return "";
  }

  try {
    const content = JSON.parse(jsonContent);
    let plainText = "";

    function extractText(node: any) {
      if (node.type === "text" && node.text) {
        plainText += node.text;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractText);
      }
    }

    if (content.type === "doc" && content.content && Array.isArray(content.content)) {
      content.content.forEach(extractText);
    }

    return plainText.trim();
  } catch (error) {
    console.error("Error parsing Tiptap JSON content:", error);
    return "Invalid content format"; // Fallback for malformed JSON
  }
}