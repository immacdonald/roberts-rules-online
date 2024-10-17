import phantomConfig from 'phantom-config/eslint';

export default [
    ...phantomConfig,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
