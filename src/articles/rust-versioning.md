---
title: Why Rust crates never reach 1.0
preview: false
author: Wakunguma Kalimukwa
synopsis: Why Rust crates never reach 1.0
image: /internal/thumbnails/rust-versioning.png
imageAsset: ../assets/internal/thumbnails/rust-versioning.png
published: 2026-07-12
tags:
  - Rust
---

One of the criticisms of the Rust ecosystem is that quite a lot of crates are pre-1.0, more so than other languages. Even crates that have gone many versions without breaking changes. It's as if people are scared of finally releasing version 1.0.0 of their crate.

Programming languages attract people whose values align with the goals of said language. Go attracts people that appreciate simplicity; Zig attracts people that want to have control over all allocations and IO. Similarly, Rust attracts people that want to convey intent via an intricate type system. Detail oriented people. Perfectionists, if you will. The type of people that split a crate across multiple feature flags to make sure you only get precisely the code you need. I feel like a lot of these people imagine 1.0.0 as a bug free, almost perfect version of the library, and so they keep churning for the version they envision in their minds. Always one more feature to implement, one more bug to fix.

Rust is also one of the [most loved languages](https://survey.stackoverflow.co/2025/technology/#2-programming-scripting-and-markup-languages), so a lot of people are writing it for fun. The fun part is learning new concepts, solving problems and writing code. Versioning software, worrying about backwards compatibility, fixing long standing bugs is not so fun. So I imagine some of these people avoid 1.0.0 because of the potential burden it could become, taking away the fun of their once side project.

Rust itself puts more pressure on crate authors, when it comes to stability, because of its type system. There's just more places to introduce breaking changes. In Go, there's functions, structs, generics and interfaces. In Rust, there's enums, structs, traits, lifetimes, generics, closures, functions, declarative macros and procedural macros. These all form a jenga tower of types that interact in all sorts of ways.

The small standard library adds on to this pressure, since in the Rust ecosystem there's an emphasis on small crates that do one thing, and do it well. This means that many Rust crates can easily have dozens of dependencies, creating a compound effect because each one of these dependencies could be a source of breaking changes. Especially if you re-export types from external crates, which a lot of Rust crates do. For example, if you re-export type `T` from crate `a`, and later crate `a` introduces breaking changes to type `T`, your crate now has the same breaking changes. So if crate `a` has not reached 1.0.0, it would be wise to also keep your crate in pre-1.0 versions as well.
