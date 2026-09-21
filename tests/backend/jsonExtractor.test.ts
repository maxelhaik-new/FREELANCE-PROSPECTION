import { describe, it, expect } from 'vitest';
import { extractJsonFromText } from '../../server/utils/jsonExtractor';

describe('Backend Utility - jsonExtractor', () => {
  it('should return fallback when rawText is empty or invalid', () => {
    expect(extractJsonFromText('', { fallback: true })).toEqual({ fallback: true });
    expect(extractJsonFromText(null as any, [])).toEqual([]);
    expect(extractJsonFromText('invalid raw non json string', { error: true })).toEqual({ error: true });
  });

  it('should parse direct raw JSON strings', () => {
    const raw = '{"name": "Boulangerie", "rating": 4.5}';
    const result = extractJsonFromText(raw, {});
    expect(result).toEqual({ name: 'Boulangerie', rating: 4.5 });
  });

  it('should extract JSON from markdown codeblock ```json ... ```', () => {
    const raw = `
Voici le résultat analysé :
\`\`\`json
{
  "subject": "Partenariat local",
  "body": "Bonjour, je vous contacte..."
}
\`\`\`
En espérant que cela vous convienne.
    `;
    const result = extractJsonFromText(raw, {});
    expect(result).toEqual({
      subject: 'Partenariat local',
      body: 'Bonjour, je vous contacte...',
    });
  });

  it('should extract JSON from markdown codeblock without language specifier ``` ... ```', () => {
    const raw = '```\n[{"id": "1"}, {"id": "2"}]\n```';
    const result = extractJsonFromText(raw, []);
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('should extract JSON array embedded in conversational text without codeblocks', () => {
    const raw = 'Bien sûr, voici la liste : [{"id": "p1", "name": "Coiffeur"}] À bientôt !';
    const result = extractJsonFromText(raw, []);
    expect(result).toEqual([{ id: 'p1', name: 'Coiffeur' }]);
  });

  it('should extract JSON object embedded in conversational text without codeblocks', () => {
    const raw = 'Analyse : {"score": 95, "status": "ok"} fin du rapport';
    const result = extractJsonFromText(raw, {});
    expect(result).toEqual({ score: 95, status: 'ok' });
  });
});
