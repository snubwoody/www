---
title: Why are macros like that?
preview: false
author: Wakunguma Kalimukwa
synopsis: Macros are weird
image: /internal/thumbnails/macros.png
imageAsset: ../assets/internal/thumbnails/macros.png
imageSize: 12
published: 2025-08-30
tags:
  - Macros
  - Rust
---


Macros, as useful as they are, have a lot of quirks. They are hard to write, hard to debug and hard to test. But why is that?

## Declarative macros
Declarative macros have two forms of scope; [textual scope](https://doc.rust-lang.org/reference/macros-by-example.html#textual-scope) and 
[path based scope](https://doc.rust-lang.org/reference/macros-by-example.html#path-based-scope). Textual scope is based on the order that things
appear in the source file. When a declarative macro is defined it enters the scope after that definition, which means it can only be used after, and
not before, it's definition. This scope extends into child modules.

```rust
mod child_a{
    // foo! is undefined 
}

// foo! is undefined

macro_rules! foo {
    () => {};
}

// foo! is defined
foo!{}

mod child_b{
    // foo! is defined
    foo!{}
}
```

However, macros themselves can be used in any order.

```rust
macro_rules! macro_a {
    () => {
        macro_b!()
    };
}

macro_rules! macro_b {
    () => {
        macro_a!()
    };
}
```

The `#[macro_export]` attribute can be used to give a macro path based scope, and it will be declared in the crate root and can be imported and used like other normal rust items.

```rust
fn main() {
    iterate!();
}

mod iter {
    #[macro_export]
    macro_rules! iterate{
        () => {};
    }
}
```

However, they are always exported from the crate root, there is no way to export them from a sub module or use visibility modifiers.

### Hygiene
Declarative macros have mixed site hygiene, which means that local variables are looked up at the macro definition, while other symbols are looked up at the invocation site. Which means
that the following will fail to compile, even though syntactically it works.

```rust
struct l;

macro_rules! foo {
    () => {
        fn repeat(l: i32) {}
    };
}

foo!{}
```


### Declarative macros 2.0
These issues, and more, have led to the idea of a [declarative macros 2](https://github.com/rust-lang/rust/issues/39412) [RFC](https://github.com/rust-lang/rfcs/blob/master/text/1584-macros.md),
which would create a new macro system that more closely aligns with the other items of rust.

```rust
mod a {
    pub macro foo() { ... bar() ... }
    fn bar() {}
}

fn main() {
    a::foo!(); 
}
```

Although it's still very much in progress.

## Procedural macros

[Procedural macros](https://doc.rust-lang.org/nightly/reference/procedural-macros.html) need to be declared in a special `proc-macro` crate, 
and this crate can **only** export procedural macros. The exported proc macros can not be used in the same crate they are defined in. 
This is because they need to be compiled before they can be used in other crates.

Proc macros can take in any arbitrary tree of tokens and must output valid rust tokens, however the input tokens don't have to be valid rust. Because of this IDE support is pretty bad to non-existent 
when it comes to proc macros. Since any valid token tree counts, there isn't really any syntax to follow, and as such there's not much hinting that can be done. The poor little IDE has no idea what to do. 
This is especially true for Domain Specific Languages which have their own custom syntax.

Procedural macros, unlike declarative macros, are fully qualified functions that execute at compile time, meaning you can do anything a function can, **but at compile time**. Things
such as making network requests, reading and writing files and deleting directories. This has led to some cautions regarding what macros should and shouldn't be able to do, 
and there have been ideas to [sand box](https://internals.rust-lang.org/t/pre-rfc-sandboxed-deterministic-reproducible-efficient-wasm-compilation-of-proc-macros/19359) proc macros 
in a wasm environment, where they wouldn't have much access to external state.

