import { GoogleGenAI, Modality } from "@google/genai";
import { File } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mock data.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateContent = async (prompt: string, config?: any): Promise<string> => {
    if (!API_KEY) {
      return new Promise(resolve => setTimeout(() => resolve(`// Mock response for: ${prompt.substring(0, 50)}...\nconsole.log("Hello from Mock AI!");`), 1000));
    }
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          ...config,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get response from AI. Check console for details.");
    }
};

export const generateCode = (description: string, language: string, fileName: string): Promise<string> => {
    const fileTypeInstructions = {
        'html': 'Include a basic HTML5 boilerplate with head, title, and body tags.',
        'css': 'Provide some example CSS rules for a body and a container class.',
        'javascript': 'Include a simple console.log statement and an example function.',
        'python': 'Include a simple print statement and an example function.'
    }[language] || `Write a simple "Hello World" example.`;
    
    const prompt = `Generate a complete, functional code snippet in ${language} for a file named "${fileName}". The description is: "${description}". 
If the description is empty or very simple, create a well-structured boilerplate. 
${fileTypeInstructions}
The code should be well-commented and follow best practices. Only output the code itself, without any surrounding text or markdown backticks.`;
    return generateContent(prompt);
};

export const analyzeCode = (code: string): Promise<string> => {
    const prompt = `Act as an expert code reviewer. Analyze the following code snippet. Provide a concise summary of its quality, including readability, maintainability, efficiency, and best practices. Suggest specific improvements.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const explainCode = (code: string): Promise<string> => {
    const prompt = `Explain the following code snippet in a clear and concise way, as if you were explaining it to a beginner. Break down the logic step by step.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const refactorCode = (code: string): Promise<string> => {
    const prompt = `Refactor the following code to improve its structure, readability, and maintainability. Do not change its functionality. Only output the refactored code, without any explanation or markdown backticks.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const optimizeCode = (code: string): Promise<string> => {
    const prompt = `Optimize the following code for performance. Only output the optimized code, without any explanation or markdown backticks.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const addComments = (code: string): Promise<string> => {
    const prompt = `Add comprehensive and clear comments to the following code. Explain what each part does. Only output the commented code, without any explanation or markdown backticks.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateTests = (code: string): Promise<string> => {
    const prompt = `Generate unit tests for the following code using the Jest framework. Cover the main functionality and edge cases. Only output the test code, without any explanation or markdown backticks.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const securityScan = (code: string): Promise<string> => {
    const prompt = `Act as a security expert. Scan the following code for potential vulnerabilities (like XSS, injection, etc.). List any vulnerabilities you find and suggest how to fix them. If no vulnerabilities are found, state that.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const getChatReply = async (message: string, history: string, codeContext?: string): Promise<string> => {
    const contextPrompt = codeContext 
        ? `The user has provided the following code file as context:\n\n---\n${codeContext}\n---\n\n`
        : '';
    
    const prompt = `You are a helpful and friendly AI programming assistant.
${contextPrompt}
Here is the conversation history:
${history}

User's latest message: "${message}"

Your response:`;
    return generateContent(prompt);
};


export const translateCode = (code: string, targetLanguage: string = 'Python'): Promise<string> => {
    const prompt = `Translate the following code snippet to ${targetLanguage}. Preserve the logic and functionality. Only output the translated code, without any explanation or markdown backticks.

Code to translate:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const suggestImprovements = (code: string): Promise<string> => {
    return analyzeCode(code); // Re-using analyzeCode as it provides improvement suggestions.
};

export const codeReview = (code: string): Promise<string> => {
    const prompt = `Act as a senior software engineer. Perform a comprehensive code review on the following snippet. Focus on potential bugs, performance issues, style violations, and architectural improvements. Provide actionable feedback in a structured format.

Code for review:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const detectPatterns = (code: string): Promise<string> => {
    const prompt = `Analyze the following code and identify any notable design patterns (e.g., Singleton, Factory, Observer) or common programming patterns (e.g., recursion, memoization). If none are present, state that and explain the code's general structure.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const performanceAnalysis = (code: string): Promise<string> => {
    const prompt = `Analyze the performance of the following code. Identify any potential bottlenecks, inefficient loops, or unnecessary computations. Suggest specific optimizations and explain why they would be beneficial.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const codeVisualization = (code: string): Promise<string> => {
    const prompt = `Generate a textual diagram (using ASCII or simple text) representing the structure and flow of the following code. Show function calls and class relationships if possible.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};


export const bugPrediction = (code: string): Promise<string> => {
    const prompt = `Analyze the following code for potential bugs that may not be syntax errors but logical flaws (e.g., off-by-one errors, race conditions, null pointer exceptions). List the potential bugs and explain why they might occur.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const architectureSuggestions = (code: string): Promise<string> => {
    const prompt = `Analyze the architecture of the following code. Suggest improvements for modularity, scalability, and maintainability. Consider principles like SOLID and separation of concerns.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const codeMetrics = (code: string): Promise<string> => {
    const prompt = `Calculate and describe key code metrics for the following snippet, including an estimation for cyclomatic complexity and maintainability index. Explain what each metric means in the context of this code.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const learningRecommendations = (code: string): Promise<string> => {
    const prompt = `Based on the patterns and complexity in the following code, provide personalized learning recommendations. What topics or concepts should the author study next to improve their skills?

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const aiPairProgramming = (code: string): Promise<string> => {
    const prompt = `Act as an AI pair programmer. Review the following code and provide a helpful comment, question, or suggestion as if you were collaborating on it in real-time. The tone should be encouraging and constructive.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const getProjectReview = (files: File[]): Promise<string> => {
    const projectStructure = files.map(f => `// File: ${f.name}\n\n${f.content}`).join('\n\n---\n\n');
    const prompt = `Act as a senior architect. Review the following project structure and code. Provide a holistic analysis of the project's quality, scalability, and maintainability. Give 3 actionable suggestions for improvement.

Project Files:
\`\`\`
${projectStructure}
\`\`\``;
    return generateContent(prompt);
};

export const getChallengeReview = (challenge: {title: string, description: string}, userCode: string): Promise<string> => {
    const prompt = `I was given the following coding challenge:
Title: "${challenge.title}"
Description: "${challenge.description}"

Here is my solution:
\`\`\`
${userCode}
\`\`\`

Act as a friendly and encouraging programming tutor. Review my solution. Tell me if it's correct and complete. Provide feedback on code quality, style, and potential improvements.`;
    return generateContent(prompt);
};

export const getLearningPathUpdate = (files: File[]): Promise<string> => {
    const allCode = files.map(f => f.content).join('\n\n');
    const prompt = `Based on the following collection of code written by a user, analyze their current skill level, strengths, and weaknesses. Then, generate an updated "AI Learning Insights" section for them. The insights should include:
1.  A "Pattern Detected" insight about a positive habit or skill they are developing.
2.  A "Recommendation" insight suggesting a specific, actionable area for practice.
3.  A "Focus Area" insight highlighting a concept they seem to be struggling with.

User's Code:
\`\`\`
${allCode}
\`\`\``;
    return generateContent(prompt);
};

export const generateDocs = (code: string): Promise<string> => {
    const prompt = `Act as a senior software engineer. Add comprehensive documentation to the following code in the JSDoc format. Document each function, its parameters, and what it returns. For classes, document the class itself and its methods. Only output the documented code, without any explanation or markdown backticks.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateCommitMessage = (code: string): Promise<string> => {
    const prompt = `Analyze the following code snippet and generate a concise, one-line commit message in the Conventional Commits format (e.g., "feat: Add user login functionality"). The message should accurately summarize the purpose of the code. Only output the commit message string, without any surrounding text.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const reviewUiUx = (code: string): Promise<string> => {
    const prompt = `Act as a UI/UX design expert. Review the following HTML and CSS code. Provide actionable feedback on layout, accessibility (e.g., ARIA attributes, color contrast), and overall user experience. Present your feedback in a clear, bulleted list.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateWebApp = (description: string): Promise<string> => {
    const prompt = `Generate a complete, single HTML file based on the following description. The HTML file must include all CSS within <style> tags and all JavaScript within <script> tags. The code should be functional and self-contained. Do not include any explanations, comments about the code, or markdown backticks. Output only the raw HTML code starting with <!DOCTYPE html>.

Description: "${description}"`;
    return generateContent(prompt);
};

export const fixCode = (code: string): Promise<string> => {
    const prompt = `Act as an expert developer. Find and fix any bugs or errors in the following code. The fixed code should maintain the original functionality. Only output the fixed code itself, without any surrounding text, explanations, or markdown backticks.

Code with bugs:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateRegex = (description: string): Promise<string> => {
    const prompt = `Act as a regular expression expert. Based on the following description, generate a JavaScript-compatible regular expression. 
Also provide a brief, step-by-step explanation of how the regex works.
Format your response with the regex on the first line, followed by "---", and then the explanation.
Only output the regex, the separator, and the explanation. Do not include markdown backticks or any other surrounding text.

Description: "${description}"`;
    return generateContent(prompt);
};

export const codeToNaturalLanguage = (code: string): Promise<string> => {
    const prompt = `Translate the following code snippet into a clear, concise, high-level summary in plain English. Describe *what* the code does, not *how* it does it. The summary should be a single paragraph.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const identifyAlgorithm = (code: string): Promise<string> => {
    const prompt = `Analyze the following code and identify the specific, named algorithm or data structure it implements (e.g., "Bubble Sort", "Binary Search Tree", "Quick Sort"). If a well-known algorithm is present, name it and provide a one-sentence description of what it does. If no specific named algorithm is found, describe the general logic or process in one sentence.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateApiUsage = (code: string): Promise<string> => {
    const prompt = `Analyze the following code, which might contain functions, classes, or other exports. Generate a practical example of how to import and use the primary feature from this code in a separate JavaScript file. Only output the usage example code, without any explanation or markdown backticks.

Code to generate usage for:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const generateDiagram = (code: string): Promise<string> => {
    const prompt = `Analyze the following code and generate a diagram in Mermaid.js syntax that visually represents its structure and logic. Choose the most appropriate diagram type (e.g., flowchart, sequence diagram, class diagram). Only output the Mermaid.js syntax inside a markdown code block. Do not include any other explanation.

Code:
\`\`\`
${code}
\`\`\``;
    return generateContent(prompt);
};

export const findDocumentation = async (query: string): Promise<{ answer: string; sources: any[] }> => {
    if (!API_KEY) {
        return { answer: "Mock search result for: " + query, sources: [{ web: { uri: '#', title: 'Mock Source' } }] };
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the latest information from Google Search, provide a clear and concise answer to the following question: "${query}"`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        return { answer: response.text, sources };
    } catch (error) {
        console.error("Gemini search failed:", error);
        throw new Error("Failed to get response from AI search. Check console for details.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    if (!API_KEY) {
        console.log("Mock speech generation for:", text);
        return '';
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this naturally: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio ?? '';
    } catch (error) {
        console.error("Gemini speech generation failed:", error);
        throw new Error("Failed to generate speech. Check console for details.");
    }
};

export const generateCodeFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = {
      text: 'Analyze this image which is a wireframe or screenshot of a user interface. Generate a single, complete HTML file that implements this UI. The HTML file must include all necessary CSS within <style> tags and any required JavaScript for basic interactivity within <script> tags. The code should be functional, responsive, and self-contained. Do not include any explanations, comments about the code, or markdown backticks. Output only the raw HTML code starting with <!DOCTYPE html>.'
    };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};
