# carta

Reverse engineer binary files

## Build instructions
1. Clone the repo
2. Install a newish version of *stable* rust (v1.31+)

`curl https://sh.rustup.rs -sSf | sh `

3. Configure current shell to run rust

`source $HOME/.cargo/env `

4. Install `wasm-pack` by visiting the following URL:

`https://rustwasm.github.io/wasm-pack/installer/`

5. Run `wasm-pack` to build the wasm file

`wasm-pack build ./wasm`

6. Install dependencies

`npm install`

## To run the dev version (including watching for changes in `.ts` files)
`npm run dev`

:tada:
