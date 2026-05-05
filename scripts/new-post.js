#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
if (!name) {
	console.error('Usage: pnpm new-post <name>');
	process.exit(1);
}

const now = new Date();
const published = now.toISOString().slice(0, 19);

const dir = resolve('src/posts');
const file = join(dir, `${name}.md`);

if (existsSync(file)) {
	console.error(`Already exists: ${file}`);
	process.exit(1);
}

mkdirSync(dir, { recursive: true });

const content = `---
title: ${JSON.stringify(name)}
image: ""
published: ${published}
pinned: false
description: ""
toc: true
tags: []
draft: false
---
`;

writeFileSync(file, content, 'utf8');
console.log(`Created: ${file}`);
