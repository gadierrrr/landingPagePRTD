#!/usr/bin/env bash
set -e
NAME_RAW="$1"
if [ -z "$NAME_RAW" ]; then
  echo "Usage: npm run scaffold:page -- <PageName>"; exit 1;
fi
FILE="pages/${NAME_RAW}.tsx"
if [ -f "$FILE" ]; then
  echo "File exists: $FILE"; exit 1;
fi
cat > "$FILE" <<EOF
import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';

export default function ${NAME_RAW}() {
  return (
    <SiteLayout>
      <Section>
        <Heading level={1}>${NAME_RAW} Page</Heading>
        <p className="mt-4">Content TBD.</p>
      </Section>
    </SiteLayout>
  );
}
EOF
echo "Created $FILE";
