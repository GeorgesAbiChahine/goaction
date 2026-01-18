export function buildPlatePrompt(input: string) {
  return `
You are an AI formatting engine.

Convert the input text into a PlateJS-compatible Slate JSON document.

STRICT RULES:
- Output ONLY valid JSON
- NO markdown
- NO explanations
- NO code blocks
- Every node MUST have "children"
- Text must be inside { "text": string }

ALLOWED NODES:
- h1, h2, h3
- p
- ul
- li

STRUCTURE:
- Title (h2)
- Summary paragraph
- Action Items (ul if applicable)
- Decisions (ul if applicable)
- Notes (paragraphs)

INPUT:
"""
${input}
"""
`;
}
