import * as monaco from '../node_modules/monaco-editor/esm/vs/editor/editor.api';

// Unfortunately, we can't call setMonarchTokensProvider from typescript, as the function type
// just doesn't recognise many of the options we must pass in the second parameter.  Therefore, we
// call it from javascript.
export function init_monarch() {
    monaco.languages.register({ id: 'carta' });

    // See editor playground at https://microsoft.github.io/monaco-editor/monarch.html
    monaco.languages.setMonarchTokensProvider('carta', {
        keywords: [
            'struct'
        ],

        typeKeywords: [
            'int8', 'int16_be', 'int16_le', 'int32_be', 'int32_le', 'int64_be', 'int64_le',
            'uint8', 'uint16_be', 'uint16_le', 'uint32_be', 'uint32_le', 'uint64_be', 'uint64_le',
            'f32_be', 'f32_le', 'f64_be', 'f64_le',
            'ascii'
        ],

        operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
            '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
            '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
            '%=', '<<=', '>>=', '>>>='
        ],

        // we include these common regular expressions
        symbols: /[=><!,;~?:&|+\-*\/\^%]+/,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                // identifiers and keywords
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@typeKeywords': 'keyword',
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely

                // whitespace
                { include: '@whitespace' },

                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],

                // numbers
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'],    // nested comment
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ],
        }
    });
}