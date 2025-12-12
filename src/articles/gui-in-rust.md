---
title: A GUI experiment 
author: Wakunguma Kalimukwa
synopsis: A GUI experiment
layout: ../../layouts/BlogLayout.astro
published: 2025-12-12
preview: false
image: /internal/thumbnails/a-gui-experiment.png
imageAsset: ../assets/internal/thumbnails/a-gui-experiment.png
imageSize: 5723169
tags:
  - GUI
---

A while ago I went on an adventure creating my own GUI library in rust...

## Ideas

- Immediate mode vs retained mode
- No macros

## Why rust?

Well I just like rust so that's one. Two, I'm not sure if rust will ever be the primary choice for writing graphical software, other languages are just simpler to learn and (may) have an easier developer experience. 

I think every language needs a decent GUI library whether or not it will be **the** primary language. There are just situations where you need to draw stuff to the screen, like game engines, embedded software and so on. But there's definitely use cases for a GUI in rust. Maybe you're making an OS in rust (link redox), you definitely need to draw stuff to the screen.

- Blender uses a custom solution using OpenGL
- Davinci Resolve is written in QT

## Renderer

Can't write widgets without something to draw them to the screen. I initially made my own (crappy) renderer using `wgpu`. This worked but it was buggy and slow and I soon realised that it is a project in itself so I switched to `tiny_skia`.  Font rendering...

## Layout

I realised that most of the layout in a GUI is composed of rows, columns and individual widgets (add image). 
Like this home page of [mason and fifth](https://mason-fifth.com/).

![Layout](../assets/internal/gui-in-rust/screenshot.png)


Furthermore, all widgets want to be one of three sizes:

- As large as possible
- As small as possible
- A specific fixed size

By not using fixed sizes you allow the layout to be responsive and adapt to different screen sizes.

## Retained mode vs Immediate mode

In a [retained mode](https://en.wikipedia.org/wiki/Retained_mode) GUI the framework/library **retains** the widget tree for rendering and the client uses abstractions such as widgets, views or components to describe the scene. Retained mode UI's are **very** abstracted and there is a lot of stuff going on behind the scenes, like in this Jetpack Compose [example](https://developer.android.com/develop/ui/compose/state):

```kotlin
@Composable
private fun HelloContent() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(
            text = "Hello!",
            modifier = Modifier.padding(bottom = 8.dp),
            style = MaterialTheme.typography.bodyMedium
        )
        OutlinedTextField(
            value = "",
            onValueChange = { },
            label = { Text("Name") }
        )
    }
}
```

In an [immediate mode](https://en.wikipedia.org/wiki/Immediate_mode_(computer_graphics)) GUI you directly the control the primitives that are drawn to the screen each frame. Typically managing state and control flow yourself, like in this [egui](https://github.com/emilk/egui/tree/main?tab=readme-ov-file#example) example:

```rust
ui.heading("My egui Application");
ui.horizontal(|ui| {
    ui.label("Your name: ");
    ui.text_edit_singleline(&mut name);
});
ui.add(egui::Slider::new(&mut age, 0..=120).text("age"));
if ui.button("Increment").clicked() {
    age += 1;
}
ui.label(format!("Hello '{name}', age {age}"));
ui.image(egui::include_image!("ferris.png"));
```

There's different pros and cons to each. I chose retained mode because it's:

- Easier to manage global state, e.g. tab index
- Easier to add accessibility
- Typically less verbose

## Widget tree

In most, if not all, GUI libraries the widgets are stored in a tree, with each widget potentially having one or more child widgets.

![Widget tree](../assets/internal/gui-in-rust/widget-tree.png)

Rust is based on ownership, so writing a tree data stucture that has bidirectional data flow is difficuly. One approach is using reference counting and interior mutability.

**TODO:** Check this IntoIterator

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

pub struct Node {
    parent: Option<Weak<RefCell<Node>>>,
    children: Vec<Rc<RefCell<Node>>>,
}

impl Node {
    fn new<I: IntoIterator>(parent: Weak<RefCell<Node>>,children:I) -> Self {
        Node {
            parent,
            children: children.into_iter().collect(),
        }
    }
    
    // TODO: check this type
    pub fn root<I: IntoIterator>(children: I) -> Self{
        parent: None,
        children: children.into_iter().collect()
    }
}
```

Apart from being quite unergonomic, I feel like this would severely limit the library's architecture down the line. So I chose to implement a top-down approach instead: data only flows down. So every widget can own its child, playing nice with rust's ownership model.

```rust
pub trait Widget {
    fn children(&self) -> &[&dyn Widget];
    fn render(&self,renderer: &Renderer);
}

struct Button{
    child: Box<dyn Widget>
}

impl Widget for Button{
    pub fn children(&self) -> &[&dyn Widget]{
        std::slice::from(&self.child);
    }

    fn render(&self, renderer: &Renderer){
        renderer.draw_rect(...);
        child.render(&renderer);
    }
}
```

This has different trade offs but worked surprisingly well, and took me quite far.

## Widget architecture

Widgets have a lot of functionality, tab focus, focus states, layout, rendering, themes, when describing widgets you don't really want or need to handle all these things yourself.

### Domain specific language

One approach is to use macros to create a [Domain Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language) for describing widgets.

```rust
use agape::widgets::*;

fn SubscribeButton() -> impl Widget{
    widget!{
        Button{
            on_click: || println!("Subscribed"),
            "Subscribe"
        }
    }
}
```

But the problem is that rust macros don't have great IDE support, especially procedural macros.
Because procedural macros simply take in and return a stream of rust tokens, i.e. `TokenStream`, there isn't a defined syntax that IDE's can use for intellisense; It's a black box.

Also macros tend to have bad documentation, more than other rust items. You essentially have a mini-programming language,
but people tend to not put in as much effort into documenting this new language. So you end up with a worse subset of rust.

They also increase compile times.

### Derive macros

This was another option I explored but macros are hard and I couldn't get it to work.

```rust
use agape::{widgets::*};

#[derive(Widget)]
struct SubscribeButton {
    id: GlobalId,
    #[child]
    child: Button<Text>
}

impl SubscribeButton {
    pub fn new() -> Self {
        let child = Button::new()
            .on_click(||println!("Subscribed!"))
    
        Self{
            id: GlobalId::new(),
            child
        }
    }
}
```

### Elm architecture

[Point in time](https://github.com/snubwoody/agape-rs/tree/eaeb0950472b3ad022cee3a89abe3cf9fcfff85d)

Finally I settled on the [elm architecture](https://guide.elm-lang.org/architecture/), which is broken into three parts:

- `Model`: The state of your application
- `View`: A graphical representation of state
- `Update`: A way to update state based on messages

I was inspired by [Bubble Tea](https://github.com/charmbracelet/bubbletea?tab=readme-ov-file), while it's a terminal UI framework, the elm architecture seems to work quite well for it. So the idea is that you have a higher level object (`View`) which returns a lower level object (`Widget`), which actually handles state, layout and rendering .

```rust
pub trait View {
    type Widget: Widget;
    
    fn update(&mut self, _: &State, _: &mut MessageQueue) {}
    
    fn view(&self) -> Self::Widget;
}
```

This worked pretty well with rust's ownership model. The message queue was basically a `Vec` of the `Any` trait, so any type could be sent over. The reason the widget is an associated type is because you can't have generics in a trait and still have it be `dyn` compatible. Another option is returning a `Box<dyn Widget>`, which works but you would have to return `Box::new` every time and I just felt like that slightly annoying.

```rust
use agape::state::Context;
use agape::widgets::{Button, View, *};
use agape::{App, MessageQueue, hstack};

fn main() -> agape::Result<()> {
    App::new(Counter::default()).run()
}

#[derive(Debug)]
struct Increment;

#[derive(Debug)]
struct Decrement;

#[derive(Default)]
struct Counter {
    count: i32,
}

impl View for Counter {
    type Widget = HStack;

    fn update(&mut self, msg: &mut MessageQueue) {
        if msg.has::<Increment>() {
            self.count += 1;
        }

        if msg.has::<Decrement>() {
            self.count -= 1;
        }
    }

    fn view(&self, _: &mut Context) -> Self::Widget {
        hstack![
            Button::text("Subtract").on_click(|msg| msg.add(Decrement)),
            Text::new(&format!("{}", self.count)),
            Button::text("Add").on_click(|msg| msg.add(Increment)),
        ]
        .spacing(24)
        .fill()
        .align_center()
    }
}
```

It was quite hard to sync the trees, I also didn't really have a clear distinction of what a `View` is and what a `Widget` is, apart from one being higher level than the other. So it wasn't always clear what should be implemented where.

Although I think of all the architectures I tried this would be the best.


## Events

Because of the elm architecture I didn't experience this much, but I thought it would be important to note...

Graphical applications are driven by events: do `this` when the user presses that button. In most frameworks/languages this is implemented as a simple function, so you can do whatever you would like.

**HTML**: 

```html
<button onclick={()=>console.log("Subscribed")}>Subscribe</button>
```

**Flutter:**

```dart
class DeleteAccount extends StatelessWidget{
    final String accountId;
    const DeleteAccount({super.key, required this.accountId});

    @override
    Widget build(BuildContext context) {
        return ElevatedButton {
            onClick: () => deleteAccount(accountId)
            child: Text("Delete account")   
        }
    }
}
```

**Jetpack compose:**

```kotlin
@Composable
fun DeleteAccount() {
    // TODO: check this
    Button(onClick = { print("") }) {
        Text("Delete account")
    }
}
```

So my idea was to implement the same thing in rust, using closures:

```rust
use agape::{App,widgets::*};
use auth::delete_account;

struct DeleteAccount {
    account_id: String
}

impl View for DeleteAccount {
    type Widget = Button<Text>;


    fn view(&self) -> Self::Widget {
        // Won't compile
        Button::text("Delete account")
            .on_click(||delete_account(&self.account_id));
    }
}
```

The issue is that closures have very unergonomic semantics. Closures capture their environment which means you either have to move values into the closure or pass by reference. If you pass by reference, the reference must live at least as long as the closure (otherwise it's an invalid reference). This means it's basically impossible to use the widget's own data in the closure, which leads to more levels of indirection.

The second half is storing closures is hard. Closures are traits:

- [`Fn`](https://doc.rust-lang.org/std/ops/trait.Fn.html)
- [`FnOnce`](https://doc.rust-lang.org/std/ops/trait.FnOnce.html)
- [`FnMut`](https://doc.rust-lang.org/std/ops/trait.FnMut.html)

`FnOnce` takes `Self` as a parameter, so it can only be run once, you most likely want to run the action more than once, so that can't be used. `Fn` can not capture moved values and it can't mutate captured values, so `FnMut` is the only real choice.

Since closures are traits they must be stored on the heap behind a pointer. So the first choice would probably to `Box` the closure.

```rust
use super::Widget;

struct Button<W: Widget>{
    on_click: Box<dyn FnMut()>
    child: W
}
```

This works fairly well, although it means that your types won't be clonable.


## Async

I didn't get to this part but I was always wondering how async would be handled. GUI's are inherently async and you might to write async code, such as HTTP requests. The key problem here is how rust's async functions work: they are lazy.

>Exactly, IMHO at least, JS doesn't suffer from the coloring problem because you can call async functions from sync functions (because the JS Promise machinery allows to fall back to completion callbacks instead of using await). It's the 'virality' of await which causes the coloring problem, but in JS you can freely mix await and completion callbacks for async operations).

In Javascript and Dart you can call an async function from a sync function and it will run in the background.

```html
<script lang="ts">
    let userId = "...";

    async const deleteUser = (userId: string) => {
        ...
    }
</script>

<button onclick={() => deleteUser(userId)}>
    Delete account
</button>
```

```dart
class DeleteAccount extends StatelessWidget{
    final String userId;
    const SubscribeButton({super.key, required this.userId});
    
    Future<void> deleteUser() async{
        ...
    }
    
    @override
    Widget build(BuildContext context){
        return Button{
            onClick:() => deleteUser(),
            child: Text("Delete account"),
        }
    }
}
```

Even though we don't `await` the functions they still run in the background and for most purposes that's enough. In rust however, async functions are lazy, which means we must call `.await` to do any work on them. This means you can't have something like:

```rust
use agape::{widgets::*};

async fn delete_user(user_id: &str) {
	...
}

struct DeleteAccount;

impl View for DeleteAccount{
	type Widget = Button<Text>;
	
	fn view(&self) -> Self::Widget {
		Button::text("Delete account")
			.on_click(|| delete_user("..."))
	}
}
```

The async function will not do any work unless we `.await` it. This forces you into trying to fit a runtime somewhere in this, which gets ugly really fast. Some options (which I didn't try) are:

- Add an `AsyncView` trait
- Add a runtime in the view context
- Add a global runtime

I contemplated making the whole library async.

## Resources

- [Yew PR](https://github.com/yewstack/yew/pull/2972)
