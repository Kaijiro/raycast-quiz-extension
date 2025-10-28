import { Clipboard, Toast, closeMainWindow, environment, open, showHUD, showToast } from "@raycast/api";
import { readFileSync } from "fs";
import { parseQuizJson, validateQuizStructure, Quiz } from "./utils/validation";
import { storeQuiz } from "./utils/storage";

export default async function importQuiz() {
  // Raycast has no direct file picker in API; use the built-in open dialog via AppleScript on macOS.
  // For portability, if not macOS, fall back to asking user to paste path.
  try {
    await closeMainWindow();
    const path = await pickFile();
    if (!path) {
      await showToast({ style: Toast.Style.Failure, title: "No file selected" });
      return;
    }

    const content = readFileSync(path, "utf8");
    const { quiz, errors: parseErrors } = parseQuizJson(content);
    if (parseErrors.length > 0) {
      await showToast({ style: Toast.Style.Failure, title: "Invalid JSON", message: parseErrors.slice(0, 3).join("; ") });
      return;
    }
    const { errors } = validateQuizStructure(quiz);
    if (errors.length > 0) {
      await showToast({ style: Toast.Style.Failure, title: "Validation failed", message: errors.slice(0, 3).join("; ") });
      return;
    }
    const q = quiz as Quiz;
    await storeQuiz(q);
    await showHUD(`Imported quiz: ${q.title}`);

    // Start quiz by opening the start-quiz command with quizId
    try {
      await open(
        `raycast://extensions/${environment.extensionOwner}/${environment.extensionName}/start-quiz?arguments=${encodeURIComponent(
          JSON.stringify({ quizId: q.quizId })
        )}`
      );
    } catch (err) {
      // Fallback: open Start Quiz without args and inform the user
      await showHUD("Quiz imported. Open Start Quiz to begin.");
      try {
        await open(`raycast://extensions/${environment.extensionOwner}/${environment.extensionName}/start-quiz`);
      } catch {
        // ignore
      }
    }
  } catch (e: any) {
    await showToast({ style: Toast.Style.Failure, title: "Import failed", message: e?.message ?? String(e) });
  }
}

async function pickFile(): Promise<string | undefined> {
  if (environment.platform === "macos") {
    const { execSync } = await import("node:child_process");
    try {
      const script = `osascript -e 'set theFile to POSIX path of (choose file with prompt "Select a quiz JSON file" of type {"public.json"})'`;
      const output = execSync(script, { encoding: "utf8" }).trim();
      return output;
    } catch {
      return undefined;
    }
  }
  // Fallback: ask user to paste path from clipboard
  const path = await Clipboard.readText();
  return path ?? undefined;
}
