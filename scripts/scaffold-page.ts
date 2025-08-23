#!/usr/bin/env node
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ScaffoldOptions {
  name: string;
  route: string;
  title?: string;
  desc?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

function parseArgs(args: string[]): ScaffoldOptions | null {
  // If legacy usage (single argument), fall back to old behavior
  if (args.length === 1 && !args[0].startsWith('--')) {
    return {
      name: args[0],
      route: `/${args[0].toLowerCase()}`,
      title: `${args[0]} Page`,
    };
  }

  const options: Partial<ScaffoldOptions> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    if (arg === '--name' && nextArg) {
      options.name = nextArg;
      i++;
    } else if (arg === '--route' && nextArg) {
      options.route = nextArg;
      i++;
    } else if (arg === '--title' && nextArg) {
      options.title = nextArg;
      i++;
    } else if (arg === '--desc' && nextArg) {
      options.desc = nextArg;
      i++;
    } else if (arg === '--primaryCta' && nextArg) {
      options.primaryCta = nextArg;
      i++;
    } else if (arg === '--secondaryCta' && nextArg) {
      options.secondaryCta = nextArg;
      i++;
    }
  }

  if (!options.name || !options.route) {
    console.error('Usage: npm run scaffold:page -- --name "PageName" --route "/route" [--title "Title"] [--desc "Description"] [--primaryCta "CTA"] [--secondaryCta "CTA"]');
    console.error('Or legacy: npm run scaffold:page -- PageName');
    return null;
  }

  // Set defaults
  if (!options.title) options.title = options.name;

  return options as ScaffoldOptions;
}

function getComponentName(route: string): string {
  // Convert route like "/about-us" to "AboutUs"
  return route
    .replace(/^\//, '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function getRouteFile(route: string): string {
  // Convert route like "/about-us" to "about-us"
  return route.replace(/^\//, '');
}

function generatePageTemplate(options: ScaffoldOptions): string {
  const componentName = getComponentName(options.route);
  
  const ctaButtons: string[] = [];
  if (options.primaryCta) {
    ctaButtons.push(`        <Button className="mr-3">${options.primaryCta}</Button>`);
  }
  if (options.secondaryCta) {
    ctaButtons.push(`        <Button variant="outline">${options.secondaryCta}</Button>`);
  }

  return `import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';${ctaButtons.length > 0 ? '\nimport { Button } from \'../src/ui/Button\';' : ''}
import { SEO } from '../src/ui/SEO';

export default function ${componentName}() {
  return (
    <SiteLayout>
      <SEO 
        title="${options.title}"${options.desc ? `\n        description="${options.desc}"` : ''}
      />
      <Section>
        <Heading level={1}>${options.title}</Heading>
        <p className="mt-4">Content TBD.</p>
${ctaButtons.length > 0 ? `        <div className="mt-6">
${ctaButtons.join('\n')}
        </div>` : ''}
      </Section>
    </SiteLayout>
  );
}`;
}

function generateJestTest(options: ScaffoldOptions): string {
  const componentName = getComponentName(options.route);
  const routeFile = getRouteFile(options.route);
  
  return `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from '../pages/${routeFile}';

describe('${componentName}', () => {
  test('renders page title', () => {
    render(<${componentName} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('${options.title}');
  });

${options.primaryCta ? `  test('renders primary CTA', () => {
    render(<${componentName} />);
    expect(screen.getByRole('button', { name: '${options.primaryCta}' })).toBeInTheDocument();
  });` : ''}
});`;
}

function generatePlaywrightTest(options: ScaffoldOptions): string {
  const routeFile = getRouteFile(options.route);
  
  return `import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(\`\${name} visual snapshot\`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('${options.route}');
    
    await expect(page).toHaveScreenshot(\`${routeFile}-\${name}.png\`);
  });
});`;
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (!options) {
    process.exit(1);
  }

  const routeFile = getRouteFile(options.route);
  const pageFile = join('pages', `${routeFile}.tsx`);
  const testFile = join('__tests__', `${routeFile}.test.tsx`);
  const visualTestFile = join('tests', 'visual', `${routeFile}.spec.ts`);

  // Check if files exist
  if (existsSync(pageFile)) {
    console.error(`File exists: ${pageFile}`);
    process.exit(1);
  }

  try {
    // Generate files
    writeFileSync(pageFile, generatePageTemplate(options));
    writeFileSync(testFile, generateJestTest(options));
    writeFileSync(visualTestFile, generatePlaywrightTest(options));

    console.log(`Created ${pageFile}`);
    console.log(`Created ${testFile}`);
    console.log(`Created ${visualTestFile}`);
    console.log(`\\nOptionally add link in LandingHeader.tsx (nav is currently hardcoded).`);
  } catch (error) {
    console.error('Error creating files:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}