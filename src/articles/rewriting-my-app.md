---
preview: false
title: Rewriting my app in Slint
author: Wakunguma Kalimukwa
synopsis: ""
image: /internal/thumbnails/desktop-apps.png
imageAsset: ../assets/internal/thumbnails/desktop-apps.png
published: 2026-09-12
tags:
  - App Development
---

A while ago I started working on a [budgeting app](https://github.com/snubwoody/folio) because I wanted something that could manage my finances. I used Tauri because I was familiar with the web ecosystem.

A while ago, I decided to make a [budgeting app](https://github.com/snubwoody/folio) in Tauri. However, after a few months of working on it, there were just too many issues I faced with Tauri that led me to stop development completely. But I actually used Folio personally so I still wanted to work on it and improve it I just wanted to move away from Tauri, mostly because of the web ecosystem. I started experimenting with different GUI frameworks. I decided to rewrite it firstly because I don't like the browserfication of desktop apps, the fact that simple apps are using so much RAM and storage space is a shame. AI is making RAM and storage expensive, so maybe a recession will make optimisation popular again. The new app is [Mukwa](https://github.com/snubwoody/mukwa).

I wanted a cross-platform framework...

## My experience with Tauri

Firstly I want to describe my experience with Tauri, things I liked about it and things I did not. The good thing about Tauri was that I had the whole web ecosystem to choose from. If I could not find a library to do what I wanted in Rust, then it would certainly be on NPM. Similarly, the popularity of the web ecosystem meant that when I got stuck on a problem I could probably find a post from someone that came across the same problem on Stack Overflow, Reddit or GitHub.

One of the pros of Tauri was that I had the whole web ecosystem to choose from.

As for the things I didn't enjoy with Tauri, well there's a lot of them. JavaScript is a strange language, TypeScript makes it much better to deal with, but still, the type system is more of a suggestion than an actual requirement. At runtime there are no types so weird errors can happen. People say that TypeScript/JavaScript is easier than Rust, and that may be true, but it's so much harder to write code that works in TypeScript. Things used to break all the time. 

Part of the reason behind this was that it was hard to test the frontend code. Tauri seperates the frontend and backend code, communication between the two is done via IPC. But this separation caused more trouble than it was worth. For one all types passed via IPC must be JSON serialisable. There is no automatic type generation so the backend and frontend code would fall out of sync regularly. Frontend code that relied on backend code had use mocks it in tests. 

Maybe this is all bad coding on my part.

IPC made structuring things hard. Should something be implemented in Rust for better guarantees at the risk of making it harder to test from the frontend? Or should something be implemented in TypeScript making it easier to call but less guarantees?

The NPM ecosystem moves fast and breaks things all the time. There is no official linter, no official formatter. There is always a new linter/framework/runtime being developed, and obviously it's better than all the other. People keep reimplementing things. There's dozens of test libraries, formatters, linters. People even write different JavaScript runtimes. Overall it's not a stable base for an application.

HTML was not designed to model applications, and you can definitely feel it.

## Rewrite phase

I started experimenting with different GUI frameworks. I went on to try Flutter, which is managed by Canonical on desktop and is their main framework for Ubuntu apps (don't think so actually?), so at least it's well supported. Flutter is a good framework, but Dart isn't a very good language (not sure about this). It's just slightly worse than other languages in every area. One weird Dart choice is that the default indent size of 2 spaces for `dart fmt` cannot be configured[^2][^3], which seems like a weird hill to die on. The main issue I had with Flutter is verbosity, creating custom widgets would take hundreds of lines of code and would require me learning the intricacies of how the Flutter engine worked.

Next I tried Qt, and I don't think you can go wrong with Qt. It's a very good and mature framework. Some of my favourite apps use Qt: Davinci Resolve, PureRef, PrismLauncher, and they all have good UX. It's having to use C++ that ultimately led to me not choosing Qt. I have not used C++ much and so I don't know what's considered good and bad code. I always hear people complaining about the issues that C++ has like [`std::vector<bool>`](https://cplusplus.com/reference/vector/vector-bool/) being bitpacked. Many times when writing code I would search "Is xxx safe to do in C++".

Firstly the build system, whether I used CMake, Meson or XMake I would have build issues.

I tried Compose Multiplatform, but gradle was weird.

There were other Rust frameworks like Iced but I don't like writing the actual UI code in Rust. Avalonia, as well, seems like a good framework, I just didn't really have time to try it.

Then I finally decided to try Slint, which is made by ex-Qt devs. And that's what I ultimately chose to stick with.

## My experience with Slint

I really like the Slint language, it is very well thought out. Ever since trying, and failing, to make my own Rust [GUI framework](https://github.com/snubwoody/agape-rs), I realised that Rust might not be the best language for describing user interfaces. There's a lot of shared state in applications which don't map well to Rust's single ownership principle. I believe these are the same reasons game dev in Rust hasn't taken off[^1]. In contrast, the Slint language makes writing and composing user interfaces very easy and intuitive. It has primitives for colours and length, built in translation and accessibility, two way property bindings, callbacks and so on.

I like that Slint is more of a basic framework instead of a batteries included one. It does not concern itself with logging, networking, packaging or any such things. It cares about the user interface and nothing else. Neither approach is inherently bad, but I prefer Slint's approach. I also like that my app is distributable as a single small executable. The final binary is fast and small and on my machine it uses < 50MB of RAM.

### Things I don't like about Slint

Slint is a programming language but the Slint developers want to encourage people to write most of the logic in Rust and so it is not turing complete (?), so there are some operations that cannot be done in the Slint language that lead to more boilerplate and worse ergonomics. For example, Slint arrays can not be mapped (or filtered or any other operations) so something like the following can't be implemented:

```slint
struct File {
    name: string,
    path: string
}

export global State {
    in-out property<[File]> files;
}

ComboBox {
    options: files.map(file => { text: file.name, value: file.path });
}
```

Slint components cannot be exported to Rust if they do not inherit the Window component (not sure about this), so if you have a nested component and want to have a callback on that component only, it must be implemented as a global callback.

Slint does not have a test suite for testing the GUI code like [Qt Test](https://doc.qt.io/qt-6/qtest-overview.html) or [Flutter's test suite](https://docs.flutter.dev/cookbook/testing/widget/introduction). There is a [testing crate](https://crates.io/crates/i-slint-backend-testing), but it is unstable and marked as an internal crate. However, since the Slint code compiles down to Rust and because Slint heavily encourages you to implement functionality in the backend, this isn't as bad as it would be in other GUI frameworks. But still testing the frontend code is still extremely important and I'm suprised that it wasn't implemented by 1.0.

One potential drawback is that Slint is licensed under the GPL V3 or a royalty free license. This isn't an issue for me because my app uses GPL V3 but it does limit your options, and not everyone would like these licenses. The Rust ecosystem does not use dynamic linking much so an LGPL V3 license like Qt is probably not going to happen anytime soon.

There's a bunch of other small annoyances that I have with Slint:

- There is no Linter for the Slint language
- The formatter does not indent code under comments 

Overall I think Slint is one of the most promising GUI frameworks in Rust. Most of the issues I have are issues of a new/young framework, so to a certain degreee it is to be expected.

## Resources
- [The three pillars of JavaScript bloat](https://43081j.com/2026/03/three-pillars-of-javascript-bloat)
- [Why Golang instead of Rust to develop the Krater desktop app](https://blog.moonguard.dev/why-golang-instead-of-rust-to-develop-the-krater-desktop-app)

[^1]: [Leaving Rust gamedev after 3 years](https://loglog.games/blog/leaving-rust-gamedev/)
[^2]: https://github.com/dart-lang/dart_style/issues/1683
[^3]: https://github.com/dart-lang/dart_style/issues/534
