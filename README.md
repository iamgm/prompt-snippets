# Prompt Snippets

A VS Code extension for easily finding and inserting Markdown-based prompt snippets.

## Features

- Insert prompt snippets with a simple command
- Supports YAML front matter for metadata
- Recursive directory scanning
- Customizable prompt section header
- Quick search through prompt titles and descriptions

## Requirements

- VS Code 1.80.0 or higher

## Installation

1. Download the `.vsix` file from the releases
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu at the top of the Extensions view
4. Select "Install from VSIX..."
5. Choose the downloaded `.vsix` file

## Configuration

This extension requires the following settings:

* `promptSnippets.directoryPath`: (Required) Full path to the directory containing your prompt Markdown (.md) files
* `promptSnippets.recursiveScan`: (Optional) Whether to scan subdirectories. Default: true
* `promptSnippets.promptSectionHeader`: (Optional) The Markdown header that marks the beginning of the prompt text. Default: "## Prompt Text"

## Usage

1. Set the `promptSnippets.directoryPath` in your VS Code settings
2. Open the Command Palette (Ctrl+Shift+P)
3. Type "Prompt Snippets: Insert Prompt"
4. Select a prompt from the list
5. The prompt text will be inserted at your cursor position

## Prompt File Format

Your prompt files should be Markdown files with the following structure:

```markdown
---
title: Your Prompt Title
description: Optional description
tags: [optional, tags]
---

## Prompt Text
Your actual prompt text goes here.
It can span multiple lines.

## Additional Sections
Any other sections will be ignored.
```

## Known Issues

None at the moment.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE.txt](LICENSE.txt) for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other badges later if desired (e.g., version from Marketplace) -->

Stop copying and pasting prompts from scattered notes! This extension helps you organize your prompts in structured Markdown files and access them quickly via the Command Palette.

## Features ✨

*   🔎 **Scan Directory:** Scans a user-defined directory (and optionally subdirectories) for prompt files.
*   📄 **Markdown & YAML Parsing:** Reads `.md` files, recognizes YAML front matter for metadata (like `title`, `description`, `tags`), and extracts the prompt text from a designated section.
*   ⚡ **Quick Pick Access:** Uses VS Code's Command Palette (`Ctrl+Shift+P`) and Quick Pick UI to let you fuzzy-search and select prompts by title, description, or path.
*   🖱️ **Simple Insertion:** Inserts the selected prompt's text directly into the active editor at your cursor position.
*   ⚙️ **Configurable:** Customize the prompt directory path, recursive scanning, and the Markdown header used to identify the prompt text section.

## Requirements

*   Visual Studio Code (Version specified in `package.json`, e.g., 1.80.0 or higher)

## Installation 🚀

1.  **Package the Extension:** If you haven't already, run `vsce package` in the project's root directory. This will create a `.vsix` file (e.g., `prompt-snippets-0.0.1.vsix`).
2.  **Install from VSIX:**
    *   Open VS Code.
    *   Go to the Extensions view (Ctrl+Shift+X).
    *   Click the `...` (ellipsis) icon at the top-right of the Extensions view.
    *   Select "**Install from VSIX...**".
    *   Navigate to and select the `.vsix` file created in step 1.
    *   Reload VS Code when prompted.

*(Alternatively, once published, you'll be able to install directly from the VS Code Marketplace.)*

## Usage 💡

1.  **Configure the Directory Path:**
    *   Open VS Code Settings (Ctrl+,).
    *   Search for "Prompt Snippets".
    *   Set the **`Prompt Snippets: Directory Path`** setting to the **full path** of the folder where you store your `.md` prompt files. **This is required!**
2.  **Prepare Prompt Files:** Ensure your prompt files are in the configured directory and follow the expected format (see below).
3.  **Open Command Palette:** Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac).
4.  **Run Command:** Type `Prompt Snippets` and select `Prompt Snippets: Insert Prompt`.
5.  **Select Prompt:** Choose the desired prompt from the Quick Pick list that appears.
6.  **Done!** The prompt text will be inserted into your active editor.

## Prompt File Format (`.md`) 📝

The extension expects `.md` files structured as follows:

```markdown
---
# YAML Front Matter (Optional but Recommended)
# Provides metadata for the extension
title: My Awesome Prompt Title (Used in Quick Pick)
description: A short description (Shown in Quick Pick)
tags: [tag1, analysis, example] # (Potential future use for filtering)
# Add any other metadata you find useful
---

# Optional Explanation Section

You can write any notes, explanations, usage instructions, or context
about the prompt here. This part is *ignored* by the inserter.

It can span multiple paragraphs.

---
(Optional separator)

## Prompt Text
# <-- The exact header configured in settings (default: ## Prompt Text)
# Everything BELOW this header (until the next heading of the same or lesser level,
# or the end of the file) is considered the prompt text to be inserted.

This is the actual prompt text that will be inserted into your editor.
It can include multiple lines, paragraphs, code blocks, etc.

{{PLACEHOLDER_VARIABLE}} # (Placeholder support may be added later)

Final line of the prompt.

### A Sub-Section (This would NOT be included as it's a heading)
More text not included.