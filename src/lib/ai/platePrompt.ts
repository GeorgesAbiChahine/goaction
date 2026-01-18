export function buildPlatePrompt(input: string) {
  return `
You are an expert document formatter and editor.
Your task is to take the provided input text (which may be a raw transcript, rough notes, or stream of consciousness) and format it into a clean, professional, and structured Slate JSON document compatible with PlateJS.

CRITICAL DIRECTIVE:
- **DO NOT REMOVE INFORMATION**: You must preserve ALL factual details, numbers, dates, and names from the input.
- **NO SUMMARIZATION**: Do not condense the content. Reorganize it, but keep the substance.
- **CLEAN UP**: You may remove filler words (um, uh, like, you know) and fix grammar/punctuation, but do not alter the meaning.

OUTPUT FORMAT RULES:
- Output ONLY valid JSON.
- The root must be an ARRAY of nodes.
- Each node must be a valid Slate node: { "type": "...", "children": [...] }.
- Text must always be strictly inside leaf nodes: { "text": "..." }.
- Allowed types: "h1", "h2", "h3", "p", "ul", "ol", "li", "blockquote".
- Use "b", "i", "u" props on text nodes for emphasis where appropriate (e.g., { "text": "bold text", "bold": true }).

STRUCTURING GUIDANCE:
1. **Title**: If a clear topic exists, start with an "h1".
2. **Sections**: Group related thoughts under "h2" or "h3" headings.
3. **Lists**: Use "ul" for non-sequential items and "ol" for steps or priorities.
4. **Quotes**: Use "blockquote" for verbatim statements or key takeaways.
5. **Paragraphs**: Keep paragraphs focused. Break up long walls of text.

INPUT TEXT:
"""
${input}
"""
`;
}
