module.exports = {
    env: {
        browser: false,
        node: true,
        es2022: true,
    },
    extends: [
        'eslint-config-airbnb-base'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    settings: {
        'import/resolver': {
            'typescript': {}
        }
    },
    rules: {
        "import/extensions": [
            'error',
            'ignorePackages',
            {
                js: 'never',
                ts: 'never',
            }
        ],
        "import/prefer-default-export": 'off',
        'max-len': [
            'error',
            {
                code: 150,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
            }
        ],
        'prefer-destructuring': 'off',
        'no-await-in-loop': "off",
        'no-plusplus': "off",
        'no-continue': "off",
        'no-underscore-dangle': "off",
        'no-unused-vars': 'off',
        "@typescript-eslint/no-unused-vars": ["error"],
        'no-shadow': 'off',
        "@typescript-eslint/no-shadow": ["error"]
    }
}
