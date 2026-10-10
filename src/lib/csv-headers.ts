// Normalised CSV header → canonical field key
// Normalize header: lowercase, remove underscores/dashes/spaces
function norm(h: string): string {
  return h.toLowerCase().replace(/[_\- ]/g, '');
}

// Maps normalized variants → canonical field key
const HEADER_MAP: Record<string, string> = {
  id: 'id',
  subject: 'subject',
  category: 'category',
  difficulty: 'difficulty',
  xpreward: 'xpReward',
  emoji: 'emoji',
  imageurl: 'imageUrl',
  question: 'question',
  questionassisted: 'questionAssisted',
  optiona: 'optionA',
  optionb: 'optionB',
  optionc: 'optionC',
  optiond: 'optionD',
  optionaassisted: 'optionAAssisted',
  optionbassisted: 'optionBAssisted',
  optioncassisted: 'optionCAssisted',
  optiondassisted: 'optionDAssisted',
  correctoptionid: 'correctOptionId',
  explanation: 'explanation',
  explanationassisted: 'explanationAssisted',
  skillid: 'skillId',
  status: 'status',
  hint: 'hint',
};

export function buildIdx(headers: string[]): Map<string, number> {
  const idx = new Map<string, number>();
  headers.forEach((h, i) => {
    const key = HEADER_MAP[norm(h.trim())];
    if (key) idx.set(key, i);
  });
  return idx;
}
