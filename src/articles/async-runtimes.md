---
preview: false
title: The state of async runtimes
author: Wakunguma Kalimukwa
synopsis: ""
image: /internal/thumbnails/desktop-apps.png
imageAsset: ../assets/internal/thumbnails/desktop-apps.png
imageSize: 0
published: 2026-01-25
tags:
  - async
---

When async was being implemented, one of the ma
One of the main visions of the rust async goals was to be runtime-agnostic.

> **No one true runtime.** Specialized systems need specialized allocators.
> We need to be able to hook into existing runtimes in different environments,
> from embedded environments to runtimes like node.js.

However, this hasn't exactly panned out as so. The issue is that std only has types for futures. Everything else is upto the runtime.

Different runtimes implement futures in different ways. From a library author's perspective, if you had to choose one runtime, it would
probably be the most popular. And this is how the whole ecosystem is coming down on tokio. This isn't an attack on tokio, tokio is great.

There are valid usecases 
So let's look deep into the runtimes to see where they.

From the outside looking in, all async functions look the same, it doesn't seem as though there should be any difference.

```rust
#[tokio::main]
fn main(){

}
```

```rust
fn main(){
    smol::block_on(async {

    })
}
```

Notice that smol-rs doesn't require tasks to be `Sync` or `'static`.

```rust
pub struct Waker {
    waker: RawWaker,
}

impl Waker {
    #[inline]
    pub fn wake(self) {
        // The actual wakeup call is delegated through a virtual function call
        // to the implementation which is defined by the executor.

        // Don't call `drop` -- the waker will be consumed by `wake`.
        let this = ManuallyDrop::new(self);

        // SAFETY: This is safe because `Waker::from_raw` is the only way
        // to initialize `wake` and `data` requiring the user to acknowledge
        // that the contract of `RawWaker` is upheld.
        unsafe { (this.waker.vtable.wake)(this.waker.data) };
    }
}
```

The function is stored and called through a pointer in a VTable.

## Ideas

- Showcase situations where there could be errors.


## Resources

- [The state of async runtimes](https://corrode.dev/blog/async/)
- [Lang Team: Async Vision Document](https://hackmd.io/p6cmRZ9ZRQ-F1tlhGaN9rg)
- [Async rust (No idea where this is from)](https://www.chiark.greenend.org.uk/~ianmdlvl/rust-polyglot/async.html)
