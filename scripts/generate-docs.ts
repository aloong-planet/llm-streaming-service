import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../src/lib/swagger';

const docsDir = path.join(__dirname, '..', 'docs');
const apiDocsPath = path.join(docsDir, 'api-docs.json');

// Create docs directory if it doesn't exist
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Write OpenAPI spec to file
fs.writeFileSync(apiDocsPath, JSON.stringify(swaggerSpec, null, 2));
