/**
 * Represents the essential information extracted from a prompt Markdown file.
 */
export interface PromptItem {
    /**
     * The unique identifier or file path of the prompt.
     * Used internally, potentially for caching keys.
     */
    id: string;

    /**
     * The title displayed to the user in the Quick Pick list.
     * Derived from YAML front matter ('title:') or filename.
     */
    label: string; // 'label' is the standard property for showQuickPick items

    /**
     * The actual prompt text content to be inserted.
     * Extracted from the section defined by promptSectionHeader.
     */
    promptText: string;

    /**
     * Optional: A short description or file path shown in Quick Pick.
     */
    description?: string; // 'description' is another standard Quick Pick property

    /**
     * Optional: Additional details, like the file path or tags, shown below the label.
     */
    detail?: string; // 'detail' is another standard Quick Pick property

    /**
     * Optional: Any other metadata extracted from YAML (tags, etc.).
     * Could be used for future filtering or display.
     */
    metadata?: Record<string, any>;
}

/**
 * Represents the configuration settings for the extension.
 */
export interface ExtensionConfig {
    directoryPath: string | null;
    recursiveScan: boolean;
    promptSectionHeader: string;
} 