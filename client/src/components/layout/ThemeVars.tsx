import { getResolvedContent } from '@/lib/cms-resolve';

const HEADING_STACKS: Record<string, string> = {
  Lora: 'var(--font-lora), Georgia, "Times New Roman", serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  'Playfair Display': '"Playfair Display", Georgia, serif',
};

const BODY_STACKS: Record<string, string> = {
  'Source Sans 3': 'var(--font-source-sans), system-ui, -apple-system, "Segoe UI", sans-serif',
  Inter: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  'system-ui': 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

export async function ThemeVars() {
  const { settings } = await getResolvedContent();
  const heading = HEADING_STACKS[settings.headingFont] || HEADING_STACKS.Lora;
  const body = BODY_STACKS[settings.bodyFont] || BODY_STACKS['Source Sans 3'];

  const css = `
:root {
  --lw-primary: ${settings.primaryColor};
  --lw-accent: ${settings.accentColor};
  --color-brand-primary: ${settings.primaryColor};
  --color-brand-accent: ${settings.accentColor};
  --font-heading: ${heading};
  --font-body: ${body};
}
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
