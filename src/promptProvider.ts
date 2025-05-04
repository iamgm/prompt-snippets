import * as vscode from 'vscode';
import * as fs from 'fs/promises'; // Use promises API for async file system ops
import * as path from 'path';
import * as yaml from 'js-yaml'; // YAML parser
import { PromptItem, ExtensionConfig } from './types'; // Import our types

// --- Configuration Helper ---

/**
 * Reads the extension's configuration from VS Code settings.
 */
function getConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('promptSnippets');
    return {
        directoryPath: config.get<string | null>('directoryPath', null),
        recursiveScan: config.get<boolean>('recursiveScan', true),
        promptSectionHeader: config.get<string>('promptSectionHeader', '## Prompt Text'),
    };
}

// --- Parsing Helpers ---

/**
 * Extracts YAML front matter and content from a Markdown string.
 */
function parseFrontMatter(fileContent: string): { metadata: Record<string, any>, content: string } {
    const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = fileContent.match(frontMatterRegex);

    if (match && match[1]) {
        try {
            const metadata = yaml.load(match[1]) as Record<string, any> || {};
            const content = fileContent.substring(match[0].length).trimStart();
            return { metadata, content };
        } catch (e) {
            console.error('Error parsing YAML front matter:', e);
            // Return content without metadata if YAML parsing fails
            return { metadata: {}, content: fileContent };
        }
    }
    // No front matter found
    return { metadata: {}, content: fileContent };
}

/**
 * Extracts the prompt text section based on the configured header. (Alternative Version)
 */
function extractPromptText(markdownContent: string, header: string): string {
    // Find the start index of the header line
    // We need to match the header at the beginning of a line. Use regex for this.
    // Ensure we match the header text exactly, followed by a newline or end of string.
    const escapedHeaderText = header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape regex special characters in the header string
    const headerRegex = new RegExp(`^${escapedHeaderText}\\s*(\r?\n|$)`, 'm'); // Match header at line start, followed by optional space and newline/end
    const headerMatch = markdownContent.match(headerRegex);

    if (!headerMatch || headerMatch.index === undefined) {
         console.warn(`Prompt section header "${header}" line not found using regex.`);
         return ''; // Header line itself not found
    }

    // Calculate where the actual prompt text begins (start of the line AFTER the header line)
    const startOfPrompt = headerMatch.index + headerMatch[0].length; // Index + length of matched header line including newline

    // Get the content strictly AFTER the header line
    let contentAfterHeader = markdownContent.substring(startOfPrompt);

    // Regex to find the next heading marker (e.g. #, ##, ###) at the beginning of a line OR end of string implicitly
    // We want to capture everything UNTIL the next heading starts
    const nextHeadingRegex = /^\s*#{1,6}\s+/m; // Find the start of the next heading line
    const nextHeadingMatch = contentAfterHeader.match(nextHeadingRegex);

    let endOfPromptIndex = -1;
    if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
        // Found the next heading, capture text *before* its starting position
        endOfPromptIndex = nextHeadingMatch.index;
        contentAfterHeader = contentAfterHeader.substring(0, endOfPromptIndex);
    }
    // If no next heading match, contentAfterHeader already contains everything to the end.

    const extractedText = contentAfterHeader.trim(); // Trim whitespace from the final extracted block

    if (!extractedText && headerMatch) { // Check if we found the header but extracted nothing
         console.warn(`Content after header "${header}" was found, but is empty after trimming.`);
         // It's still technically found, so maybe return empty string is okay?
         // Depending on desired behavior, you might want to return '' here too.
    } else if (extractedText) {
         console.log(`Successfully extracted prompt text after header "${header}".`);
    }

    return extractedText;
}


// --- File System & Parsing Logic ---

/**
 * Parses a single Markdown file into a PromptItem.
 * Returns null if the file is invalid or doesn't contain the prompt section.
 */
async function parsePromptFile(filePath: string, config: ExtensionConfig): Promise<PromptItem | null> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { metadata, content: markdownContent } = parseFrontMatter(fileContent);

        const promptText = extractPromptText(markdownContent, config.promptSectionHeader);

        if (!promptText) {
            // Don't include files that don't have the prompt section
            console.log(`Skipping file (no prompt text section found or extracted): ${filePath}`);
            return null;
        }

        const title = metadata?.title || path.basename(filePath, '.md');

        return {
            id: filePath,
            label: title,
            promptText: promptText,
            description: metadata?.description || '',
            detail: `Path: ${path.relative(config.directoryPath || '', filePath)}`,
            metadata: metadata,
        };
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        vscode.window.showWarningMessage(`Failed to parse prompt file: ${path.basename(filePath)}`);
        return null;
    }
}

/**
 * Scans the configured directory for .md files and parses them.
 * Handles recursion based on configuration.
 * Returns an array of valid PromptItem objects.
 */
export async function getPrompts(): Promise<PromptItem[]> {
    const config = getConfig();
    if (!config.directoryPath) {
        vscode.window.showErrorMessage('Prompt Snippets: Directory path is not configured. Please set "promptSnippets.directoryPath" in your settings.');
        return []; // No path configured
    }

    const promptItems: PromptItem[] = [];
    const absolutePath = path.resolve(config.directoryPath); // Ensure absolute path

    try {
        const dirents = await fs.readdir(absolutePath, { withFileTypes: true });

        const parsePromises: Promise<PromptItem | null>[] = [];

        for (const dirent of dirents) {
            const fullPath = path.join(absolutePath, dirent.name);
            if (dirent.isDirectory() && config.recursiveScan) {
                // If recursive scan is enabled, initiate scan for subdirectory
                // NOTE: For simplicity, this example does a shallow recursive scan.
                // A deeper scan would require a recursive function call here.
                // Let's implement a full recursive scan.
                parsePromises.push(...await scanDirectoryRecursive(fullPath, config));

            } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.md')) {
                // If it's a Markdown file in the current directory, parse it
                parsePromises.push(parsePromptFile(fullPath, config));
            }
        }

         // Add results from the root directory scan
        const results = await Promise.all(parsePromises);
        promptItems.push(...results.filter((item): item is PromptItem => item !== null)); // Add non-null items


    } catch (error: any) {
        if (error.code === 'ENOENT') {
            vscode.window.showErrorMessage(`Prompt Snippets: Directory not found: ${config.directoryPath}. Please check the path in your settings.`);
        } else {
            console.error(`Error reading prompt directory ${absolutePath}:`, error);
            vscode.window.showErrorMessage(`Prompt Snippets: Error reading directory. Check console (Help > Toggle Developer Tools) for details.`);
        }
        return []; // Return empty on error
    }

    console.log(`Found ${promptItems.length} valid prompt snippets.`);
    return promptItems;
}

/**
 * Helper function for recursive directory scanning.
 * Returns an array of Promises, each resolving to PromptItem or null.
 */
 async function scanDirectoryRecursive(directoryPath: string, config: ExtensionConfig): Promise<Promise<PromptItem | null>[]> {
    let parsePromises: Promise<PromptItem | null>[] = [];
    try {
        const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
        for (const dirent of dirents) {
            const fullPath = path.join(directoryPath, dirent.name);
            if (dirent.isDirectory() && config.recursiveScan) {
                // Recursively scan subdirectories
                 parsePromises.push(...await scanDirectoryRecursive(fullPath, config));
            } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.md')) {
                // Parse Markdown files found
                parsePromises.push(parsePromptFile(fullPath, config));
            }
        }
    } catch (error) {
        console.error(`Error scanning subdirectory ${directoryPath}:`, error);
         // Optionally show a warning, but avoid flooding messages for many subdirs
    }
    return parsePromises;
} 