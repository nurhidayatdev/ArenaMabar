import fs from 'fs';
import path from 'path';

let newFile = fs.readFileSync(path.join(process.cwd(), 'src/i18n.ts'), 'utf8');
newFile = newFile.replace(/kebenarannya!\n\nLanjutkan/g, 'kebenarannya!\\n\\nLanjutkan');
newFile = newFile.replace(/paying.\n\nContinue/g, 'paying.\\n\\nContinue');
fs.writeFileSync(path.join(process.cwd(), 'src/i18n.ts'), newFile, 'utf8');
