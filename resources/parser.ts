import * as chrono from 'chrono-node';

export type ParsedTask = {
  title: string;
  datetimeISO: string;
};

export function parseInputToTask(text: string): ParsedTask | null {
  const results = chrono.pt.parse(text);

  if (results.length === 0) return null;

  const result = results[0];
  const datetime = result.date();
  const title = text.replace(result.text, '').trim();

  return {
    title: title || 'Tarefa',
    datetimeISO: datetime.toISOString(),
  };
}
