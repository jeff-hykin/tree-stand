import uint8ArrayForTreeSitterWasm from "./tree_sitter.wasm.binaryified.js" // this will be relative to ../generated/
import { dirname, normalize } from "https://deno.land/x/good@1.13.1.0/support/posix.js"

// necessary for wasm to be loaded without network or FS
var Module = {
    wasmBinary: uint8ArrayForTreeSitterWasm,
    locateFile: (path)=>{
        if (path == "tree-sitter.wasm") {
            return "\nintentionally invalid path"
        }
    },
}
const __dirname = new URL(import.meta.url).pathname
const nodeShims = {
    fs: {
        
    },
    path: {
        sep: "/",
        dirname: dirname,
        normalize: normalize,
    },
}
var require = (packagePath)=>{
    if (packagePath.includes("fs/promises")) {
        return nodeShims.fs.promises
    }
    if (packagePath.includes("path")) {
        return nodeShims.path
    }
    if (packagePath == "fs") {
        return nodeShims.fs
    }
}
if (globalThis?.Deno?.readFile) {
    nodeShims.fs.readFileSync = globalThis.Deno.readFileSync
    nodeShims.fs.readFile = (filename, binary, onload) => {
        Deno.readFile(filename).then((data)=>{
            onload(undefined, data)
        }).catch((err)=>{
            onload(err, undefined)
        })
    }
    nodeShims.fs.promises = globalThis.Deno
}