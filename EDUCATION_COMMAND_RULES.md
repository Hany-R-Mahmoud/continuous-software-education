# `/education` Command - Cursor User Rules

This document contains the user rules snippet to add to your Cursor settings to enable the `/education` command.

## How to Add to Cursor

1. Open Cursor Settings
2. Navigate to "Rules for AI" or "User Rules"
3. Add the following section to your rules

---

## User Rules Snippet

```markdown
## Education Command: `/education`

### Command Purpose
The `/education` command automates the creation of new educational topics in the `continuous-software-education` repository. It can be executed from ANY repository, will navigate to the target repo, perform all work there, and then inform completion. This allows flexible usage without requiring you to be in the education repo.

### Key Features
- **Flexible Usage**: Can be executed from any repository
- **Safe Navigation**: Opens new window/tab to avoid conflicts with uncommitted changes
- **Automatic Workflow**: Handles file creation, git operations, and PR creation
- **Non-Destructive**: Never modifies the original repository you're working in

### Command Workflow

When user types `/education`:

1. **Save Current Context**
   - Note the current repository path and working directory
   - Save any relevant conversation context about the topic

2. **Locate Target Repository**
   - Search for `continuous-software-education` repository in common locations:
     - `~/learning/continuous-software-education`
     - `~/Documents/continuous-software-education`
     - `~/projects/continuous-software-education`
     - `~/continuous-software-education`
   - If not found, ask user: "Please provide the path to the 'continuous-software-education' repository"
   - Verify the path exists and is a valid git repository

3. **Window Management**
   - **Preferred**: Attempt to open new Cursor window/tab for `continuous-software-education` repo
     - Use: `cursor [repo-path]` or `code [repo-path]` command if available
     - This prevents conflicts with uncommitted changes in original window
   - **Fallback**: If unable to open new window programmatically:
     - Instruct user: "Please open a new Cursor window/tab and navigate to the 'continuous-software-education' repository. I'll wait for you to confirm."
     - Wait for user confirmation before proceeding

4. **Safety Verification** (in continuous-software-education repo)
   - Check git remote URL contains `continuous-software-education`:
     - Command: `git remote -v | grep -i "continuous-software-education"`
     - If not found, abort with: "Error: This does not appear to be the 'continuous-software-education' repository"
   - Verify `Random/` folder exists at root level
     - If not found, abort with: "Error: Repository structure not recognized. Missing 'Random/' folder"
   - Both checks must pass before proceeding

5. **Topic Analysis** (using context from original conversation)
   - Review conversation history from the original repository to understand the topic
   - Summarize the topic in 2-3 sentences
   - Generate a sanitized topic name:
     - Convert to kebab-case (lowercase, spaces to hyphens)
     - Remove special characters (keep only alphanumeric and hyphens)
     - Example: "React Hooks" → "react-hooks", "TypeScript Generics" → "typescript-generics"

6. **File Creation Planning**
   - Create main markdown file: `[sanitized-topic-name].md`
   - Suggest related files based on topic (diagrams, code examples, etc.)
   - **Auto-create** all suggested files (user confirmed auto-creation preference)

7. **Location Selection**
   - Ask user: "Where should this topic be created?"
   - Options:
     - "Create as main repo subfolder: `[sanitized-topic-name]/`"
     - "Create in Random folder: `Random/[sanitized-topic-name]/`"
   - Wait for user response before proceeding

8. **Git Workflow** (in continuous-software-education repo)
   - Create new branch: `topic/[sanitized-topic-name]`
   - Create all files in the selected location
   - Update root `README.md`:
     - Add new topic entry in appropriate section (main topics or Random section)
     - Follow existing format with link and description
   - Stage all files: `git add .`
   - Commit: `git commit -m "Add: [Topic Name]"` (use original topic name, not sanitized)
   - Push branch: `git push -u origin topic/[sanitized-topic-name]`
   - Create PR using GitHub CLI or API:
     - Title: `Add: [Topic Name]`
     - Body: Auto-generated from topic summary
   - Open PR in browser

9. **Completion**
   - Inform user: "✅ Topic creation complete! Branch pushed and PR created. You can now return to your original repository window."
   - Do NOT automatically switch back - let user manually return to original repo
   - Original repository remains untouched

10. **File Content Guidelines**
    - Main markdown file should include:
      - Clear title and overview
      - Table of contents (if multi-section)
      - Detailed explanations
      - Code examples where applicable
      - Links to related resources
    - Related files (diagrams, examples) should be relevant and well-organized

### Error Handling
- If target repo not found: Ask user for path, or abort with clear instructions
- If unable to open new window: Instruct user to open manually, wait for confirmation
- If not in correct repo (after navigation): Show clear error, do not proceed
- If git operations fail: Show error message, suggest manual steps
- If PR creation fails: Show error, provide branch name for manual PR creation
- Always provide helpful error messages with next steps
- Never modify the original repository - all work happens in continuous-software-education repo

### Example Usage

**Scenario 1: Command from any repo**
User (in project-x repo): `/education`
AI: "I'll help you create a topic in the continuous-software-education repository. Let me locate it..."
AI: [Searches for repo, opens new window]
AI: [After safety checks] "I'll create a topic about React Hooks based on our discussion. Where should this be created - as a main repo subfolder or in the Random folder?"
User: "Main repo subfolder"
AI: [Creates files, updates README, creates branch, commits, pushes, opens PR]
AI: "✅ Topic creation complete! Branch pushed and PR created. You can now return to your original repository window."

**Scenario 2: Repo not found**
User: `/education`
AI: "I couldn't find the 'continuous-software-education' repository in common locations. Please provide the full path to the repository."
User: "/Users/username/projects/continuous-software-education"
AI: [Continues with workflow]

### Important Notes
- **Flexibility**: Command works from ANY repository - it navigates to target repo automatically
- **Safety**: Original repository is NEVER modified - all work happens in continuous-software-education
- **Window Management**: Prefers opening new window to avoid conflicts with uncommitted changes
- **Idempotency**: Command must be idempotent - can be safely re-run if interrupted
- **Verification**: Always verify target repository before any git operations
- **Feedback**: Provide clear feedback at each step, especially when switching contexts
- **Cleanup**: If user cancels, clean up any partial work in target repo only
```

---

## Testing the Command

After adding these rules:

1. **From any repository**: Start a conversation about a topic you want to document
2. Type `/education` when ready
3. The command will:
   - Locate the continuous-software-education repository
   - Open it in a new window (or ask you to)
   - Guide you through topic creation
4. Follow the prompts to create your topic
5. Return to your original repository when done

## Troubleshooting

**Command can't find target repo?**
- Provide the full path when prompted
- Or ensure the repo is in a common location (~/learning/, ~/Documents/, ~/projects/)

**New window not opening?**
- Manually open a new Cursor window/tab
- Navigate to continuous-software-education repository
- Confirm when ready, and the command will continue

**Command works in wrong repo?**
- This is a critical bug - the safety checks are not working
- Review the safety check implementation in the rules
- Verify both git remote check and Random/ folder check are passing

**PR not created?**
- Check GitHub CLI is installed and authenticated
- Verify you have push permissions to the repository
- Check branch name doesn't conflict with existing branches

---

## Notes for Implementation

- **Context Preservation**: The command relies on conversation context from the original repo, so discuss the topic before using `/education`
- **Naming**: Branch names are sanitized, but commit messages use the original topic name
- **README Updates**: The command automatically updates the main README, so review changes before merging PR
- **Paths**: All file paths are relative to the continuous-software-education repository root
- **Isolation**: The original repository you're working in remains completely untouched - no files modified, no git operations performed there

