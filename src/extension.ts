import * as vscode from 'vscode';
import { getPrompts } from './promptProvider'; // Import the function to get prompts
import { PromptItem } from './types'; // Import the prompt item type

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    console.log('Extension "prompt-snippets" activated.');

    // Register the command defined in package.json
    const disposable = vscode.commands.registerCommand('promptSnippets.insertPrompt', async () => {
        // --- 1. Get Prompts ---
        const promptItems: PromptItem[] = await getPrompts();

        if (!promptItems || promptItems.length === 0) {
            // No prompts found or error occurred (message shown in getPrompts)
            console.log('No prompt items found or error occurred.');
            // Optionally show another message here if getPrompts doesn't always show one
            // vscode.window.showInformationMessage('No prompt snippets found. Check configuration or directory.');
            return; // Exit command execution
        }

        // --- 2. Show Quick Pick ---
        // Map PromptItem to QuickPickItem format if needed,
        // but PromptItem already aligns well (label, description, detail)
        const selectedItem = await vscode.window.showQuickPick(promptItems, {
            placeHolder: 'Select a prompt snippet to insert',
            matchOnDescription: true, // Allow searching in description
            matchOnDetail: true, // Allow searching in detail (e.g., path)
        });

        // --- 3. Insert Snippet ---
        if (selectedItem) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                // Create a SnippetString to allow for potential future VS Code snippet features
                // (like tab stops $1, $2, though we aren't using them yet)
                const snippetString = new vscode.SnippetString(selectedItem.promptText);

                // Insert the snippet at the current cursor position(s)
                editor.insertSnippet(snippetString);

                console.log(`Inserted prompt: ${selectedItem.label}`);
            } else {
                vscode.window.showErrorMessage('No active text editor found.');
            }
        } else {
            // User cancelled the Quick Pick
            console.log('Prompt insertion cancelled by user.');
        }
    });

    // Add the command disposable to the extension's context subscriptions
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "prompt-snippets" deactivated.');
} 