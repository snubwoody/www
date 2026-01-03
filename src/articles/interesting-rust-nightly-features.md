---
title: Rust nightly features you should watch out for
author: Wakunguma Kalimukwa
synopsis: Today we'll go over interesting nightly rust features
published: 2025-05-12
preview: false
image: /internal/thumbnails/rust-nightly-features.png
imageAsset: ../assets/internal/thumbnails/rust-nightly-features.png
imageSize: 5723169
tags:
  - Rust
---
Rust is all about "stability without stagnation", which is why the nightly branch exists: to allow new features for the language that can be tested before they land in the stable branch. So I decided to go over some of the current nightly features that I find interesting.
## Gen blocks
Tracking issue: https://github.com/rust-lang/rust/issues/117078

`gen` blocks let you write iterators that `yield` a single value at a time. Manually creating iterators can often be painful and confusing, and mutable iterators that track state are often [impossible in safe code](https://rust-unofficial.github.io/too-many-lists/second-iter-mut.html). `gen` blocks offer a more concise and readable alternative.

Consider an iterator that iterates over the Fibonacci sequence, a fairly simple operation. With `gen` blocks we could express it as:

```rust 
#![feature(gen_blocks)]

fn fibonacci_iter(count: u32) -> impl IntoIterator<Item = i32>{
	gen move{
		let mut prev = 0;
		let mut next = 1;
		
		yield prev;
		
		for _ in 0..count{
			let curr = prev + next;
			prev = next;
			next = curr;
			yield curr;
		}
	}
}
```

The equivalent iterator, implemented manually, would look like:

```rust 
struct FibonacciIter{
	prev: i32,
	next: i32,
	count: u32
}

impl FibonacciIter{
	fn new(count: u32) -> Self{
		Self{
			prev: 0,
			next: 1,
			count
		}
	}
}

impl Iterator for FibonacciIter{
	type Item = i32;
	
	fn next(&mut self) -> Option<Self::Item>{
		if self.count <= 0{
			return None;
		}
		
		let curr = self.next + self.prev;
		self.prev = self.next;
		self.next = curr;
		return Some(curr);
	}
}
```

## Default field values
Tracking issue: https://github.com/rust-lang/rust/issues/132162

This feature allows struct definitions to provide default values for individual struct fields. Those fields can then be left out when initializing the struct.

```rust
#![feature(default_field_values)]
struct Player{
	name: String,
	health: u8 = 255,
	damage: u32 = 5
}

let player = Player{
	name: String::from("Player 1"),
	..
}
```

It's a fairly simple yet convenient feature. Why not just implement `Default`? Sometimes you have specific fields that you don't want to have a default value, such as ids and passwords, while the rest can be left to their defaults.

What happens when you combine default fields with `#[derive(Default)]`? In that case, your default fields will override type's default implementation. If we derive default on our above struct we can check to see the output.

```rust
#[derive(Default,Debug)]
struct Player{
	name: String,
	health: u8 = 255,
	damage: u32 = 5,
}

let player = Player::default();

dbg!(player.name); // Output: ""
dbg!(player.damage); // Output: 5
dbg!(player.health); // Output: 255
```

However, you can't override the default values when manually implementing [`Default`].

```rust
struct Player{
	name: String,
	health: u8 = 255,
	damage: u32 = 5,
}

impl Default for Player{
	fn default() -> Self{
		// This code will raise an error since we have conflicting default values
		Self{
			name: String::new(),
			health: 100,
			damage: 100
		}
	}
}
```

The default fields are restricted to `const` values, so all non-const operations will fail to compile.
### Inner structs
If you have nested structs, you can provide default values for those fields as well.

```rust
#![feature(default_field_values)]

struct BronzeArmour{
	health: u8
}

struct Player{
	name: String,
	health: u8 = 255,
	damage: u32 = 5
	armour: BronzeArmour = BronzeArmour{
		health: 50
	}
}

let player = Player{
	name: String::from("Player 1"),
	..
}
```

## Never type
Tracking issue: https://github.com/rust-lang/rust/issues/35121

The `!` (never) type represents a value that **never** exists at runtime.

```rust
use std::process::exit;

#![feature(never_type)]
fn close() -> !{
	// exits the program and never returns
	exit(0)
}
```

Why would you want to represent a value that never evaluates? Well sometimes you have an operation that never returns or is never valid. Take this example, from the [RFC](https://rust-lang.github.io/never-type-initiative/RFC.html), of the implementation of `FromStr` for `String`.

```rust
impl FromStr for String{
	type Error = !;
	
	fn from_str(s: &str) -> Result<String,!>{
		Ok(String::from(s))
	}
}
```

This error can simply **never happen**, because a `&str` can always be converted to a `String`. Which means we can safely unwrap because we are guaranteed by the compiler that the `Result` will always be `Ok`.

```rust
let r: Result<String, !> = FromStr::from("Hello");
let s: String = r.unwrap();
```

The current implementation uses the [`Infallible`](https://doc.rust-lang.org/std/convert/enum.Infallible.html) type as the error, as a placeholder while `!` is still unstable. However since it's just an enum it doesn't carry the same level of guarantee.
## Try expressions
Try blocks allow you to run an operation inside a block and return a `Result`, since the block returns a result you can propagate any errors inside the block.

```rust
#![feature(try_blocks)]
use std::io::Error;

let result: Result<Vec<u8>,Error> = try{
	fs::read("foo.txt")?
}
```

Just like functions that return a `Result`, the errors in a try block must coerce into the same type when being propagated.

Try blocks actually originated with the `?` operator; they were designed to be used together. In the [original rfc](https://github.com/rust-lang/rfcs/blob/master/text/0243-trait-based-exception-handling.md) the intention was for `?` to propagate errors and `try{}` (originally named `catch`) to handle errors.

>The most important additions are a postfix `?` operator for propagating "exceptions" and a `catch {..}` expression for catching them.

However once propagating errors was implemented, you could simply return a `Result` from the entire function, which lessened the need for `try` blocks. They still would be useful, in cases when you want to propagate errors within a specific scope without the entire function returning a `Result`. That means you've handled all propagated errors and the caller can safely use the function without worrying about errors.

