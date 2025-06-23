export async function extractTitle(originalText: string, excludeText: string): Promise<string> {
  const cleaned = originalText.replace(excludeText, '').trim().replace(/\s+/g, ' ');
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capitalized || 'Tarefa';
}
