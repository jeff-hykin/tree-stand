To get/update the code in this file, here's what was done:

1. clone tree-sitter git repo
2. get it setup

```sh
# fix some rust bugs on macos
if [ "$(uname)" = "Darwin" ] 
then
    export RUSTFLAGS='-L /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib'
    export PATH="/usr/bin/:$PATH"
fi
# have cargo/rustc version 1.82 (or higher probably)
cargo build 
cargo xtask build-wasm
```

3. copy the wasm file out of `lib/binding_web/tree-sitter.wasm`
4. copy the js file out of `lib/binding_web/binding.js`
    - replace `\nclass ` with `\nexport class ` to make it valid esm
5. open up `lib/binding_web/tree-sitter.js`
    - find the (indented) section that looks like this:
    ```js
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = "./this.program"; 
    
    /* a BUNCH OF CODE */
    
    var shouldRunNow = true
    if (Module["noInitialRun"]) shouldRunNow = false
    run()
    ```
    - copy all of it and put it in the `external_wasm_interface.js` file
    - NOTE: this file must be in-sync with the generated `tree-sitter.wasm` file (the tree-sitter.js file is also a generated file)
6. finally the `custom_postfix.js` is based on the  `lib/binding_web/prefix.js` and  `lib/binding_web/suffix.js` files<br>NOTE: the modifications are:
    - change `writable: false,` to `writable: true,`
    - the rest of the changes should be obvious:
        - add `export ` in front of `class Parser`
        - add `export default Parser` add the bottom
    - some (not-necessary) simplifification of the `init` function
        - remove `Module.onRuntimeInitialized`
        - remove `initPromise`