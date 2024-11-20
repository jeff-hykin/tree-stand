    var document = typeof window == "object" && window.document && window.document.currentScript ? { currentScript: window.document.currentScript } : null
    export class Parser {
        constructor() {
            this.initialize()
        }

        initialize() {
            throw new Error("cannot construct a Parser before calling `init()`")
        }

        static init(moduleOptions) {
            Module = Object.assign({}, Module, moduleOptions)
            
            for (const name of Object.getOwnPropertyNames(ParserImpl.prototype)) {
                Object.defineProperty(Parser.prototype, name, {
                    value: ParserImpl.prototype[name],
                    enumerable: false,
                    writable: true,
                })
            }
            Parser.Language = Language
            return ParserImpl.init()
        }
    }

    export default Parser