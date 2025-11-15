
import { FileSystemTree, File, Folder } from "../types";

export function findFile(tree: FileSystemTree, fileId: string): File | null {
    for (const node of tree) {
        if (node.type === 'file' && node.id === fileId) {
            return node;
        }
        if (node.type === 'folder') {
            const found = findFile(node.children, fileId);
            if (found) return found;
        }
    }
    return null;
}

export function getAllFiles(tree: FileSystemTree): File[] {
    let files: File[] = [];
    for (const node of tree) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.type === 'folder') {
            files = files.concat(getAllFiles(node.children));
        }
    }
    return files;
}
