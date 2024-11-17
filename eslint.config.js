import path from 'path';
import { fileURLToPath } from 'url';
import phantomConfig from 'phantom-config/eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    ...phantomConfig,
    {
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.app.json', './tsconfig.node.json'],
                tsconfigRootDir: __dirname
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off'
        }
    }
];
