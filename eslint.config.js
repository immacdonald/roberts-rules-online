import phantomConfig from 'phantom-config/eslint';

export default [
    ...phantomConfig,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/no-static-element-interactions': 'warn'
        }
    }
];
