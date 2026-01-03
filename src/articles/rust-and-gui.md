---
title: Rust & GUI
author: Wakunguma Kalimukwa
published: 2025-09-30
image: https://cdn.pixabay.com/photo/2020/04/02/22/05/home-office-4996834_1280.jpg
imageAsset: ../assets/internal/thumbnails/branching-strategies.png
imageSize: 5723169
synopsis: GUI is hard in rust
preview: true
tags:
  - GUI 
---

Animations?

Rust is an amazing candidate for graphical applications, it would be type safe, minimal and 
have good performance. But after years of libraries in other sectors, GUI still feels quite lacking.
There are good crates for sure, dioxus, tauri, iced, but as [areweguiyet](https://areweguiyet.com/)
puts it:

> The roots aren't deep, but the seeds are planted.


A really good GUI crate:

- Needs good documentation
- Easy to use
- State management

## Single ownership
Rusts ownership model makes a lot of the standard approaches to UI libraries quite 
difficult to implement. GUIs are made of composed of trees, which have nodes, which have children.

```
       Root widget
           |
    +------+------+
    |      |      |
  Button  Text   Text
    |
 +--+--+  
 |     |
Icon  Text
    
```

Nodes need access to each other, the `Button` needs access to the `Icon` and `Text` to tell them
where to position themselves, or vice versa. But rust doesn't do well with trees, a naive approach 
would probably be composed of `Rc<RefCell<Node>>`. 

```rust
use std::sync::RefCell;

pub struct Tree{
    nodes: Vec<Node>
}

pub struct Node{
    parent: Rc<RefCell<Node>>,
    children: Vec<Rc<RefCell<Node>>>
}
```

Or worse a reference tower.

```rust
struct Tree<'tree>{
    nodes: Vec<Node<'tree>>
}

struct Node<'node>{
    parent: &'node mut Node<'node>,
    children: Vec<&'node mut Node<'node>>
}
```

Aside from the performance issues, this just wouldn't be good in the long run to develop. Another
approach would be for data to flow strictly down, that way the tree could be made of nodes instead.

```rust
struct Tree{
    nodes: Vec<Node>
}

struct Node{
    children: Vec<Node>
}
```

## Data flow

The way you structure your trees has an impact on the way data flows.

## Native

A GUI library in rust would most likely expected to be cross platform. Cross platform
and native don't really go together. Even if you did manage to adapt the bindings of one
platform, extending to other major platforms would be close to impossible as there would
be different expectations.

Most platforms don't really have a single native GUI toolkit that you could simply use.

## Web technology
Look at the 5 most resource hungry apps on your desktop, it's probably browsers.

## State management

A GUI app is basically a heap of state that is represented onto the screen, state that needs to be
accessed in multiple places at the same time, or very shortly after each other. These directly opposes
rust's views of single ownership. State management is complex, thousands of libraries have been created.

## To DSL or not to DSL

Macros allow us to create our own domain specific languages, so the code can look like whatever 
we want it to. It also partially eliminates the issues of ownership, as the code would expand to
whatever you'd like behind the scenes.

```rust
use gui::dsl;

dsl!{
    Button{
        on:click=sign_up()
        "Sign up"
    }
}
```

Some crates have such complex domain specific languages that it becomes
its own language, expect there's no language server and the IDE must 
do its best to interpret this random sequence of tokens.

## Alternative architecture

## System libraries
One disadvantage of cross platform tooling is

## Text rendering

## Conclusion
Some people think rust just isn't suited for GUI, there's way too many issues. I think
just like game dev, we're working in an industry that already had a specific type of 
architecture, and we have to come up with our own.
