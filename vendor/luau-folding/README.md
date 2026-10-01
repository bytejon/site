# Luau folding grammar

`tree-sitter-luau.wasm` is the unmodified portable grammar from the npm `tree-sitter-luau@1.2.0` package, maintained at https://github.com/tree-sitter-grammars/tree-sitter-luau. Its MIT license is retained in `LICENSE`.

SHA-256: `f1647052518f2bdfae8e8c0b033ffdeca1193d69d11c78ba20f84c8374fd0fe3`.

The grammar runs only during the build through `web-tree-sitter`. It creates structural scope ranges independently of the dedicated `source.luau` TextMate highlighting grammar. Incomplete/unrecognized snippets deliberately have no folding controls; they still render and copy normally. No parser or WASM is shipped to the browser.
