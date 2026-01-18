export const buildFlowchartPrompt = (text: string) => {
    return `
  You are an expert system architect and visualizer. Your goal is to analyze the provided text and strictly output a JSON object representing a flowchart using the "reactflow" library structure.
  
  **Input Text:**
  "${text}"
  
  **Output Format (JSON Only):**
  You must output a single JSON object with two arrays: "nodes" and "edges".
  
  1.  **Nodes Array**:
      -   Each node must have:
          -   \`id\`: specific string logic (e.g., "1", "2").
          -   \`data\`: an object containing:
              -   \`title\`: A short, punchy header (2-5 words).
              -   \`label\`: A brief explanation (1-2 sentences).
          -   \`position\`: { x: 0, y: 0 } (The frontend will handle layout, but this is required by schema).
          -   \`type\`: "default" (or specific types if we define them later, stick to default for now).
  
  2.  **Edges Array**:
      -   Each edge must have:
          -   \`id\`: unique string (e.g., "e1-2").
          -   \`source\`: id of the source node.
          -   \`target\`: id of the target node.
          -   \`label\` (optional): a very short verb phrase describing the connection (e.g., "then", "if yes").
  
  **Rules:**
  -   Extract the logical flow, steps, or structure from the text.
  -   If the text is unstructured, try to organize it into a logical sequence or hierarchy.
  -   Keep titles concise.
  -   Do NOT return markdown formatting (no \`\`\`json blocks). Return RAW JSON only.
  -   Ensure the JSON is valid and parsable.
  `;
  };
  
