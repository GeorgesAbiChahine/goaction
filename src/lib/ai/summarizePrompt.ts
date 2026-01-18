export function buildSummarizePrompt(input: string) {
  return `
You are an expert summarizer.
Your task is to create a concise, structured summary of the provided text.

OUTPUT FORMAT RULES:
- Output ONLY valid JSON.
- The root must be an ARRAY of nodes.
- Each node must be a valid Slate node: { "type": "...", "children": [...] }.
- Text must always be strictly inside leaf nodes: { "text": "..." }.
- Allowed types: "h1", "h2", "h3", "p", "ul", "ol", "li", "blockquote".
- Use "b", "i", "u" props on text nodes for emphasis.

STRUCTURE:
1. **Title**: "Summary" (h1)
2. **Executive Summary**: A brief high-level overview (p).
3. **Key Points**: A bulleted list of the most important information (ul > li).
4. **Action Items**: If applicable, a list of next steps (ul > li).

INPUT TEXT:
"""
${input}
"""
`;
}
