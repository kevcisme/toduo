import fs from 'fs';
import path from 'path';
import os from 'os';

// A simple slugify function to create safe file names
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

// Directory where markdown notes will be saved
const vaultDir = path.join(os.homedir(), 'toduo-vault');

// Ensure that the vault directory exists
function ensureVaultDir(): void {
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }
}

/**
 * Save a new markdown note. Returns the file path.
 */
export async function saveNewNoteFile(
  title: string,
  content: string
): Promise<string> {
  ensureVaultDir();
  const fileName = `${slugify(title)}-${Date.now()}.md`;
  const filePath = path.join(vaultDir, fileName);
  const data = `# ${title}\n\n${content}`;
  await fs.promises.writeFile(filePath, data, 'utf8');
  return filePath;
}

/**
 * Update an existing markdown note at filePath.
 * If original file doesn't exist, creates a new one.
 */
export async function updateNoteFile(
  filePath: string,
  title: string,
  content: string
): Promise<string> {
  ensureVaultDir();
  let targetPath = filePath;
  if (!fs.existsSync(targetPath)) {
    // Create a new file if original is missing
    const baseName = path.basename(filePath, '.md');
    const timestamp = Date.now();
    const newFileName = `${baseName || slugify(title)}-${timestamp}.md`;
    targetPath = path.join(vaultDir, newFileName);
  }
  const data = `# ${title}\n\n${content}`;
  await fs.promises.writeFile(targetPath, data, 'utf8');
  return targetPath;
} 