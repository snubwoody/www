---
preview: false
title: Variadic generics
author: Wakunguma Kalimukwa
synopsis: ""
image: /internal/thumbnails/variadic-generics.png
imageAsset: ../assets/internal/thumbnails/variadic-generics.png
imageSize: 0
published: 2025-10-06
tags: [Generics]
---

> Note that most of the syntax here is hypothetical.

[Variadic generics](https://en.wikipedia.org/wiki/Variadic_template) are similar to
[variadic functions](https://en.wikipedia.org/wiki/Variadic_function),
but at the type
system level, allowing a rust item to have an arbitrary number of generic types.

```rust
fn default<..T:Default>() -> (..T) {
    for type T in ..T {
       (..T::default())
    }
}

assert_eq!(default(),());
assert_eq!(default<usize>(),0);
assert_eq!(default<usize>(),(0));
assert_eq!(default<usize,bool>(),(0,false));
```

## Why?
Why even bother? Rust has been doing just fine without this feature.
There are a few things that are very un-idiomatic to implement, that could be solved by variadics.

My first thought was [bevy's systems](https://bevy-cheatbook.github.io/programming/systems.html). 
In bevy any function with parameters that can be 
turned into system parameters is a system. To implement that you would need to write it by hand.

```rust
trait System<T> {}

impl<F: FnMut()> System<()> for F {}

impl<F: FnMut(T1), T1: 'static> System<(T1,)> for F{} 

impl<F: FnMut(T1, T2), T1: 'static, T2: 'static> System<(T1, T2)> for F {}
```

If this is a one and done kind of thing then it wouldn't be too much effort, but imagine a crate
with many such items. You are also limited by how far you are willing to support, most of the time
going up to a fairly high number like 10 will cover most use cases. But with variadic generics 
you could support an arbitrary amount of parameters and write much less code.

```rust
trait System<T> { }

impl<F:FnMut(T),..T:'static> System<(..T)> for F { }
```

Basically anything involving tuples or tuple-like items with an arbitrary amount of
fields can benefit from this.

There's actually **a lot** of things in rust that use tuple-like syntax 
here's a few examples of things that could be extended or made "better" with variadic generics:

- Extend [`std::cmp::min`](https://doc.rust-lang.org/std/cmp/fn.min.html) (or max)

```rust
// Current
fn min<T:Ord>(v1:T,v2:T)

assert_eq!(
    min(
        min(
            min(1,2),
            3
        ),
        4
    ),
    1
);

// With variadics
fn min<..T:Ord>(items:..T)

assert_eq!(min(1,2,3,4,5,6),1);
```

- Extend [`std::iter::zip`](https://doc.rust-lang.org/std/iter/fn.zip.html)

```rust
// Current
pub fn zip<A, B>(
    a: A,
    b: B,
) -> Zip<<A as IntoIterator>::IntoIter, <B as IntoIterator>::IntoIter>
where
    A: IntoIterator,
    B: IntoIterator,
    
// With variadics
pub fn zip<..I: IntoIterator>(items: ..I) -> Zip<..I> 
```

- Remove `extern` calls from `Fn` traits

```rust
// Current
pub trait FnOnce<Args: Tuple> {
    type Output;

    extern "rust-call" fn call_once(self, args: Args) -> Self::Output;
}

// New
pub trait FnOnce<..Args> {
    type Output;

    fn call_once(self, args: ..Args) -> Self::Output;
}
```

## Why not?
Multiple [drafts](https://github.com/rust-lang/lang-team/blob/master/src/design_notes/variadic_generics.md)
for variadic generics have been made throughout the years, but not 
much has been settled on.
There's **a lot** of unanswered questions and unsolved debates over what exact features should 
be implemented. For one, there is currently no consensus on the syntax to be used,
but the common suggestions include `..T`, `...T`, `T..`, `T...`.

### Variadic tuples 
For this feature to work variadic tuples are most likely going to be needed in some capacity, i.e. a 
tuple that can have any number of items. This is particularly useful for return types, any variadic
return type will have to be a tuple, it can't be a list as those are homogeneous.

```rust
let any: (..i32) = (10,20,50,-255);
```

### Variadic lifetimes
If multiple types are supported does that mean variadic lifetimes should be supported as well?
In which case each type would have its own lifetime. Take, for example, a function that iterates over 
slices. With only variadic generics each slice would have to have the same lifetime,
which may be limiting in some instances. 
With variadic lifetimes, each slice could have a difference lifetime, giving more freedom to callers.

```rust
// No variadics
pub fn zip_slice<'a,'b,A,B>(s1:&'a [A],s2: &'b [B]) 
-> impl Iterator<Item=(&'a A,&'b B)>;

// Variadic generics
pub fn zip_slice<'a,..T>(slices: &'a [..T],) 
-> impl Iterator<Item=(&'a ..T)>;

// Variadic generics + variadic lifetimes
pub fn zip_slice<..'a,..T>(slices: &..'a [..T],) 
-> impl Iterator<Item=(&..'a ..T)>;
```

### Const generics
It's not clear how this feature would interact with const generics, if at all.

### Looping over types
The variadic items will need to be looped over. But what about the types themselves? Will looping 
over types be possible and what would the syntax look like? Since it's a const operation there
maybe a need to have some `static` or `const` declaration to imply that.

```rust
fn default_all<..Ts:Default>() -> (..T){
    for static T in Ts {
        T::default();
    } 
}
```

### Macros
Most, if not all, of these issues can be solved using macros, regardless of how unpleasant to write
that may be, or even just writing the code by hand. Macros can take in an arbitrary amount of rust
tokens, which covers all the use cases of variadic generics So it depends on whether the increased
ergonomics outweigh the complexity of implementing this feature.

```rust
macro_rules! impl_system {
    ($($T:ident),*) => {
        impl<F, $($T: 'static),*> System<($($T,)*)> for F
        where F: FnMut($($T),*) { }
    };
}

impl_system!(T1);
impl_system!(T1, T2);
impl_system!(T1, T2, T3);
```

## Other languages
Variadics is a pretty popular feature, most languages have variadic functions. However, 
not many languages have variadic generics, or some equivalent feature. 
In most of the languages with variadic functions, the language is either dynamically 
typed or the varaags must be of the same type.
These are some of the languages that have variadic generics or some roughly 
equivalent feature:

- [C++ Variadic templates](https://gcc.gnu.org/wiki/variadic-templates)
- [D Variadics](https://dlang.org/articles/variadic-function-templates.html)
- [Swift Parameter packs](https://www.swift.org/blog/pack-iteration/)
- [Typescript variadic tuples](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
