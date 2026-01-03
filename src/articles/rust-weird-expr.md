---
title: Weird expressions in rust
author: Wakunguma Kalimukwa
published: 2025-06-23
image: /internal/thumbnails/rust-weird-expressions.png
imageAsset: ../assets/internal/thumbnails/rust-weird-expressions.png
imageSize: 1200000
synopsis: Explore weird quirks of rusts type system
preview: false
tags:
  - Rust
---

Rust has a very powerful type system, but as a result it has some quirks, some would say cursed expressions. There's a test file, [`weird-expr.rs`](https://github.com/rust-lang/rust/blob/master/tests/ui/weird-exprs.rs), in the rust repository that tests for some of these and makes sure there consistent between updates. So I wanted to go over each of these and explain how it's valid rust.

> Note that these are not bugs, but rather extreme cases of rust features like loops, expressions, coercion and so on.

## Strange

```rust
fn strange() -> bool {let _x:bool = return true;}
```
The expression `return true` has the type `!`. The never type can coerce into any other type, so we can assign it to a boolean. 

## Funny

```rust
fn funny(){
	fn f(_x: ()){}
	f(return);
}
```

The function `f` has a single parameter of `()` type, we can again pass `return` because `!` will be coerced into `()`.

## What

```rust
use std::cell::Cell;

fn what(){
	fn the(x: &Cell<bool>){
		return while !x.get() {x.set(true);};
	}
	let i = &Cell::new(false);
	let dont = {||the(i)};
	dont();
	assert!(i.get());
}
```

The `the` function takes a reference to a `Cell<bool>`. Inside the function, we use a while loop

```rust
while !x.get() {x.set(true);}
```

to set the cells contains to `true` if its contents are `false` and we return that while loop which has the type `()`.

Next we create a variable `i` which is a reference to a `Cell<bool>` and bind a closure that calls `the` with `i` as the parameter, we then call that closure and assert that `i` is true.
## Zombie jesus

```rust
fn zombiejesus() {  
    loop {  
        while (return) {  
            if (return) {  
                match (return) {  
                    1 => {  
                        if (return) {  
                            return  
                        } else {  
                            return  
                        }  
                    }                    
                    _ => { return }  
                };  
            } else if (return) {  
                return;  
            }  
        }        
        if (return) { break; }  
    }
}
```

The expression `(return)` has the type never, since the never type can coerce into any type we can use it in all these places.

In `if` and `while` statements it gets coerced into a boolean, in a `match` statement it gets coerced into anything.

```rust
let screaming = match(return){
	"aahhh" => true,
	_ => false
};
```
## Not sure

```rust
use std::mem::swap;

fn notsure() {
    let mut _x: isize;
    let mut _y = (_x = 0) == (_x = 0);
    let mut _z = (_x = 0) < (_x = 0);
    let _a = (_x += 0) == (_x = 0);
    let _b = swap(&mut _y, &mut _z) == swap(&mut _y, &mut _z);
}
```

We have an uninitialised variable `_x`, we assign `_y` to `(_x = 0) == (_x = 0)`. `(_x = 0)` evaluates to the unit type so `_y` is true. Similar thing with `_z` and `_a`, except `_z` is false since `()` is not less than itself. `_b` is also true because `swap` returns `()`.

## Cant touch this

```rust

fn canttouchthis() -> usize {
    fn p() -> bool { true }
    let _a = (assert!(true) == (assert!(p())));
    let _c = (assert!(p()) == ());
    let _b: bool = (println!("{}", 0) == (return 0));
}
```

The function `p()` function returns that a boolean, the `assert!` macro returns `()`, so `_a` and `_c` are both true.

In the final line `_b` is assigned to the expression

```rust
(println!("{}"),0) == (return 0))
```

The `println!` returns macro returns `()`, and `(return 0)` is `!` which gets coerced into `()` so the expression is valid, this line also returns 0 which makes the function signature valid.

## Angry dome

```rust
fn angrydome() {  
    loop { if break { } }  
    let mut i = 0;  
    loop {   
		i += 1;   
		if i == 1 { 
			match (continue) { 
				1 => { }, 
				_ => panic!("wat") } 
			}  
	        break;   
		}  
}
```

In the first line we immediately exit the loop, because `break` is a valid expression, which has the type `!`, we can use it in an if statement.

In the next part we assign `i` to 0. We increment `i` in the loop, the if statement will run in the first iteration because `i` is now 1. We match `(continue)` which is `!`, the loop skips to the next iteration, we increment `i` again so it's now `2`. The `if` statement doesn't run so the loop exits and the function returns.

## Union

```rust
fn union() {
    union union<'union> { union: &'union union<'union>, }
}
```

Rust has [three categories](https://doc.rust-lang.org/reference/keywords.html) of keywords:
- Strict keywords, which can only be used in their correct contexts
- Reserved keywords, which have been reserved for future use, but have the same limitations as strict keywords
- Weak keywords, which only have special meaning in certain contexts

`union` is a weak keyword and is [only a keyword when used in a union declaration](https://doc.rust-lang.org/reference/keywords.html#r-lex.keywords.weak.union), allowing us to it to be used in other contexts, such as function names.

## Punch card

```rust
fn punch_card() -> impl std::fmt::Debug {
    ..=..=.. ..    .. .. .. ..    .. .. .. ..    .. .. .. ..
    ..=.. ..=..    .. .. .. ..    .. .. .. ..    .. ..=.. ..
    ..=.. ..=..    ..=.. ..=..    .. ..=..=..    ..=..=..=..
    ..=..=.. ..    ..=.. ..=..    ..=.. .. ..    .. ..=.. ..
    ..=.. ..=..    ..=.. ..=..    .. ..=.. ..    .. ..=.. ..
    ..=.. ..=..    ..=.. ..=..    .. .. ..=..    .. ..=.. ..
    ..=.. ..=..    .. ..=..=..    ..=..=.. ..    .. ..=..=..
}
```

In rust `..` represents an unbounded range ([`std::ops::RangeFull`](https://doc.rust-lang.org/std/ops/struct.RangeFull.html)) usually used in slices. Similarly `..=` represents a range up to and including a value  ([`std::ops::RangeToInclusive`](https://doc.rust-lang.org/std/ops/struct.RangeToInclusive.html)). All the different ranges have types which you can see in the `std::ops` [module docs](https://doc.rust-lang.org/std/ops/index.html). 

Ranges can be combined into whatever amalgamation you would like:

```rust
use std::ops::{RangeFull, RangeTo, RangeToInclusive};

let _a: RangeToInclusive<RangeTo<RangeFull>> =  ..=.. .. ;
```

All of these range types implement `Debug`, which satisfies the `impl std::fmt::Debug` return type.

## Monkey barrel

```rust
fn monkey_barrel() {
    let val: () = ()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=()=();
    assert_eq!(val, ());
}
```

In rust an [**assignment expression**](https://doc.rust-lang.org/reference/expressions/operator-expr.html#assignment-expressions) consists of a left [**assignee expression**](https://doc.rust-lang.org/reference/expressions.html#r-expr.place-value.assignee), an equals sign (`=`) and a right [**value expression**](https://doc.rust-lang.org/reference/expressions.html#r-expr.place-value.value-result). A tuple pattern can be used an assignee expression, which means it can appear on the left part of an assignment expression. Most of the times we use this to assign destructure values.

```rust
let (x,y) = (110.0,50.5);
```

But the tuple can also be empty, which means we're assigning it to the `()` type.

```rust
let () = ();
```

Because assignments return `()` we can chain them

```rust
let () = ()=()=();
```

## Semi's

```rust
fn semisemisemisemisemi() {
    ;;;;;;; ;;;;;;; ;;;    ;;; ;;
    ;;      ;;      ;;;;  ;;;; ;;
    ;;;;;;; ;;;;;   ;; ;;;; ;; ;;
         ;; ;;      ;;  ;;  ;; ;;
    ;;;;;;; ;;;;;;; ;;      ;; ;;
}
```

You can add a semi-colon anywhere in a block, which creates an empty statement with an empty value `()`. So these semi-colons just create a bunch of empty statements.

## Useful syntax

```rust
fn useful_syntax() {  
    use {{std::{{collections::{{HashMap}}}}}};  
    use ::{{{{core}, {std}}}};  
    use {{::{{core as core2}}}};  
}
```

Rust allows grouped `use` statements to reduce boilerplate. These braces can also be used at the root of the statement, there's also no limit to the number of braces you can use.

```rust
use {std::sync::Arc};
use core::{mem::{{transmute}}};
```

## Infinite modules

```rust
fn infcx() {
    pub mod cx {
        pub mod cx {
            pub use super::cx;
            pub struct Cx;
        }
    }
    let _cx: cx::cx::Cx = cx::cx::cx::cx::cx::Cx;
}
```

We declare a module `cx`, then we create another sub-module also named `cx`. The line

```rust
pub use super::cx;
```

is re-exporting the module from itself, which means we can now call it recursively. It's simpler to see if we change the names.

```rust
pub mod outer{  
    pub mod inner{  
        pub use super::inner;  
        pub struct Item;  
    }  
}  
  
let _item: outer::inner::Item = outer::inner::inner::inner::Item;
```

## Fish fight

```rust
fn fish_fight() {
    trait Rope {
        fn _____________<U>(_: Self, _: U) where Self: Sized {}
    }

    struct T;

    impl Rope for T {}

    fn tug_o_war(_: impl Fn(T, T)) {}

    tug_o_war(<T>::_____________::<T>);
}
```

The `Rope` trait has a provided method with one generic `U`, and it takes in two arguments, one of type `Self` and another of type `U`. We make a struct `T` and implement `Rope` for it. The `tug_of_war` function accepts any function or closure that implements `Fn(T,T)`.

 The expression `<T>::_____________::<T>` is a fully qualified function pointer, with `T` as the generic type (`fn(T,T)`). Because both parameters are of the same type, we can pass this into the `tug_of_war`.
## Dots

```rust
fn dots() {
    assert_eq!(String::from(".................................................."),
               format!("{:?}", .. .. .. .. .. .. .. .. .. .. .. .. ..
                               .. .. .. .. .. .. .. .. .. .. .. ..));
}
```

The range syntax (`std::ops::RangeFull`) implements `Debug` and gets formatted as `".."`. So we can chain them to get a string of dots.

## u8

```rust
fn u8(u8: u8) {  
    if u8 != 0u8 {  
        assert_eq!(8u8, {  
            macro_rules! u8 {  
                (u8) => {  
                    mod u8 {  
                        pub fn u8<'u8: 'u8 + 'u8>(u8: &'u8 u8) -> &'u8 u8 {  
                            "u8";  
                            u8  
                        }  
                    }                
                };  
            }
            u8!(u8);  
            let &u8: &u8 = u8::u8(&8u8);  
            crate::u8(0u8);  
            u8  
        });  
    }  
}
```

Let's take this apart, we have a macro `u8!`, which declares a module `u8` which declares a function `u8` which takes a parameter named `u8` of type `u8` and returns a reference to a `u8`.

```rust
macro_rules! u8 {  
    (u8) => {  
        mod u8 {  
            pub fn u8<'u8: 'u8 + 'u8>(u8: &'u8 u8) -> &'u8 u8 {  
                "u8";  
                u8  
	        }  
        }                
    };  
}
```

Next we call `u8::u8(&8u8)` and assign it to a variable (`u8`). The next line calls `crate::u8(0u8)`, and finally we return the `u8` variable from the entire expression.

## Continue

```rust
fn 𝚌𝚘𝚗𝚝𝚒𝚗𝚞𝚎() {  
    type 𝚕𝚘𝚘𝚙 = i32;  
    fn 𝚋𝚛𝚎𝚊𝚔() -> 𝚕𝚘𝚘𝚙 {  
        let 𝚛𝚎𝚝𝚞𝚛𝚗 = 42;  
        return 𝚛𝚎𝚝𝚞𝚛𝚗;  
    }  
    assert_eq!(loop {  
        break 𝚋𝚛𝚎𝚊𝚔 ();  
    }, 42);  
}
```

These use unicode monospace characters, instead of normal ASCII characters, for identifiers, which don't break rust's rules of using keywords as identifiers.

## Fishy

```rust
fn fishy() {
    assert_eq!(
	    String::from("><>"),
        String::<>::from::<>("><>").chars::<>().rev::<>().collect::<String>()
    );
}
```

Rust uses the turbo fish syntax when adding generics and lifetimes. We can use empty angle brackets to explicitly specify empty generics.
## Special characters

```rust
fn special_characters() {
    let val = !((|(..):(_,_),(|__@_|__)|__)((&*"\\",'🤔')/**/,{})=={&[..=..][..];})//
    ;
    assert!(!val);
}
```

Let's decode the right expression:

```rust
let val = &[..=..][..];
```
We create a reference to a slice containing a range `&[..=..]`, then we take a full slice of that.

Now for the left expression:

```rust
let val = (|(..):(_,_),(|__@_|__)|__)((&*"\\",'🤔')/**/,{});
```

We have a closure with two arguments, the first argument is a tuple, with auto-inferred types.

```rust
let val = |(..):(_,_)|{};
```

The second argument is a closure which has an [at binding](https://doc.rust-lang.org/book/ch19-03-pattern-syntax.html#-bindings), the variable `__` is bound to a wildcard pattern (`_`), which will match anything.

```rust
let val = |(..):(_,_),(|__@_|__)|{};
```

Then we immediately call that closure, passing in a tuple with a string and a char, and an empty block.

```rust 
let val = (|(..):(_,_),(|__@_|__)|)((&*"\\",'🤔'),{})
```
## Match

```rust
fn r#match() {
    let val: () = match match match match match () {
        () => ()
    } {
        () => ()
    } {
        () => ()
    } {
        () => ()
    } {
        () => ()
    };
    assert_eq!(val, ());
}
```

This is just matching nested `match` statements.
## Match nested if

```rust
fn match_nested_if() {
    let val = match () {
        () if if if if true {true} else {false} {true} else {false} {true} else {false} => true,
        _ => false,
    };
    assert!(val);
}
```

This is a [`match guard`](https://doc.rust-lang.org/rust-by-example/flow_control/match/guard.html) with nested `if` statements.
## Function

```rust

fn function() {
    struct foo;
    impl Deref for foo {
        type Target = fn() -> Self;
        fn deref(&self) -> &Self::Target {
            &((|| foo) as _)
        }
    }
    let foo = foo () ()() ()()() ()()()() ()()()()();
}
```

The `Deref` trait is used when a type can be implicitly coerced into another type, it's usually used by smart pointers so they can be implicitly used at the underlying type.

We implement `Deref` for foo into a function pointer that returns `foo`, which means we can call that foo again recursively.

## Bathroom stall

```rust
fn bathroom_stall() {
    let mut i = 1;
    matches!(2, _|_|_|_|_|_ if (i+=1) != (i+=1));
    assert_eq!(i, 13);
}

```

In a match arm multiple patterns can be matched in one arm, separated by `|`.

```rust
let foo = 'a';  
match foo {   
	'a'..'c'|'x'..'z' => {}  
    _ => {}  
}
```

The [`matches!`](https://doc.rust-lang.org/nightly/core/macro.matches.html) macro has the same syntax as a match statement so we can also chain multiple patterns, even if those are wildcard patterns.

```rust
matches!((),_|_|_|_|_|_)
```

```rust
matches!(2, _|_|_|_|_|_ if (i+=1) != (i+=1));
```

We have six different patterns here, which all do the same thing: we check if `i +=1 != i += 1`, which increments it twice, so each iteration is incrementing `i` by 2. `6 x 2 = 12` plus 1 (the initial value) and the final value is 13 so the assert `assert_eq!(i,13)` is true. The `match!(2,..)` doesn't panic because it's a wildcard pattern so any value could have been used. The if statement is always going to be false because the right expression will always be one more than the left so it will run until all the patterns have been tried.

## Closure matching

```rust
fn closure_matching() {
    let x = |_| Some(1);
    let (|x| x) = match x(..) {
        |_| Some(2) => |_| Some(3),
        |_| _ => unreachable!(),
    };
    assert!(matches!(x(..), |_| Some(4)));
}
```

`x` is a closure that takes in a parameter with an unspecified type, which will be inferred through its usage. Next we `match x(..)` which makes the type of the closure `RangeFull`. It looks like we're matching closures but it's really just multiple wildcard patterns.

The numbers also don't matter even though it seems as though the function is being incremented each time, since it's a wildcard anything would match.

## Return already

```rust
fn return_already() -> impl std::fmt::Debug {
    loop {
        return !!!!!!!
        break !!!!!!1111
    }
}
```

The `break` expression is repeatedly applying a [`not`](https://doc.rust-lang.org/std/ops/trait.Not.html) operation on an integer, while the `return expression` is also repeatedly applying a `not` operation on the `break` expression.

## Fake macros

```rust
fn fake_macros() -> impl std::fmt::Debug {
    loop {
        if! {
            match! (
                break! {
                    return! {
                        1337
                    }
                }
            ) {
            }
        } {
        }
    }
}
```

Let's isolate the return statement:

```rust
fn fake_macros() -> impl std::fmt::Debug{
	return! { 1337 }
}
```

This is doing a `not` operation on the inner expression. Next we wrap that expression in a loop.

```rust
fn fake_macros() -> impl std::fmt::Debug{
	loop {
		break! {
			return! {
				1337
			}
		}
	}
}
```

The `break!{ }` is also doing a `not` operation on the `return! { 1337 }`, which has the type `!`. Now the functions return type is inferred from both the loop and the return statement. Divergent function?

Next we wrap everything inside the loop in a match statement

```rust
fn fake_macros() -> impl std::fmt::Debug{
	loop {
		match!(
			break! {
				return! {
					1337
				}
			}
		){
		
		}
	}
}
```

We don't have to add any patterns to the match statement since we're matching `never`. And finally we wrap this in an `if` statement.

```rust
fn fake_macros() -> impl std::fmt::Debug{
	loop {
		if! {
			match! (
				break! {
					return! {
						1337
					}
				}
			)
		} {
		}
	}
}
```

So to sum it up:
- `return! { 1337 }` makes the return type of the function an `i32`, which implements `Debug`
- `break! { ... }` makes the return type of the loop `!`, because of the inner `return`, which also implements `Debug`
- We match the break statement and leave out the patterns since it is `!`
- Wrap the match statement in an if statement

