const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: './src/bootstrap.ts',
    output: {
        filename: 'bootstrap.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: 'ts-loader' },
            {
                test: /\.wasm$/,
                type: 'webassembly/experimental'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new CopyPlugin([
            { from: 'html', to: '' },
            { from: 'css', to: '' },
        ]),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, 'wasm'),
        }),
        new MonacoWebpackPlugin({
            languages: ['rust'],
            features: ['bracketMatching'],
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm']
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true
    }
};