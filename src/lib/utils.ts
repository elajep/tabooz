import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlainTextFromTiptapJson(jsonContent: string | null): string {
  if (!jsonContent) return "";

  let plainText = "";

  const traverse = (node: any) => {
    if (!node) return;

    if (node.type === "text" && typeof node.text === "string") {
      plainText += node.text + " ";
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  try {
    let doc: any = jsonContent;

    // 1. Se è stringa, parse
    if (typeof doc === "string") {
      doc = JSON.parse(doc);
    }

    // 2. Se dopo il parse è ANCORA una stringa (doppia serializzazione), parse di nuovo
    if (typeof doc === "string") {
      doc = JSON.parse(doc);
    }

    // 3. Ora dovremmo avere l’oggetto Tiptap
    if (doc.type === "doc" && Array.isArray(doc.content)) {
      doc.content.forEach(traverse);
    } else {
      traverse(doc);
    }
  } catch (error) {
    console.error("Error parsing Tiptap JSON content:", error);
    return "Invalid content format";
  }

  return plainText.trim();
}
