var moduleOverrides = Object.assign({}, Module)
var arguments_ = []
var thisProgram = "./this.program"
var quit_ = (status, toThrow) => {
    throw toThrow
}
var ENVIRONMENT_IS_WEB = typeof window == "object"
var ENVIRONMENT_IS_WORKER = typeof importScripts == "function"
var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string"
var scriptDirectory = ""
function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}
var read_, readAsync, readBinary
if (ENVIRONMENT_IS_NODE) {
    var fs = require("fs")
    var nodePath = require("path")
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = nodePath.dirname(scriptDirectory) + "/"
    } else {
        scriptDirectory = __dirname + "/"
    }
    read_ = (filename, binary) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename)
        return fs.readFileSync(filename, binary ? undefined : "utf8")
    }
    readBinary = (filename) => {
        var ret = read_(filename, true)
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        return ret
    }
    readAsync = (filename, onload, onerror, binary = true) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename)
        fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
            if (err) onerror(err)
            else onload(binary ? data.buffer : data)
        })
    }
    if (!Module["thisProgram"] && process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, "/")
    }
    arguments_ = process.argv.slice(2)
    if (typeof module != "undefined") {
        module["exports"] = Module
    }
    quit_ = (status, toThrow) => {
        process.exitCode = status
        throw toThrow
    }
    Module["inspect"] = () => "[Emscripten Module object]"
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    {
        read_ = (url) => {
            var xhr = new XMLHttpRequest()
            xhr.open("GET", url, false)
            xhr.send(null)
            return xhr.responseText
        }
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
                var xhr = new XMLHttpRequest()
                xhr.open("GET", url, false)
                xhr.responseType = "arraybuffer"
                xhr.send(null)
                return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response))
            }
        }
        readAsync = (url, onload, onerror) => {
            var xhr = new XMLHttpRequest()
            xhr.open("GET", url, true)
            xhr.responseType = "arraybuffer"
            xhr.onload = () => {
                if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                    onload(xhr.response)
                    return
                }
                onerror()
            }
            xhr.onerror = onerror
            xhr.send(null)
        }
    }
} else {
}
var out = Module["print"] || console.log.bind(console)
var err = Module["printErr"] || console.error.bind(console)
Object.assign(Module, moduleOverrides)
moduleOverrides = null
if (Module["arguments"]) arguments_ = Module["arguments"]
if (Module["thisProgram"]) thisProgram = Module["thisProgram"]
if (Module["quit"]) quit_ = Module["quit"]
var dynamicLibraries = Module["dynamicLibraries"] || []
var wasmBinary
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"]
if (typeof WebAssembly != "object") {
    abort("no native wasm support detected")
}
var wasmMemory
var ABORT = false
var EXITSTATUS
/** @type {function(*, string=)} */ function assert(condition, text) {
    if (!condition) {
        abort(text)
    }
}
var /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /** @type {!Float64Array} */ HEAPF64
var HEAP_DATA_VIEW
function updateMemoryViews() {
    var b = wasmMemory.buffer
    Module["HEAP_DATA_VIEW"] = HEAP_DATA_VIEW = new DataView(b)
    Module["HEAP8"] = HEAP8 = new Int8Array(b)
    Module["HEAP16"] = HEAP16 = new Int16Array(b)
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(b)
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(b)
    Module["HEAP32"] = HEAP32 = new Int32Array(b)
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(b)
    Module["HEAPF32"] = HEAPF32 = new Float32Array(b)
    Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
}
var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432
if (Module["wasmMemory"]) {
    wasmMemory = Module["wasmMemory"]
} else {
    wasmMemory = new WebAssembly.Memory({
        initial: INITIAL_MEMORY / 65536,
        maximum: 2147483648 / 65536,
    })
}
updateMemoryViews()
INITIAL_MEMORY = wasmMemory.buffer.byteLength
var __ATPRERUN__ = []
var __ATINIT__ = []
var __ATMAIN__ = []
var __ATPOSTRUN__ = []
var __RELOC_FUNCS__ = []
var runtimeInitialized = false
function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]]
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}
function initRuntime() {
    runtimeInitialized = true
    callRuntimeCallbacks(__RELOC_FUNCS__)
    callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}
function postRun() {
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]]
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}
function addOnInit(cb) {
    __ATINIT__.unshift(cb)
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
var runDependencies = 0
var runDependencyWatcher = null
var dependenciesFulfilled = null
function getUniqueRunDependency(id) {
    return id
}
function addRunDependency(id) {
    runDependencies++
    Module["monitorRunDependencies"]?.(runDependencies)
}
function removeRunDependency(id) {
    runDependencies--
    Module["monitorRunDependencies"]?.(runDependencies)
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher)
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled
            dependenciesFulfilled = null
            callback()
        }
    }
}
/** @param {string|number=} what */ function abort(what) {
    Module["onAbort"]?.(what)
    what = "Aborted(" + what + ")"
    err(what)
    ABORT = true
    EXITSTATUS = 1
    what += ". Build with -sASSERTIONS for more info."
    /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what)
    throw e
}
var dataURIPrefix = "data:application/octet-stream;base64,"
/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = (filename) => filename.startsWith(dataURIPrefix)
/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = (filename) => filename.startsWith("file://")
var wasmBinaryFile
wasmBinaryFile = "tree-sitter.wasm"
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}
function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary)
    }
    if (readBinary) {
        return readBinary(file)
    }
    throw "both async and sync fetching of the wasm failed"
}
function getBinaryPromise(binaryFile) {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function" && !isFileURI(binaryFile)) {
            return fetch(binaryFile, {
                credentials: "same-origin",
            })
                .then((response) => {
                    if (!response["ok"]) {
                        throw "failed to load wasm binary file at '" + binaryFile + "'"
                    }
                    return response["arrayBuffer"]()
                })
                .catch(() => getBinarySync(binaryFile))
        } else if (readAsync) {
            return new Promise((resolve, reject) => {
                readAsync(binaryFile, (response) => resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response))), reject)
            })
        }
    }
    return Promise.resolve().then(() => getBinarySync(binaryFile))
}
function instantiateArrayBuffer(binaryFile, imports, receiver) {
    return getBinaryPromise(binaryFile)
        .then((binary) => WebAssembly.instantiate(binary, imports))
        .then((instance) => instance)
        .then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`)
            abort(reason)
        })
}
function instantiateAsync(binary, binaryFile, imports, callback) {
    if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
        return fetch(binaryFile, {
            credentials: "same-origin",
        }).then((response) => {
            /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports)
            return result.then(callback, function (reason) {
                err(`wasm streaming compile failed: ${reason}`)
                err("falling back to ArrayBuffer instantiation")
                return instantiateArrayBuffer(binaryFile, imports, callback)
            })
        })
    }
    return instantiateArrayBuffer(binaryFile, imports, callback)
}
function createWasm() {
    var info = {
        env: wasmImports,
        wasi_snapshot_preview1: wasmImports,
        "GOT.mem": new Proxy(wasmImports, GOTHandler),
        "GOT.func": new Proxy(wasmImports, GOTHandler),
    }
    /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
        wasmExports = instance.exports
        wasmExports = relocateExports(wasmExports, 1024)
        var metadata = getDylinkMetadata(module)
        if (metadata.neededDynlibs) {
            dynamicLibraries = metadata.neededDynlibs.concat(dynamicLibraries)
        }
        mergeLibSymbols(wasmExports, "main")
        LDSO.init()
        loadDylibs()
        addOnInit(wasmExports["__wasm_call_ctors"])
        __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"])
        removeRunDependency("wasm-instantiate")
        return wasmExports
    }
    addRunDependency("wasm-instantiate")
    function receiveInstantiationResult(result) {
        receiveInstance(result["instance"], result["module"])
    }
    if (Module["instantiateWasm"]) {
        try {
            return Module["instantiateWasm"](info, receiveInstance)
        } catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`)
            return false
        }
    }
    instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult)
    return {}
}
var ASM_CONSTS = {}
/** @constructor */ function ExitStatus(status) {
    this.name = "ExitStatus"
    this.message = `Program terminated with exit(${status})`
    this.status = status
}
var GOT = {}
var currentModuleWeakSymbols = new Set([])
var GOTHandler = {
    get(obj, symName) {
        var rtn = GOT[symName]
        if (!rtn) {
            rtn = GOT[symName] = new WebAssembly.Global({
                value: "i32",
                mutable: true,
            })
        }
        if (!currentModuleWeakSymbols.has(symName)) {
            rtn.required = true
        }
        return rtn
    },
}
var LE_HEAP_LOAD_F32 = (byteOffset) => HEAP_DATA_VIEW.getFloat32(byteOffset, true)
var LE_HEAP_LOAD_F64 = (byteOffset) => HEAP_DATA_VIEW.getFloat64(byteOffset, true)
var LE_HEAP_LOAD_I16 = (byteOffset) => HEAP_DATA_VIEW.getInt16(byteOffset, true)
var LE_HEAP_LOAD_I32 = (byteOffset) => HEAP_DATA_VIEW.getInt32(byteOffset, true)
var LE_HEAP_LOAD_U32 = (byteOffset) => HEAP_DATA_VIEW.getUint32(byteOffset, true)
var LE_HEAP_STORE_F32 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat32(byteOffset, value, true)
var LE_HEAP_STORE_F64 = (byteOffset, value) => HEAP_DATA_VIEW.setFloat64(byteOffset, value, true)
var LE_HEAP_STORE_I16 = (byteOffset, value) => HEAP_DATA_VIEW.setInt16(byteOffset, value, true)
var LE_HEAP_STORE_I32 = (byteOffset, value) => HEAP_DATA_VIEW.setInt32(byteOffset, value, true)
var LE_HEAP_STORE_U32 = (byteOffset, value) => HEAP_DATA_VIEW.setUint32(byteOffset, value, true)
var callRuntimeCallbacks = (callbacks) => {
    while (callbacks.length > 0) {
        callbacks.shift()(Module)
    }
}
var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined
/**
 * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
 * array that contains uint8 values, returns a copy of that string as a
 * Javascript String object.
 * heapOrArray is either a regular array, or a JavaScript typed array view.
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
    var endIdx = idx + maxBytesToRead
    var endPtr = idx
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
    }
    var str = ""
    while (idx < endPtr) {
        var u0 = heapOrArray[idx++]
        if (!(u0 & 128)) {
            str += String.fromCharCode(u0)
            continue
        }
        var u1 = heapOrArray[idx++] & 63
        if ((u0 & 224) == 192) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1)
            continue
        }
        var u2 = heapOrArray[idx++] & 63
        if ((u0 & 240) == 224) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
        } else {
            u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63)
        }
        if (u0 < 65536) {
            str += String.fromCharCode(u0)
        } else {
            var ch = u0 - 65536
            str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
        }
    }
    return str
}
var getDylinkMetadata = (binary) => {
    var offset = 0
    var end = 0
    function getU8() {
        return binary[offset++]
    }
    function getLEB() {
        var ret = 0
        var mul = 1
        while (1) {
            var byte = binary[offset++]
            ret += (byte & 127) * mul
            mul *= 128
            if (!(byte & 128)) break
        }
        return ret
    }
    function getString() {
        var len = getLEB()
        offset += len
        return UTF8ArrayToString(binary, offset - len, len)
    }
    /** @param {string=} message */ function failIf(condition, message) {
        if (condition) throw new Error(message)
    }
    var name = "dylink.0"
    if (binary instanceof WebAssembly.Module) {
        var dylinkSection = WebAssembly.Module.customSections(binary, name)
        if (dylinkSection.length === 0) {
            name = "dylink"
            dylinkSection = WebAssembly.Module.customSections(binary, name)
        }
        failIf(dylinkSection.length === 0, "need dylink section")
        binary = new Uint8Array(dylinkSection[0])
        end = binary.length
    } else {
        var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer)
        var magicNumberFound = int32View[0] == 1836278016 || int32View[0] == 6386541
        failIf(!magicNumberFound, "need to see wasm magic number")
        failIf(binary[8] !== 0, "need the dylink section to be first")
        offset = 9
        var section_size = getLEB()
        end = offset + section_size
        name = getString()
    }
    var customSection = {
        neededDynlibs: [],
        tlsExports: new Set(),
        weakImports: new Set(),
    }
    if (name == "dylink") {
        customSection.memorySize = getLEB()
        customSection.memoryAlign = getLEB()
        customSection.tableSize = getLEB()
        customSection.tableAlign = getLEB()
        var neededDynlibsCount = getLEB()
        for (var i = 0; i < neededDynlibsCount; ++i) {
            var libname = getString()
            customSection.neededDynlibs.push(libname)
        }
    } else {
        failIf(name !== "dylink.0")
        var WASM_DYLINK_MEM_INFO = 1
        var WASM_DYLINK_NEEDED = 2
        var WASM_DYLINK_EXPORT_INFO = 3
        var WASM_DYLINK_IMPORT_INFO = 4
        var WASM_SYMBOL_TLS = 256
        var WASM_SYMBOL_BINDING_MASK = 3
        var WASM_SYMBOL_BINDING_WEAK = 1
        while (offset < end) {
            var subsectionType = getU8()
            var subsectionSize = getLEB()
            if (subsectionType === WASM_DYLINK_MEM_INFO) {
                customSection.memorySize = getLEB()
                customSection.memoryAlign = getLEB()
                customSection.tableSize = getLEB()
                customSection.tableAlign = getLEB()
            } else if (subsectionType === WASM_DYLINK_NEEDED) {
                var neededDynlibsCount = getLEB()
                for (var i = 0; i < neededDynlibsCount; ++i) {
                    libname = getString()
                    customSection.neededDynlibs.push(libname)
                }
            } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
                var count = getLEB()
                while (count--) {
                    var symname = getString()
                    var flags = getLEB()
                    if (flags & WASM_SYMBOL_TLS) {
                        customSection.tlsExports.add(symname)
                    }
                }
            } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
                var count = getLEB()
                while (count--) {
                    var modname = getString()
                    var symname = getString()
                    var flags = getLEB()
                    if ((flags & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                        customSection.weakImports.add(symname)
                    }
                }
            } else {
                offset += subsectionSize
            }
        }
    }
    return customSection
}
/**
 * @param {number} ptr
 * @param {string} type
 */ function getValue(ptr, type = "i8") {
    if (type.endsWith("*")) type = "*"
    switch (type) {
        case "i1":
            return HEAP8[ptr >> 0]

        case "i8":
            return HEAP8[ptr >> 0]

        case "i16":
            return LE_HEAP_LOAD_I16((ptr >> 1) * 2)

        case "i32":
            return LE_HEAP_LOAD_I32((ptr >> 2) * 4)

        case "i64":
            abort("to do getValue(i64) use WASM_BIGINT")

        case "float":
            return LE_HEAP_LOAD_F32((ptr >> 2) * 4)

        case "double":
            return LE_HEAP_LOAD_F64((ptr >> 3) * 8)

        case "*":
            return LE_HEAP_LOAD_U32((ptr >> 2) * 4)

        default:
            abort(`invalid type for getValue: ${type}`)
    }
}
var newDSO = (name, handle, syms) => {
    var dso = {
        refcount: Infinity,
        name: name,
        exports: syms,
        global: true,
    }
    LDSO.loadedLibsByName[name] = dso
    if (handle != undefined) {
        LDSO.loadedLibsByHandle[handle] = dso
    }
    return dso
}
var LDSO = {
    loadedLibsByName: {},
    loadedLibsByHandle: {},
    init() {
        newDSO("__main__", 0, wasmImports)
    },
}
var ___heap_base = 78160
var zeroMemory = (address, size) => {
    HEAPU8.fill(0, address, address + size)
    return address
}
var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment
var getMemory = (size) => {
    if (runtimeInitialized) {
        return zeroMemory(_malloc(size), size)
    }
    var ret = ___heap_base
    var end = ret + alignMemory(size, 16)
    ___heap_base = end
    GOT["__heap_base"].value = end
    return ret
}
var isInternalSym = (symName) => ["__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js"].includes(symName) || symName.startsWith("__em_js__")
var uleb128Encode = (n, target) => {
    if (n < 128) {
        target.push(n)
    } else {
        target.push(n % 128 | 128, n >> 7)
    }
}
var sigToWasmTypes = (sig) => {
    var typeNames = {
        i: "i32",
        j: "i64",
        f: "f32",
        d: "f64",
        e: "externref",
        p: "i32",
    }
    var type = {
        parameters: [],
        results: sig[0] == "v" ? [] : [typeNames[sig[0]]],
    }
    for (var i = 1; i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]])
    }
    return type
}
var generateFuncType = (sig, target) => {
    var sigRet = sig.slice(0, 1)
    var sigParam = sig.slice(1)
    var typeCodes = {
        i: 127,
        p: 127,
        j: 126,
        f: 125,
        d: 124,
        e: 111,
    }
    target.push(96)
    /* form: func */ uleb128Encode(sigParam.length, target)
    for (var i = 0; i < sigParam.length; ++i) {
        target.push(typeCodes[sigParam[i]])
    }
    if (sigRet == "v") {
        target.push(0)
    } else {
        target.push(1, typeCodes[sigRet])
    }
}
var convertJsFunctionToWasm = (func, sig) => {
    if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func)
    }
    var typeSectionBody = [1]
    generateFuncType(sig, typeSectionBody)
    var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1]
    uleb128Encode(typeSectionBody.length, bytes)
    bytes.push.apply(bytes, typeSectionBody)
    bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0)
    var module = new WebAssembly.Module(new Uint8Array(bytes))
    var instance = new WebAssembly.Instance(module, {
        e: {
            f: func,
        },
    })
    var wrappedFunc = instance.exports["f"]
    return wrappedFunc
}
var wasmTableMirror = []
var wasmTable = new WebAssembly.Table({
    initial: 26,
    element: "anyfunc",
})
var getWasmTableEntry = (funcPtr) => {
    var func = wasmTableMirror[funcPtr]
    if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr)
    }
    return func
}
var updateTableMap = (offset, count) => {
    if (functionsInTableMap) {
        for (var i = offset; i < offset + count; i++) {
            var item = getWasmTableEntry(i)
            if (item) {
                functionsInTableMap.set(item, i)
            }
        }
    }
}
var functionsInTableMap
var getFunctionAddress = (func) => {
    if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap()
        updateTableMap(0, wasmTable.length)
    }
    return functionsInTableMap.get(func) || 0
}
var freeTableIndexes = []
var getEmptyTableSlot = () => {
    if (freeTableIndexes.length) {
        return freeTableIndexes.pop()
    }
    try {
        wasmTable.grow(1)
    } catch (err) {
        if (!(err instanceof RangeError)) {
            throw err
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH."
    }
    return wasmTable.length - 1
}
var setWasmTableEntry = (idx, func) => {
    wasmTable.set(idx, func)
    wasmTableMirror[idx] = wasmTable.get(idx)
}
/** @param {string=} sig */ var addFunction = (func, sig) => {
    var rtn = getFunctionAddress(func)
    if (rtn) {
        return rtn
    }
    var ret = getEmptyTableSlot()
    try {
        setWasmTableEntry(ret, func)
    } catch (err) {
        if (!(err instanceof TypeError)) {
            throw err
        }
        var wrapped = convertJsFunctionToWasm(func, sig)
        setWasmTableEntry(ret, wrapped)
    }
    functionsInTableMap.set(func, ret)
    return ret
}
var updateGOT = (exports, replace) => {
    for (var symName in exports) {
        if (isInternalSym(symName)) {
            continue
        }
        var value = exports[symName]
        if (symName.startsWith("orig$")) {
            symName = symName.split("$")[1]
            replace = true
        }
        GOT[symName] ||= new WebAssembly.Global({
            value: "i32",
            mutable: true,
        })
        if (replace || GOT[symName].value == 0) {
            if (typeof value == "function") {
                GOT[symName].value = addFunction(value)
            } else if (typeof value == "number") {
                GOT[symName].value = value
            } else {
                err(`unhandled export type for '${symName}': ${typeof value}`)
            }
        }
    }
}
/** @param {boolean=} replace */ var relocateExports = (exports, memoryBase, replace) => {
    var relocated = {}
    for (var e in exports) {
        var value = exports[e]
        if (typeof value == "object") {
            value = value.value
        }
        if (typeof value == "number") {
            value += memoryBase
        }
        relocated[e] = value
    }
    updateGOT(relocated, replace)
    return relocated
}
var isSymbolDefined = (symName) => {
    var existing = wasmImports[symName]
    if (!existing || existing.stub) {
        return false
    }
    return true
}
var dynCallLegacy = (sig, ptr, args) => {
    var f = Module["dynCall_" + sig]
    return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr)
}
/** @param {Object=} args */ var dynCall = (sig, ptr, args) => {
    if (sig.includes("j")) {
        return dynCallLegacy(sig, ptr, args)
    }
    var rtn = getWasmTableEntry(ptr).apply(null, args)
    return rtn
}
var createInvokeFunction = (sig) =>
    function () {
        var sp = stackSave()
        try {
            return dynCall(sig, arguments[0], Array.prototype.slice.call(arguments, 1))
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0) throw e
            _setThrew(1, 0)
        }
    }
var resolveGlobalSymbol = (symName, direct = false) => {
    var sym
    if (direct && "orig$" + symName in wasmImports) {
        symName = "orig$" + symName
    }
    if (isSymbolDefined(symName)) {
        sym = wasmImports[symName]
    } else if (symName.startsWith("invoke_")) {
        sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1])
    }
    return {
        sym: sym,
        name: symName,
    }
}
/**
 * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
 * emscripten HEAP, returns a copy of that string as a Javascript String object.
 *
 * @param {number} ptr
 * @param {number=} maxBytesToRead - An optional length that specifies the
 *   maximum number of bytes to read. You can omit this parameter to scan the
 *   string until the first 0 byte. If maxBytesToRead is passed, and the string
 *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
 *   string will cut short at that byte index (i.e. maxBytesToRead will not
 *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
 *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
 *   JS JIT optimizations off, so it is worth to consider consistently using one
 * @return {string}
 */ var UTF8ToString = (ptr, maxBytesToRead) => (ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "")
/**
 * @param {string=} libName
 * @param {Object=} localScope
 * @param {number=} handle
 */ var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => {
    var metadata = getDylinkMetadata(binary)
    currentModuleWeakSymbols = metadata.weakImports
    function loadModule() {
        var firstLoad = !handle || !HEAP8[(handle + 8) >> 0]
        if (firstLoad) {
            var memAlign = Math.pow(2, metadata.memoryAlign)
            var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0
            var tableBase = metadata.tableSize ? wasmTable.length : 0
            if (handle) {
                HEAP8[(handle + 8) >> 0] = 1
                LE_HEAP_STORE_U32(((handle + 12) >> 2) * 4, memoryBase)
                LE_HEAP_STORE_I32(((handle + 16) >> 2) * 4, metadata.memorySize)
                LE_HEAP_STORE_U32(((handle + 20) >> 2) * 4, tableBase)
                LE_HEAP_STORE_I32(((handle + 24) >> 2) * 4, metadata.tableSize)
            }
        } else {
            memoryBase = LE_HEAP_LOAD_U32(((handle + 12) >> 2) * 4)
            tableBase = LE_HEAP_LOAD_U32(((handle + 20) >> 2) * 4)
        }
        var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length
        if (tableGrowthNeeded > 0) {
            wasmTable.grow(tableGrowthNeeded)
        }
        var moduleExports
        function resolveSymbol(sym) {
            var resolved = resolveGlobalSymbol(sym).sym
            if (!resolved && localScope) {
                resolved = localScope[sym]
            }
            if (!resolved) {
                resolved = moduleExports[sym]
            }
            return resolved
        }
        var proxyHandler = {
            get(stubs, prop) {
                switch (prop) {
                    case "__memory_base":
                        return memoryBase

                    case "__table_base":
                        return tableBase
                }
                if (prop in wasmImports && !wasmImports[prop].stub) {
                    return wasmImports[prop]
                }
                if (!(prop in stubs)) {
                    var resolved
                    stubs[prop] = function () {
                        resolved ||= resolveSymbol(prop)
                        return resolved.apply(null, arguments)
                    }
                }
                return stubs[prop]
            },
        }
        var proxy = new Proxy({}, proxyHandler)
        var info = {
            "GOT.mem": new Proxy({}, GOTHandler),
            "GOT.func": new Proxy({}, GOTHandler),
            env: proxy,
            wasi_snapshot_preview1: proxy,
        }
        function postInstantiation(module, instance) {
            updateTableMap(tableBase, metadata.tableSize)
            moduleExports = relocateExports(instance.exports, memoryBase)
            if (!flags.allowUndefined) {
                reportUndefinedSymbols()
            }
            function addEmAsm(addr, body) {
                var args = []
                var arity = 0
                for (; arity < 16; arity++) {
                    if (body.indexOf("$" + arity) != -1) {
                        args.push("$" + arity)
                    } else {
                        break
                    }
                }
                args = args.join(",")
                var func = `(${args}) => { ${body} };`
                ASM_CONSTS[start] = eval(func)
            }
            if ("__start_em_asm" in moduleExports) {
                var start = moduleExports["__start_em_asm"]
                var stop = moduleExports["__stop_em_asm"]
                while (start < stop) {
                    var jsString = UTF8ToString(start)
                    addEmAsm(start, jsString)
                    start = HEAPU8.indexOf(0, start) + 1
                }
            }
            function addEmJs(name, cSig, body) {
                var jsArgs = []
                cSig = cSig.slice(1, -1)
                if (cSig != "void") {
                    cSig = cSig.split(",")
                    for (var i in cSig) {
                        var jsArg = cSig[i].split(" ").pop()
                        jsArgs.push(jsArg.replace("*", ""))
                    }
                }
                var func = `(${jsArgs}) => ${body};`
                moduleExports[name] = eval(func)
            }
            for (var name in moduleExports) {
                if (name.startsWith("__em_js__")) {
                    var start = moduleExports[name]
                    var jsString = UTF8ToString(start)
                    var parts = jsString.split("<::>")
                    addEmJs(name.replace("__em_js__", ""), parts[0], parts[1])
                    delete moduleExports[name]
                }
            }
            var applyRelocs = moduleExports["__wasm_apply_data_relocs"]
            if (applyRelocs) {
                if (runtimeInitialized) {
                    applyRelocs()
                } else {
                    __RELOC_FUNCS__.push(applyRelocs)
                }
            }
            var init = moduleExports["__wasm_call_ctors"]
            if (init) {
                if (runtimeInitialized) {
                    init()
                } else {
                    __ATINIT__.push(init)
                }
            }
            return moduleExports
        }
        if (flags.loadAsync) {
            if (binary instanceof WebAssembly.Module) {
                var instance = new WebAssembly.Instance(binary, info)
                return Promise.resolve(postInstantiation(binary, instance))
            }
            return WebAssembly.instantiate(binary, info).then((result) => postInstantiation(result.module, result.instance))
        }
        var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary)
        var instance = new WebAssembly.Instance(module, info)
        return postInstantiation(module, instance)
    }
    if (flags.loadAsync) {
        return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags)), Promise.resolve()).then(loadModule)
    }
    metadata.neededDynlibs.forEach((needed) => loadDynamicLibrary(needed, flags, localScope))
    return loadModule()
}
var mergeLibSymbols = (exports, libName) => {
    for (var [sym, exp] of Object.entries(exports)) {
        const setImport = (target) => {
            if (!isSymbolDefined(target)) {
                wasmImports[target] = exp
            }
        }
        setImport(sym)
        const main_alias = "__main_argc_argv"
        if (sym == "main") {
            setImport(main_alias)
        }
        if (sym == main_alias) {
            setImport("main")
        }
        if (sym.startsWith("dynCall_") && !Module.hasOwnProperty(sym)) {
            Module[sym] = exp
        }
    }
}
/** @param {boolean=} noRunDep */ var asyncLoad = (url, onload, onerror, noRunDep) => {
    var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : ""
    readAsync(
        url,
        (arrayBuffer) => {
            assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`)
            onload(new Uint8Array(arrayBuffer))
            if (dep) removeRunDependency(dep)
        },
        (event) => {
            if (onerror) {
                onerror()
            } else {
                throw `Loading data file "${url}" failed.`
            }
        }
    )
    if (dep) addRunDependency(dep)
}
/**
 * @param {number=} handle
 * @param {Object=} localScope
 */ function loadDynamicLibrary(
    libName,
    flags = {
        global: true,
        nodelete: true,
    },
    localScope,
    handle
) {
    var dso = LDSO.loadedLibsByName[libName]
    if (dso) {
        if (!flags.global) {
            if (localScope) {
                Object.assign(localScope, dso.exports)
            }
        } else if (!dso.global) {
            dso.global = true
            mergeLibSymbols(dso.exports, libName)
        }
        if (flags.nodelete && dso.refcount !== Infinity) {
            dso.refcount = Infinity
        }
        dso.refcount++
        if (handle) {
            LDSO.loadedLibsByHandle[handle] = dso
        }
        return flags.loadAsync ? Promise.resolve(true) : true
    }
    dso = newDSO(libName, handle, "loading")
    dso.refcount = flags.nodelete ? Infinity : 1
    dso.global = flags.global
    function loadLibData() {
        if (handle) {
            var data = LE_HEAP_LOAD_U32(((handle + 28) >> 2) * 4)
            var dataSize = LE_HEAP_LOAD_U32(((handle + 32) >> 2) * 4)
            if (data && dataSize) {
                var libData = HEAP8.slice(data, data + dataSize)
                return flags.loadAsync ? Promise.resolve(libData) : libData
            }
        }
        var libFile = locateFile(libName)
        if (flags.loadAsync) {
            return new Promise(function (resolve, reject) {
                asyncLoad(libFile, (data) => resolve(data), reject)
            })
        }
        if (!readBinary) {
            throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`)
        }
        return readBinary(libFile)
    }
    function getExports() {
        if (flags.loadAsync) {
            return loadLibData().then((libData) => loadWebAssemblyModule(libData, flags, libName, localScope, handle))
        }
        return loadWebAssemblyModule(loadLibData(), flags, libName, localScope, handle)
    }
    function moduleLoaded(exports) {
        if (dso.global) {
            mergeLibSymbols(exports, libName)
        } else if (localScope) {
            Object.assign(localScope, exports)
        }
        dso.exports = exports
    }
    if (flags.loadAsync) {
        return getExports().then((exports) => {
            moduleLoaded(exports)
            return true
        })
    }
    moduleLoaded(getExports())
    return true
}
var reportUndefinedSymbols = () => {
    for (var [symName, entry] of Object.entries(GOT)) {
        if (entry.value == 0) {
            var value = resolveGlobalSymbol(symName, true).sym
            if (!value && !entry.required) {
                continue
            }
            if (typeof value == "function") {
                /** @suppress {checkTypes} */ entry.value = addFunction(value, value.sig)
            } else if (typeof value == "number") {
                entry.value = value
            } else {
                throw new Error(`bad export type for '${symName}': ${typeof value}`)
            }
        }
    }
}
var loadDylibs = () => {
    if (!dynamicLibraries.length) {
        reportUndefinedSymbols()
        return
    }
    addRunDependency("loadDylibs")
    dynamicLibraries
        .reduce(
            (chain, lib) =>
                chain.then(() =>
                    loadDynamicLibrary(lib, {
                        loadAsync: true,
                        global: true,
                        nodelete: true,
                        allowUndefined: true,
                    })
                ),
            Promise.resolve()
        )
        .then(() => {
            reportUndefinedSymbols()
            removeRunDependency("loadDylibs")
        })
}
var noExitRuntime = Module["noExitRuntime"] || true
/**
 * @param {number} ptr
 * @param {number} value
 * @param {string} type
 */ function setValue(ptr, value, type = "i8") {
    if (type.endsWith("*")) type = "*"
    switch (type) {
        case "i1":
            HEAP8[ptr >> 0] = value
            break

        case "i8":
            HEAP8[ptr >> 0] = value
            break

        case "i16":
            LE_HEAP_STORE_I16((ptr >> 1) * 2, value)
            break

        case "i32":
            LE_HEAP_STORE_I32((ptr >> 2) * 4, value)
            break

        case "i64":
            abort("to do setValue(i64) use WASM_BIGINT")

        case "float":
            LE_HEAP_STORE_F32((ptr >> 2) * 4, value)
            break

        case "double":
            LE_HEAP_STORE_F64((ptr >> 3) * 8, value)
            break

        case "*":
            LE_HEAP_STORE_U32((ptr >> 2) * 4, value)
            break

        default:
            abort(`invalid type for setValue: ${type}`)
    }
}
var ___memory_base = new WebAssembly.Global(
    {
        value: "i32",
        mutable: false,
    },
    1024
)
var ___stack_pointer = new WebAssembly.Global(
    {
        value: "i32",
        mutable: true,
    },
    78160
)
var ___table_base = new WebAssembly.Global(
    {
        value: "i32",
        mutable: false,
    },
    1
)
var nowIsMonotonic = 1
var __emscripten_get_now_is_monotonic = () => nowIsMonotonic
__emscripten_get_now_is_monotonic.sig = "i"
var _abort = () => {
    abort("")
}
_abort.sig = "v"
var _emscripten_date_now = () => Date.now()
_emscripten_date_now.sig = "d"
var _emscripten_get_now
_emscripten_get_now = () => performance.now()
_emscripten_get_now.sig = "d"
var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num)
_emscripten_memcpy_js.sig = "vppp"
var getHeapMax = () => 2147483648
var growMemory = (size) => {
    var b = wasmMemory.buffer
    var pages = (size - b.byteLength + 65535) / 65536
    try {
        wasmMemory.grow(pages)
        updateMemoryViews()
        return 1
    } /*success*/ catch (e) {}
}
var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = HEAPU8.length
    requestedSize >>>= 0
    var maxHeapSize = getHeapMax()
    if (requestedSize > maxHeapSize) {
        return false
    }
    var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple)
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296)
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536))
        var replacement = growMemory(newSize)
        if (replacement) {
            return true
        }
    }
    return false
}
_emscripten_resize_heap.sig = "ip"
var SYSCALLS = {
    varargs: undefined,
    get() {
        var ret = LE_HEAP_LOAD_I32((+SYSCALLS.varargs >> 2) * 4)
        SYSCALLS.varargs += 4
        return ret
    },
    getp() {
        return SYSCALLS.get()
    },
    getStr(ptr) {
        var ret = UTF8ToString(ptr)
        return ret
    },
}
var _fd_close = (fd) => 52
_fd_close.sig = "ii"
var convertI32PairToI53Checked = (lo, hi) => ((hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN)
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high)
    return 70
}
_fd_seek.sig = "iiiiip"
var printCharBuffers = [null, [], []]
var printChar = (stream, curr) => {
    var buffer = printCharBuffers[stream]
    if (curr === 0 || curr === 10) {
        ;(stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0))
        buffer.length = 0
    } else {
        buffer.push(curr)
    }
}
var _fd_write = (fd, iov, iovcnt, pnum) => {
    var num = 0
    for (var i = 0; i < iovcnt; i++) {
        var ptr = LE_HEAP_LOAD_U32((iov >> 2) * 4)
        var len = LE_HEAP_LOAD_U32(((iov + 4) >> 2) * 4)
        iov += 8
        for (var j = 0; j < len; j++) {
            printChar(fd, HEAPU8[ptr + j])
        }
        num += len
    }
    LE_HEAP_STORE_U32((pnum >> 2) * 4, num)
    return 0
}
_fd_write.sig = "iippp"
function _tree_sitter_log_callback(isLexMessage, messageAddress) {
    if (currentLogCallback) {
        const message = UTF8ToString(messageAddress)
        currentLogCallback(message, isLexMessage !== 0)
    }
}
function _tree_sitter_parse_callback(inputBufferAddress, index, row, column, lengthAddress) {
    const INPUT_BUFFER_SIZE = 10 * 1024
    const string = currentParseCallback(index, {
        row: row,
        column: column,
    })
    if (typeof string === "string") {
        setValue(lengthAddress, string.length, "i32")
        stringToUTF16(string, inputBufferAddress, INPUT_BUFFER_SIZE)
    } else {
        setValue(lengthAddress, 0, "i32")
    }
}
var runtimeKeepaliveCounter = 0
var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0
var _proc_exit = (code) => {
    EXITSTATUS = code
    if (!keepRuntimeAlive()) {
        Module["onExit"]?.(code)
        ABORT = true
    }
    quit_(code, new ExitStatus(code))
}
_proc_exit.sig = "vi"
/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
    EXITSTATUS = status
    _proc_exit(status)
}
var handleException = (e) => {
    if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS
    }
    quit_(1, e)
}
var lengthBytesUTF8 = (str) => {
    var len = 0
    for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i)
        if (c <= 127) {
            len++
        } else if (c <= 2047) {
            len += 2
        } else if (c >= 55296 && c <= 57343) {
            len += 4
            ++i
        } else {
            len += 3
        }
    }
    return len
}
var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) return 0
    var startIdx = outIdx
    var endIdx = outIdx + maxBytesToWrite - 1
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i)
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break
            heap[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break
            heap[outIdx++] = 192 | (u >> 6)
            heap[outIdx++] = 128 | (u & 63)
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break
            heap[outIdx++] = 224 | (u >> 12)
            heap[outIdx++] = 128 | ((u >> 6) & 63)
            heap[outIdx++] = 128 | (u & 63)
        } else {
            if (outIdx + 3 >= endIdx) break
            heap[outIdx++] = 240 | (u >> 18)
            heap[outIdx++] = 128 | ((u >> 12) & 63)
            heap[outIdx++] = 128 | ((u >> 6) & 63)
            heap[outIdx++] = 128 | (u & 63)
        }
    }
    heap[outIdx] = 0
    return outIdx - startIdx
}
var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
var stringToUTF8OnStack = (str) => {
    var size = lengthBytesUTF8(str) + 1
    var ret = stackAlloc(size)
    stringToUTF8(str, ret, size)
    return ret
}
var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
    maxBytesToWrite ??= 2147483647
    if (maxBytesToWrite < 2) return 0
    maxBytesToWrite -= 2
    var startPtr = outPtr
    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length
    for (var i = 0; i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i)
        LE_HEAP_STORE_I16((outPtr >> 1) * 2, codeUnit)
        outPtr += 2
    }
    LE_HEAP_STORE_I16((outPtr >> 1) * 2, 0)
    return outPtr - startPtr
}
var AsciiToString = (ptr) => {
    var str = ""
    while (1) {
        var ch = HEAPU8[ptr++ >> 0]
        if (!ch) return str
        str += String.fromCharCode(ch)
    }
}
var wasmImports = {
    /** @export */ __heap_base: ___heap_base,
    /** @export */ __indirect_function_table: wasmTable,
    /** @export */ __memory_base: ___memory_base,
    /** @export */ __stack_pointer: ___stack_pointer,
    /** @export */ __table_base: ___table_base,
    /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
    /** @export */ abort: _abort,
    /** @export */ emscripten_get_now: _emscripten_get_now,
    /** @export */ emscripten_memcpy_js: _emscripten_memcpy_js,
    /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */ fd_close: _fd_close,
    /** @export */ fd_seek: _fd_seek,
    /** @export */ fd_write: _fd_write,
    /** @export */ memory: wasmMemory,
    /** @export */ tree_sitter_log_callback: _tree_sitter_log_callback,
    /** @export */ tree_sitter_parse_callback: _tree_sitter_parse_callback,
}
var wasmExports = createWasm()
var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])()
var ___wasm_apply_data_relocs = (Module["___wasm_apply_data_relocs"] = () => (___wasm_apply_data_relocs = Module["___wasm_apply_data_relocs"] = wasmExports["__wasm_apply_data_relocs"])())
var _malloc = (Module["_malloc"] = (a0) => (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0))
var _calloc = (Module["_calloc"] = (a0, a1) => (_calloc = Module["_calloc"] = wasmExports["calloc"])(a0, a1))
var _realloc = (Module["_realloc"] = (a0, a1) => (_realloc = Module["_realloc"] = wasmExports["realloc"])(a0, a1))
var _free = (Module["_free"] = (a0) => (_free = Module["_free"] = wasmExports["free"])(a0))
var _ts_language_symbol_count = (Module["_ts_language_symbol_count"] = (a0) => (_ts_language_symbol_count = Module["_ts_language_symbol_count"] = wasmExports["ts_language_symbol_count"])(a0))
var _ts_language_state_count = (Module["_ts_language_state_count"] = (a0) => (_ts_language_state_count = Module["_ts_language_state_count"] = wasmExports["ts_language_state_count"])(a0))
var _ts_language_version = (Module["_ts_language_version"] = (a0) => (_ts_language_version = Module["_ts_language_version"] = wasmExports["ts_language_version"])(a0))
var _ts_language_field_count = (Module["_ts_language_field_count"] = (a0) => (_ts_language_field_count = Module["_ts_language_field_count"] = wasmExports["ts_language_field_count"])(a0))
var _ts_language_next_state = (Module["_ts_language_next_state"] = (a0, a1, a2) => (_ts_language_next_state = Module["_ts_language_next_state"] = wasmExports["ts_language_next_state"])(a0, a1, a2))
var _ts_language_symbol_name = (Module["_ts_language_symbol_name"] = (a0, a1) => (_ts_language_symbol_name = Module["_ts_language_symbol_name"] = wasmExports["ts_language_symbol_name"])(a0, a1))
var _ts_language_symbol_for_name = (Module["_ts_language_symbol_for_name"] = (a0, a1, a2, a3) => (_ts_language_symbol_for_name = Module["_ts_language_symbol_for_name"] = wasmExports["ts_language_symbol_for_name"])(a0, a1, a2, a3))
var _strncmp = (Module["_strncmp"] = (a0, a1, a2) => (_strncmp = Module["_strncmp"] = wasmExports["strncmp"])(a0, a1, a2))
var _ts_language_symbol_type = (Module["_ts_language_symbol_type"] = (a0, a1) => (_ts_language_symbol_type = Module["_ts_language_symbol_type"] = wasmExports["ts_language_symbol_type"])(a0, a1))
var _ts_language_field_name_for_id = (Module["_ts_language_field_name_for_id"] = (a0, a1) => (_ts_language_field_name_for_id = Module["_ts_language_field_name_for_id"] = wasmExports["ts_language_field_name_for_id"])(a0, a1))
var _ts_lookahead_iterator_new = (Module["_ts_lookahead_iterator_new"] = (a0, a1) => (_ts_lookahead_iterator_new = Module["_ts_lookahead_iterator_new"] = wasmExports["ts_lookahead_iterator_new"])(a0, a1))
var _ts_lookahead_iterator_delete = (Module["_ts_lookahead_iterator_delete"] = (a0) => (_ts_lookahead_iterator_delete = Module["_ts_lookahead_iterator_delete"] = wasmExports["ts_lookahead_iterator_delete"])(a0))
var _ts_lookahead_iterator_reset_state = (Module["_ts_lookahead_iterator_reset_state"] = (a0, a1) => (_ts_lookahead_iterator_reset_state = Module["_ts_lookahead_iterator_reset_state"] = wasmExports["ts_lookahead_iterator_reset_state"])(a0, a1))
var _ts_lookahead_iterator_reset = (Module["_ts_lookahead_iterator_reset"] = (a0, a1, a2) => (_ts_lookahead_iterator_reset = Module["_ts_lookahead_iterator_reset"] = wasmExports["ts_lookahead_iterator_reset"])(a0, a1, a2))
var _ts_lookahead_iterator_next = (Module["_ts_lookahead_iterator_next"] = (a0) => (_ts_lookahead_iterator_next = Module["_ts_lookahead_iterator_next"] = wasmExports["ts_lookahead_iterator_next"])(a0))
var _ts_lookahead_iterator_current_symbol = (Module["_ts_lookahead_iterator_current_symbol"] = (a0) => (_ts_lookahead_iterator_current_symbol = Module["_ts_lookahead_iterator_current_symbol"] = wasmExports["ts_lookahead_iterator_current_symbol"])(a0))
var _memset = (Module["_memset"] = (a0, a1, a2) => (_memset = Module["_memset"] = wasmExports["memset"])(a0, a1, a2))
var _memcpy = (Module["_memcpy"] = (a0, a1, a2) => (_memcpy = Module["_memcpy"] = wasmExports["memcpy"])(a0, a1, a2))
var _ts_parser_delete = (Module["_ts_parser_delete"] = (a0) => (_ts_parser_delete = Module["_ts_parser_delete"] = wasmExports["ts_parser_delete"])(a0))
var _ts_parser_reset = (Module["_ts_parser_reset"] = (a0) => (_ts_parser_reset = Module["_ts_parser_reset"] = wasmExports["ts_parser_reset"])(a0))
var _ts_parser_set_language = (Module["_ts_parser_set_language"] = (a0, a1) => (_ts_parser_set_language = Module["_ts_parser_set_language"] = wasmExports["ts_parser_set_language"])(a0, a1))
var _ts_parser_timeout_micros = (Module["_ts_parser_timeout_micros"] = (a0) => (_ts_parser_timeout_micros = Module["_ts_parser_timeout_micros"] = wasmExports["ts_parser_timeout_micros"])(a0))
var _ts_parser_set_timeout_micros = (Module["_ts_parser_set_timeout_micros"] = (a0, a1, a2) => (_ts_parser_set_timeout_micros = Module["_ts_parser_set_timeout_micros"] = wasmExports["ts_parser_set_timeout_micros"])(a0, a1, a2))
var _ts_parser_set_included_ranges = (Module["_ts_parser_set_included_ranges"] = (a0, a1, a2) => (_ts_parser_set_included_ranges = Module["_ts_parser_set_included_ranges"] = wasmExports["ts_parser_set_included_ranges"])(a0, a1, a2))
var _memmove = (Module["_memmove"] = (a0, a1, a2) => (_memmove = Module["_memmove"] = wasmExports["memmove"])(a0, a1, a2))
var _memcmp = (Module["_memcmp"] = (a0, a1, a2) => (_memcmp = Module["_memcmp"] = wasmExports["memcmp"])(a0, a1, a2))
var _ts_query_new = (Module["_ts_query_new"] = (a0, a1, a2, a3, a4) => (_ts_query_new = Module["_ts_query_new"] = wasmExports["ts_query_new"])(a0, a1, a2, a3, a4))
var _ts_query_delete = (Module["_ts_query_delete"] = (a0) => (_ts_query_delete = Module["_ts_query_delete"] = wasmExports["ts_query_delete"])(a0))
var _iswspace = (Module["_iswspace"] = (a0) => (_iswspace = Module["_iswspace"] = wasmExports["iswspace"])(a0))
var _iswalnum = (Module["_iswalnum"] = (a0) => (_iswalnum = Module["_iswalnum"] = wasmExports["iswalnum"])(a0))
var _ts_query_pattern_count = (Module["_ts_query_pattern_count"] = (a0) => (_ts_query_pattern_count = Module["_ts_query_pattern_count"] = wasmExports["ts_query_pattern_count"])(a0))
var _ts_query_capture_count = (Module["_ts_query_capture_count"] = (a0) => (_ts_query_capture_count = Module["_ts_query_capture_count"] = wasmExports["ts_query_capture_count"])(a0))
var _ts_query_string_count = (Module["_ts_query_string_count"] = (a0) => (_ts_query_string_count = Module["_ts_query_string_count"] = wasmExports["ts_query_string_count"])(a0))
var _ts_query_capture_name_for_id = (Module["_ts_query_capture_name_for_id"] = (a0, a1, a2) => (_ts_query_capture_name_for_id = Module["_ts_query_capture_name_for_id"] = wasmExports["ts_query_capture_name_for_id"])(a0, a1, a2))
var _ts_query_string_value_for_id = (Module["_ts_query_string_value_for_id"] = (a0, a1, a2) => (_ts_query_string_value_for_id = Module["_ts_query_string_value_for_id"] = wasmExports["ts_query_string_value_for_id"])(a0, a1, a2))
var _ts_query_predicates_for_pattern = (Module["_ts_query_predicates_for_pattern"] = (a0, a1, a2) => (_ts_query_predicates_for_pattern = Module["_ts_query_predicates_for_pattern"] = wasmExports["ts_query_predicates_for_pattern"])(a0, a1, a2))
var _ts_query_disable_capture = (Module["_ts_query_disable_capture"] = (a0, a1, a2) => (_ts_query_disable_capture = Module["_ts_query_disable_capture"] = wasmExports["ts_query_disable_capture"])(a0, a1, a2))
var _ts_tree_copy = (Module["_ts_tree_copy"] = (a0) => (_ts_tree_copy = Module["_ts_tree_copy"] = wasmExports["ts_tree_copy"])(a0))
var _ts_tree_delete = (Module["_ts_tree_delete"] = (a0) => (_ts_tree_delete = Module["_ts_tree_delete"] = wasmExports["ts_tree_delete"])(a0))
var _ts_init = (Module["_ts_init"] = () => (_ts_init = Module["_ts_init"] = wasmExports["ts_init"])())
var _ts_parser_new_wasm = (Module["_ts_parser_new_wasm"] = () => (_ts_parser_new_wasm = Module["_ts_parser_new_wasm"] = wasmExports["ts_parser_new_wasm"])())
var _ts_parser_enable_logger_wasm = (Module["_ts_parser_enable_logger_wasm"] = (a0, a1) => (_ts_parser_enable_logger_wasm = Module["_ts_parser_enable_logger_wasm"] = wasmExports["ts_parser_enable_logger_wasm"])(a0, a1))
var _ts_parser_parse_wasm = (Module["_ts_parser_parse_wasm"] = (a0, a1, a2, a3, a4) => (_ts_parser_parse_wasm = Module["_ts_parser_parse_wasm"] = wasmExports["ts_parser_parse_wasm"])(a0, a1, a2, a3, a4))
var _ts_parser_included_ranges_wasm = (Module["_ts_parser_included_ranges_wasm"] = (a0) => (_ts_parser_included_ranges_wasm = Module["_ts_parser_included_ranges_wasm"] = wasmExports["ts_parser_included_ranges_wasm"])(a0))
var _ts_language_type_is_named_wasm = (Module["_ts_language_type_is_named_wasm"] = (a0, a1) => (_ts_language_type_is_named_wasm = Module["_ts_language_type_is_named_wasm"] = wasmExports["ts_language_type_is_named_wasm"])(a0, a1))
var _ts_language_type_is_visible_wasm = (Module["_ts_language_type_is_visible_wasm"] = (a0, a1) => (_ts_language_type_is_visible_wasm = Module["_ts_language_type_is_visible_wasm"] = wasmExports["ts_language_type_is_visible_wasm"])(a0, a1))
var _ts_tree_root_node_wasm = (Module["_ts_tree_root_node_wasm"] = (a0) => (_ts_tree_root_node_wasm = Module["_ts_tree_root_node_wasm"] = wasmExports["ts_tree_root_node_wasm"])(a0))
var _ts_tree_root_node_with_offset_wasm = (Module["_ts_tree_root_node_with_offset_wasm"] = (a0) => (_ts_tree_root_node_with_offset_wasm = Module["_ts_tree_root_node_with_offset_wasm"] = wasmExports["ts_tree_root_node_with_offset_wasm"])(a0))
var _ts_tree_edit_wasm = (Module["_ts_tree_edit_wasm"] = (a0) => (_ts_tree_edit_wasm = Module["_ts_tree_edit_wasm"] = wasmExports["ts_tree_edit_wasm"])(a0))
var _ts_tree_included_ranges_wasm = (Module["_ts_tree_included_ranges_wasm"] = (a0) => (_ts_tree_included_ranges_wasm = Module["_ts_tree_included_ranges_wasm"] = wasmExports["ts_tree_included_ranges_wasm"])(a0))
var _ts_tree_get_changed_ranges_wasm = (Module["_ts_tree_get_changed_ranges_wasm"] = (a0, a1) => (_ts_tree_get_changed_ranges_wasm = Module["_ts_tree_get_changed_ranges_wasm"] = wasmExports["ts_tree_get_changed_ranges_wasm"])(a0, a1))
var _ts_tree_cursor_new_wasm = (Module["_ts_tree_cursor_new_wasm"] = (a0) => (_ts_tree_cursor_new_wasm = Module["_ts_tree_cursor_new_wasm"] = wasmExports["ts_tree_cursor_new_wasm"])(a0))
var _ts_tree_cursor_delete_wasm = (Module["_ts_tree_cursor_delete_wasm"] = (a0) => (_ts_tree_cursor_delete_wasm = Module["_ts_tree_cursor_delete_wasm"] = wasmExports["ts_tree_cursor_delete_wasm"])(a0))
var _ts_tree_cursor_reset_wasm = (Module["_ts_tree_cursor_reset_wasm"] = (a0) => (_ts_tree_cursor_reset_wasm = Module["_ts_tree_cursor_reset_wasm"] = wasmExports["ts_tree_cursor_reset_wasm"])(a0))
var _ts_tree_cursor_reset_to_wasm = (Module["_ts_tree_cursor_reset_to_wasm"] = (a0, a1) => (_ts_tree_cursor_reset_to_wasm = Module["_ts_tree_cursor_reset_to_wasm"] = wasmExports["ts_tree_cursor_reset_to_wasm"])(a0, a1))
var _ts_tree_cursor_goto_first_child_wasm = (Module["_ts_tree_cursor_goto_first_child_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_wasm = Module["_ts_tree_cursor_goto_first_child_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_wasm"])(a0))
var _ts_tree_cursor_goto_last_child_wasm = (Module["_ts_tree_cursor_goto_last_child_wasm"] = (a0) => (_ts_tree_cursor_goto_last_child_wasm = Module["_ts_tree_cursor_goto_last_child_wasm"] = wasmExports["ts_tree_cursor_goto_last_child_wasm"])(a0))
var _ts_tree_cursor_goto_first_child_for_index_wasm = (Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_for_index_wasm = Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_index_wasm"])(a0))
var _ts_tree_cursor_goto_first_child_for_position_wasm = (Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = (a0) => (_ts_tree_cursor_goto_first_child_for_position_wasm = Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = wasmExports["ts_tree_cursor_goto_first_child_for_position_wasm"])(a0))
var _ts_tree_cursor_goto_next_sibling_wasm = (Module["_ts_tree_cursor_goto_next_sibling_wasm"] = (a0) => (_ts_tree_cursor_goto_next_sibling_wasm = Module["_ts_tree_cursor_goto_next_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_next_sibling_wasm"])(a0))
var _ts_tree_cursor_goto_previous_sibling_wasm = (Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = (a0) => (_ts_tree_cursor_goto_previous_sibling_wasm = Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = wasmExports["ts_tree_cursor_goto_previous_sibling_wasm"])(a0))
var _ts_tree_cursor_goto_descendant_wasm = (Module["_ts_tree_cursor_goto_descendant_wasm"] = (a0, a1) => (_ts_tree_cursor_goto_descendant_wasm = Module["_ts_tree_cursor_goto_descendant_wasm"] = wasmExports["ts_tree_cursor_goto_descendant_wasm"])(a0, a1))
var _ts_tree_cursor_goto_parent_wasm = (Module["_ts_tree_cursor_goto_parent_wasm"] = (a0) => (_ts_tree_cursor_goto_parent_wasm = Module["_ts_tree_cursor_goto_parent_wasm"] = wasmExports["ts_tree_cursor_goto_parent_wasm"])(a0))
var _ts_tree_cursor_current_node_type_id_wasm = (Module["_ts_tree_cursor_current_node_type_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_type_id_wasm = Module["_ts_tree_cursor_current_node_type_id_wasm"] = wasmExports["ts_tree_cursor_current_node_type_id_wasm"])(a0))
var _ts_tree_cursor_current_node_state_id_wasm = (Module["_ts_tree_cursor_current_node_state_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_state_id_wasm = Module["_ts_tree_cursor_current_node_state_id_wasm"] = wasmExports["ts_tree_cursor_current_node_state_id_wasm"])(a0))
var _ts_tree_cursor_current_node_is_named_wasm = (Module["_ts_tree_cursor_current_node_is_named_wasm"] = (a0) => (_ts_tree_cursor_current_node_is_named_wasm = Module["_ts_tree_cursor_current_node_is_named_wasm"] = wasmExports["ts_tree_cursor_current_node_is_named_wasm"])(a0))
var _ts_tree_cursor_current_node_is_missing_wasm = (Module["_ts_tree_cursor_current_node_is_missing_wasm"] = (a0) => (_ts_tree_cursor_current_node_is_missing_wasm = Module["_ts_tree_cursor_current_node_is_missing_wasm"] = wasmExports["ts_tree_cursor_current_node_is_missing_wasm"])(a0))
var _ts_tree_cursor_current_node_id_wasm = (Module["_ts_tree_cursor_current_node_id_wasm"] = (a0) => (_ts_tree_cursor_current_node_id_wasm = Module["_ts_tree_cursor_current_node_id_wasm"] = wasmExports["ts_tree_cursor_current_node_id_wasm"])(a0))
var _ts_tree_cursor_start_position_wasm = (Module["_ts_tree_cursor_start_position_wasm"] = (a0) => (_ts_tree_cursor_start_position_wasm = Module["_ts_tree_cursor_start_position_wasm"] = wasmExports["ts_tree_cursor_start_position_wasm"])(a0))
var _ts_tree_cursor_end_position_wasm = (Module["_ts_tree_cursor_end_position_wasm"] = (a0) => (_ts_tree_cursor_end_position_wasm = Module["_ts_tree_cursor_end_position_wasm"] = wasmExports["ts_tree_cursor_end_position_wasm"])(a0))
var _ts_tree_cursor_start_index_wasm = (Module["_ts_tree_cursor_start_index_wasm"] = (a0) => (_ts_tree_cursor_start_index_wasm = Module["_ts_tree_cursor_start_index_wasm"] = wasmExports["ts_tree_cursor_start_index_wasm"])(a0))
var _ts_tree_cursor_end_index_wasm = (Module["_ts_tree_cursor_end_index_wasm"] = (a0) => (_ts_tree_cursor_end_index_wasm = Module["_ts_tree_cursor_end_index_wasm"] = wasmExports["ts_tree_cursor_end_index_wasm"])(a0))
var _ts_tree_cursor_current_field_id_wasm = (Module["_ts_tree_cursor_current_field_id_wasm"] = (a0) => (_ts_tree_cursor_current_field_id_wasm = Module["_ts_tree_cursor_current_field_id_wasm"] = wasmExports["ts_tree_cursor_current_field_id_wasm"])(a0))
var _ts_tree_cursor_current_depth_wasm = (Module["_ts_tree_cursor_current_depth_wasm"] = (a0) => (_ts_tree_cursor_current_depth_wasm = Module["_ts_tree_cursor_current_depth_wasm"] = wasmExports["ts_tree_cursor_current_depth_wasm"])(a0))
var _ts_tree_cursor_current_descendant_index_wasm = (Module["_ts_tree_cursor_current_descendant_index_wasm"] = (a0) => (_ts_tree_cursor_current_descendant_index_wasm = Module["_ts_tree_cursor_current_descendant_index_wasm"] = wasmExports["ts_tree_cursor_current_descendant_index_wasm"])(a0))
var _ts_tree_cursor_current_node_wasm = (Module["_ts_tree_cursor_current_node_wasm"] = (a0) => (_ts_tree_cursor_current_node_wasm = Module["_ts_tree_cursor_current_node_wasm"] = wasmExports["ts_tree_cursor_current_node_wasm"])(a0))
var _ts_node_symbol_wasm = (Module["_ts_node_symbol_wasm"] = (a0) => (_ts_node_symbol_wasm = Module["_ts_node_symbol_wasm"] = wasmExports["ts_node_symbol_wasm"])(a0))
var _ts_node_field_name_for_child_wasm = (Module["_ts_node_field_name_for_child_wasm"] = (a0, a1) => (_ts_node_field_name_for_child_wasm = Module["_ts_node_field_name_for_child_wasm"] = wasmExports["ts_node_field_name_for_child_wasm"])(a0, a1))
var _ts_node_children_by_field_id_wasm = (Module["_ts_node_children_by_field_id_wasm"] = (a0, a1) => (_ts_node_children_by_field_id_wasm = Module["_ts_node_children_by_field_id_wasm"] = wasmExports["ts_node_children_by_field_id_wasm"])(a0, a1))
var _ts_node_first_child_for_byte_wasm = (Module["_ts_node_first_child_for_byte_wasm"] = (a0) => (_ts_node_first_child_for_byte_wasm = Module["_ts_node_first_child_for_byte_wasm"] = wasmExports["ts_node_first_child_for_byte_wasm"])(a0))
var _ts_node_first_named_child_for_byte_wasm = (Module["_ts_node_first_named_child_for_byte_wasm"] = (a0) => (_ts_node_first_named_child_for_byte_wasm = Module["_ts_node_first_named_child_for_byte_wasm"] = wasmExports["ts_node_first_named_child_for_byte_wasm"])(a0))
var _ts_node_grammar_symbol_wasm = (Module["_ts_node_grammar_symbol_wasm"] = (a0) => (_ts_node_grammar_symbol_wasm = Module["_ts_node_grammar_symbol_wasm"] = wasmExports["ts_node_grammar_symbol_wasm"])(a0))
var _ts_node_child_count_wasm = (Module["_ts_node_child_count_wasm"] = (a0) => (_ts_node_child_count_wasm = Module["_ts_node_child_count_wasm"] = wasmExports["ts_node_child_count_wasm"])(a0))
var _ts_node_named_child_count_wasm = (Module["_ts_node_named_child_count_wasm"] = (a0) => (_ts_node_named_child_count_wasm = Module["_ts_node_named_child_count_wasm"] = wasmExports["ts_node_named_child_count_wasm"])(a0))
var _ts_node_child_wasm = (Module["_ts_node_child_wasm"] = (a0, a1) => (_ts_node_child_wasm = Module["_ts_node_child_wasm"] = wasmExports["ts_node_child_wasm"])(a0, a1))
var _ts_node_named_child_wasm = (Module["_ts_node_named_child_wasm"] = (a0, a1) => (_ts_node_named_child_wasm = Module["_ts_node_named_child_wasm"] = wasmExports["ts_node_named_child_wasm"])(a0, a1))
var _ts_node_child_by_field_id_wasm = (Module["_ts_node_child_by_field_id_wasm"] = (a0, a1) => (_ts_node_child_by_field_id_wasm = Module["_ts_node_child_by_field_id_wasm"] = wasmExports["ts_node_child_by_field_id_wasm"])(a0, a1))
var _ts_node_next_sibling_wasm = (Module["_ts_node_next_sibling_wasm"] = (a0) => (_ts_node_next_sibling_wasm = Module["_ts_node_next_sibling_wasm"] = wasmExports["ts_node_next_sibling_wasm"])(a0))
var _ts_node_prev_sibling_wasm = (Module["_ts_node_prev_sibling_wasm"] = (a0) => (_ts_node_prev_sibling_wasm = Module["_ts_node_prev_sibling_wasm"] = wasmExports["ts_node_prev_sibling_wasm"])(a0))
var _ts_node_next_named_sibling_wasm = (Module["_ts_node_next_named_sibling_wasm"] = (a0) => (_ts_node_next_named_sibling_wasm = Module["_ts_node_next_named_sibling_wasm"] = wasmExports["ts_node_next_named_sibling_wasm"])(a0))
var _ts_node_prev_named_sibling_wasm = (Module["_ts_node_prev_named_sibling_wasm"] = (a0) => (_ts_node_prev_named_sibling_wasm = Module["_ts_node_prev_named_sibling_wasm"] = wasmExports["ts_node_prev_named_sibling_wasm"])(a0))
var _ts_node_descendant_count_wasm = (Module["_ts_node_descendant_count_wasm"] = (a0) => (_ts_node_descendant_count_wasm = Module["_ts_node_descendant_count_wasm"] = wasmExports["ts_node_descendant_count_wasm"])(a0))
var _ts_node_parent_wasm = (Module["_ts_node_parent_wasm"] = (a0) => (_ts_node_parent_wasm = Module["_ts_node_parent_wasm"] = wasmExports["ts_node_parent_wasm"])(a0))
var _ts_node_descendant_for_index_wasm = (Module["_ts_node_descendant_for_index_wasm"] = (a0) => (_ts_node_descendant_for_index_wasm = Module["_ts_node_descendant_for_index_wasm"] = wasmExports["ts_node_descendant_for_index_wasm"])(a0))
var _ts_node_named_descendant_for_index_wasm = (Module["_ts_node_named_descendant_for_index_wasm"] = (a0) => (_ts_node_named_descendant_for_index_wasm = Module["_ts_node_named_descendant_for_index_wasm"] = wasmExports["ts_node_named_descendant_for_index_wasm"])(a0))
var _ts_node_descendant_for_position_wasm = (Module["_ts_node_descendant_for_position_wasm"] = (a0) => (_ts_node_descendant_for_position_wasm = Module["_ts_node_descendant_for_position_wasm"] = wasmExports["ts_node_descendant_for_position_wasm"])(a0))
var _ts_node_named_descendant_for_position_wasm = (Module["_ts_node_named_descendant_for_position_wasm"] = (a0) => (_ts_node_named_descendant_for_position_wasm = Module["_ts_node_named_descendant_for_position_wasm"] = wasmExports["ts_node_named_descendant_for_position_wasm"])(a0))
var _ts_node_start_point_wasm = (Module["_ts_node_start_point_wasm"] = (a0) => (_ts_node_start_point_wasm = Module["_ts_node_start_point_wasm"] = wasmExports["ts_node_start_point_wasm"])(a0))
var _ts_node_end_point_wasm = (Module["_ts_node_end_point_wasm"] = (a0) => (_ts_node_end_point_wasm = Module["_ts_node_end_point_wasm"] = wasmExports["ts_node_end_point_wasm"])(a0))
var _ts_node_start_index_wasm = (Module["_ts_node_start_index_wasm"] = (a0) => (_ts_node_start_index_wasm = Module["_ts_node_start_index_wasm"] = wasmExports["ts_node_start_index_wasm"])(a0))
var _ts_node_end_index_wasm = (Module["_ts_node_end_index_wasm"] = (a0) => (_ts_node_end_index_wasm = Module["_ts_node_end_index_wasm"] = wasmExports["ts_node_end_index_wasm"])(a0))
var _ts_node_to_string_wasm = (Module["_ts_node_to_string_wasm"] = (a0) => (_ts_node_to_string_wasm = Module["_ts_node_to_string_wasm"] = wasmExports["ts_node_to_string_wasm"])(a0))
var _ts_node_children_wasm = (Module["_ts_node_children_wasm"] = (a0) => (_ts_node_children_wasm = Module["_ts_node_children_wasm"] = wasmExports["ts_node_children_wasm"])(a0))
var _ts_node_named_children_wasm = (Module["_ts_node_named_children_wasm"] = (a0) => (_ts_node_named_children_wasm = Module["_ts_node_named_children_wasm"] = wasmExports["ts_node_named_children_wasm"])(a0))
var _ts_node_descendants_of_type_wasm = (Module["_ts_node_descendants_of_type_wasm"] = (a0, a1, a2, a3, a4, a5, a6) => (_ts_node_descendants_of_type_wasm = Module["_ts_node_descendants_of_type_wasm"] = wasmExports["ts_node_descendants_of_type_wasm"])(a0, a1, a2, a3, a4, a5, a6))
var _ts_node_is_named_wasm = (Module["_ts_node_is_named_wasm"] = (a0) => (_ts_node_is_named_wasm = Module["_ts_node_is_named_wasm"] = wasmExports["ts_node_is_named_wasm"])(a0))
var _ts_node_has_changes_wasm = (Module["_ts_node_has_changes_wasm"] = (a0) => (_ts_node_has_changes_wasm = Module["_ts_node_has_changes_wasm"] = wasmExports["ts_node_has_changes_wasm"])(a0))
var _ts_node_has_error_wasm = (Module["_ts_node_has_error_wasm"] = (a0) => (_ts_node_has_error_wasm = Module["_ts_node_has_error_wasm"] = wasmExports["ts_node_has_error_wasm"])(a0))
var _ts_node_is_error_wasm = (Module["_ts_node_is_error_wasm"] = (a0) => (_ts_node_is_error_wasm = Module["_ts_node_is_error_wasm"] = wasmExports["ts_node_is_error_wasm"])(a0))
var _ts_node_is_missing_wasm = (Module["_ts_node_is_missing_wasm"] = (a0) => (_ts_node_is_missing_wasm = Module["_ts_node_is_missing_wasm"] = wasmExports["ts_node_is_missing_wasm"])(a0))
var _ts_node_is_extra_wasm = (Module["_ts_node_is_extra_wasm"] = (a0) => (_ts_node_is_extra_wasm = Module["_ts_node_is_extra_wasm"] = wasmExports["ts_node_is_extra_wasm"])(a0))
var _ts_node_parse_state_wasm = (Module["_ts_node_parse_state_wasm"] = (a0) => (_ts_node_parse_state_wasm = Module["_ts_node_parse_state_wasm"] = wasmExports["ts_node_parse_state_wasm"])(a0))
var _ts_node_next_parse_state_wasm = (Module["_ts_node_next_parse_state_wasm"] = (a0) => (_ts_node_next_parse_state_wasm = Module["_ts_node_next_parse_state_wasm"] = wasmExports["ts_node_next_parse_state_wasm"])(a0))
var _ts_query_matches_wasm = (Module["_ts_query_matches_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_matches_wasm = Module["_ts_query_matches_wasm"] = wasmExports["ts_query_matches_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10))
var _ts_query_captures_wasm = (Module["_ts_query_captures_wasm"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) => (_ts_query_captures_wasm = Module["_ts_query_captures_wasm"] = wasmExports["ts_query_captures_wasm"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10))
var ___errno_location = () => (___errno_location = wasmExports["__errno_location"])()
var _iswdigit = (Module["_iswdigit"] = (a0) => (_iswdigit = Module["_iswdigit"] = wasmExports["iswdigit"])(a0))
var _iswalpha = (Module["_iswalpha"] = (a0) => (_iswalpha = Module["_iswalpha"] = wasmExports["iswalpha"])(a0))
var _iswblank = (Module["_iswblank"] = (a0) => (_iswblank = Module["_iswblank"] = wasmExports["iswblank"])(a0))
var _iswlower = (Module["_iswlower"] = (a0) => (_iswlower = Module["_iswlower"] = wasmExports["iswlower"])(a0))
var _iswupper = (Module["_iswupper"] = (a0) => (_iswupper = Module["_iswupper"] = wasmExports["iswupper"])(a0))
var _iswxdigit = (Module["_iswxdigit"] = (a0) => (_iswxdigit = Module["_iswxdigit"] = wasmExports["iswxdigit"])(a0))
var _memchr = (Module["_memchr"] = (a0, a1, a2) => (_memchr = Module["_memchr"] = wasmExports["memchr"])(a0, a1, a2))
var _strlen = (Module["_strlen"] = (a0) => (_strlen = Module["_strlen"] = wasmExports["strlen"])(a0))
var _strcmp = (Module["_strcmp"] = (a0, a1) => (_strcmp = Module["_strcmp"] = wasmExports["strcmp"])(a0, a1))
var _strncat = (Module["_strncat"] = (a0, a1, a2) => (_strncat = Module["_strncat"] = wasmExports["strncat"])(a0, a1, a2))
var _strncpy = (Module["_strncpy"] = (a0, a1, a2) => (_strncpy = Module["_strncpy"] = wasmExports["strncpy"])(a0, a1, a2))
var _towlower = (Module["_towlower"] = (a0) => (_towlower = Module["_towlower"] = wasmExports["towlower"])(a0))
var _towupper = (Module["_towupper"] = (a0) => (_towupper = Module["_towupper"] = wasmExports["towupper"])(a0))
var _setThrew = (a0, a1) => (_setThrew = wasmExports["setThrew"])(a0, a1)
var stackSave = () => (stackSave = wasmExports["stackSave"])()
var stackRestore = (a0) => (stackRestore = wasmExports["stackRestore"])(a0)
var stackAlloc = (a0) => (stackAlloc = wasmExports["stackAlloc"])(a0)
var dynCall_jiji = (Module["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module["dynCall_jiji"] = wasmExports["dynCall_jiji"])(a0, a1, a2, a3, a4))
var _orig$ts_parser_timeout_micros = (Module["_orig$ts_parser_timeout_micros"] = (a0) => (_orig$ts_parser_timeout_micros = Module["_orig$ts_parser_timeout_micros"] = wasmExports["orig$ts_parser_timeout_micros"])(a0))
var _orig$ts_parser_set_timeout_micros = (Module["_orig$ts_parser_set_timeout_micros"] = (a0, a1) => (_orig$ts_parser_set_timeout_micros = Module["_orig$ts_parser_set_timeout_micros"] = wasmExports["orig$ts_parser_set_timeout_micros"])(a0, a1))
Module["AsciiToString"] = AsciiToString
Module["stringToUTF16"] = stringToUTF16
var calledRun
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run()
    if (!calledRun) dependenciesFulfilled = runCaller
}
function callMain(args = []) {
    var entryFunction = resolveGlobalSymbol("main").sym
    if (!entryFunction) return
    args.unshift(thisProgram)
    var argc = args.length
    var argv = stackAlloc((argc + 1) * 4)
    var argv_ptr = argv
    args.forEach((arg) => {
        LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, stringToUTF8OnStack(arg))
        argv_ptr += 4
    })
    LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, 0)
    try {
        var ret = entryFunction(argc, argv)
        exitJS(ret, /* implicit = */ true)
        return ret
    } catch (e) {
        return handleException(e)
    }
}
function run(args = arguments_) {
    if (runDependencies > 0) {
        return
    }
    preRun()
    if (runDependencies > 0) {
        return
    }
    function doRun() {
        if (calledRun) return
        calledRun = true
        Module["calledRun"] = true
        if (ABORT) return
        initRuntime()
        preMain()
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]()
        if (shouldRunNow) callMain(args)
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...")
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("")
            }, 1)
            doRun()
        }, 1)
    } else {
        doRun()
    }
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]]
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
var shouldRunNow = true
if (Module["noInitialRun"]) shouldRunNow = false
run()
