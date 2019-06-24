# carta

Carta is a binary data explorer and visualiser.  Create a schema to explore the structure of binary data.

Runs 100% in the browser, written in Rust, Webassemby and Typescript.  Try it [here](https://jubulani.github.io/)

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=Jubulani/carta)](https://dependabot.com)

![screenshot](screenshot.png)

## Build instructions
1. Clone the repo
2. Install a newish version of *stable* rust (v1.31+)

`curl https://sh.rustup.rs -sSf | sh `

3. Configure current shell to run rust

`source $HOME/.cargo/env `

4. Clone the https://github.com/Jubulani/carta-schema repo into a sibling folder

5. Install dependencies

`npm install`

## To run the dev version (including watching for changes in `.ts` and `.rs` files)
`npm run dev`

:tada:
