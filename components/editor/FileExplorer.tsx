import React, { useState } from 'react';
// FIX: Aliased the imported `File` type to `AppFile` to resolve naming conflicts
// with the browser's built-in `File` interface.
import { File as AppFile, Folder, FileSystemTree } from '../../types';
import * as geminiService from '../../services/geminiService';

interface FileExplorerProps {
    fileSystem: FileSystemTree;
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    openFileIds: string[];
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    activeFileId: string | null;
    setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ fileSystem, setFileSystem, setOpenFileIds, setActiveFileId, activeFileId }) => {
    
    const handleFileClick = (fileId: string) => {
        setActiveFileId(fileId);
        setOpenFileIds(prev => prev.includes(fileId) ? prev : [...prev, fileId]);
    };

    const createNewFile = async () => {
        const name = prompt("Enter new file name (e.g., app.js, style.css):");
        if (name) {
            // FIX: Use the `AppFile` alias for our custom file type.
            const newFile: AppFile = { id: Date.now().toString(), name, content: '', type: 'file' };
            
            // AI boilerplate generation
            try {
                const language = name.split('.').pop() || 'text';
                const boilerplate = await geminiService.generateCode('', language, name);
                newFile.content = boilerplate;
            } catch (error) {
                console.error("Failed to generate boilerplate:", error);
                newFile.content = '// Could not generate AI boilerplate.';
            }

            setFileSystem(fs => [...fs, newFile]);
            handleFileClick(newFile.id);
        }
    };
    
    const deleteFile = (fileId: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            setFileSystem(fs => fs.filter(f => f.id !== fileId));
            if (activeFileId === fileId) {
                setActiveFileId(null);
            }
            setOpenFileIds(ids => ids.filter(id => id !== fileId));
        }
    };

    const renderTree = (tree: FileSystemTree) => {
        return tree.map(node => {
            if (node.type === 'file') {
                return (
                    <div key={node.id} 
                         className={`flex justify-between items-center group p-1 rounded cursor-pointer text-sm ${activeFileId === node.id ? 'bg-cyan-500/30 text-white' : 'hover:bg-gray-700'}`}
                         onClick={() => handleFileClick(node.id)}>
                        <span className="truncate"><i className="far fa-file-alt mr-2"></i>{node.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteFile(node.id); }} className="hidden group-hover:block text-gray-500 hover:text-red-400 w-5 h-5"><i className="fas fa-trash"></i></button>
                    </div>
                );
            }
            // Folder rendering can be added here
            return null;
        });
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // FIX: Use the `AppFile` alias for our custom file type.
        const newEntries: AppFile[] = [];
        // FIX: Replaced forEach with a for...of loop to fix type inference issues with the 'file' variable.
        // With the name collision resolved, `file` is now correctly inferred as a DOM `File` object.
        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                newEntries.push({ id: Date.now().toString() + file.name, name: file.name, content, type: 'file' });
                if (newEntries.length === files.length) {
                    setFileSystem(fs => [...fs, ...newEntries]);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-bold text-sm">File Explorer</h3>
                <div className="flex gap-2">
                    <button onClick={createNewFile} title="New File" className="text-gray-400 hover:text-white"><i className="fas fa-plus"></i></button>
                    <label htmlFor="file-upload" className="cursor-pointer text-gray-400 hover:text-white" title="Upload Files">
                        <i className="fas fa-upload"></i>
                    </label>
                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleUpload} />
                </div>
            </div>
            <div className="space-y-1">
                {renderTree(fileSystem)}
            </div>
        </div>
    );
};

export default FileExplorer;