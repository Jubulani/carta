const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/bootstrap.ts',
    output: {
        filename: 'bootstrap.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: "ts-loader" },
            {
                test: /\.wasm$/,
                type: "webassembly/experimental"
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: 'html', to: '' },
            { from: 'css', to: '' },
        ]),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm']
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true
    }
};