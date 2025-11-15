import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Loader from '../Loader';
import * as geminiService from '../../services/geminiService';
import { File, FileSystemTree } from '../../types';
import { Tab } from '../../constants';

interface UiGeneratorPanelProps {
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveTab: (tab: Tab) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // remove the prefix e.g. "data:image/png;base64,"
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as base64 string"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const UiGeneratorPanel: React.FC<UiGeneratorPanelProps> = ({ setFileSystem, setOpenFileIds, setActiveFileId, setActiveTab }) => {
    const [image, setImage] = useState<{ url: string; b64: string; mime: string; } | null>(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError('');
            setGeneratedCode('');
            const imageUrl = URL.createObjectURL(file);
            try {
                const base64Data = await blobToBase64(file);
                setImage({ url: imageUrl, b64: base64Data, mime: file.type });
            } catch (err) {
                console.error(err);
                setError('Failed to process image file.');
            }
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setGeneratedCode('');
        setError('');
        try {
            const code = await geminiService.generateCodeFromImage(image.b64, image.mime);
            setGeneratedCode(code);
        } catch (err) {
            const errorMessage = `Error generating app: ${err instanceof Error ? err.message : 'Unknown error'}`;
            setGeneratedCode(`<!-- ${errorMessage} -->`);
            setError(errorMessage);
            console.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenInEditor = () => {
        if (!generatedCode) return;
        const newFileId = Date.now().toString();
        const newFile: File = { 
            id: newFileId, 
            name: `ui-generated-${newFileId}.html`, 
            content: generatedCode, 
            type: 'file' 
        };
        setFileSystem(fs => [newFile, ...fs]);
        setOpenFileIds(ids => [...new Set([newFileId, ...ids])]);
        setActiveFileId(newFileId);
        setActiveTab(Tab.EDITOR);
    };

    return (
        <Card title="UI Generator from Image" icon="fas fa-image">
             <p className="text-sm text-gray-400 mb-4">Upload a wireframe, mockup, or screenshot of a user interface, and the AI will generate the code for it.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Column */}
                <div>
                    <h3 className="text-md font-semibold mb-2">1. Upload Your Design</h3>
                    <div className="bg-gray-900 rounded-lg p-4 min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-gray-600">
                        {image ? (
                            <img src={image.url} alt="UI Preview" className="max-w-full max-h-48 rounded-lg" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <i className="fas fa-cloud-upload-alt text-4xl mb-2"></i>
                                <p>Drag & drop or click to upload</p>
                            </div>
                        )}
                         <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                     <Button onClick={handleGenerate} isLoading={isLoading} icon="fas fa-magic-wand-sparkles" className="mt-4" disabled={!image}>
                        Generate Code & Preview
                    </Button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                {/* Output Column */}
                <div>
                    <h3 className="text-md font-semibold mb-2">2. Preview & Use</h3>
                    <div className="bg-gray-900 rounded-lg p-2 min-h-[400px] h-full flex flex-col">
                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center">
                                <Loader text="Building your UI..." size="lg" />
                            </div>
                        ) : generatedCode ? (
                            <>
                                <div className="flex gap-2 mb-2">
                                    <Button onClick={handleOpenInEditor} icon="fas fa-folder-open" variant="secondary" className="text-xs py-1 px-3 w-auto">Open in Editor</Button>
                                </div>
                                <iframe
                                    srcDoc={generatedCode}
                                    title="Live Preview"
                                    sandbox="allow-scripts allow-forms"
                                    className="w-full flex-grow rounded-md border-2 border-gray-700 bg-white"
                                />
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-gray-500">
                                <p>Your UI preview will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default UiGeneratorPanel;
