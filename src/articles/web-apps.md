---
title: How everything became a Web App
author: Wakunguma Kalimukwa
published: 2025-06-23
image: /internal/thumbnails/rust-weird-expressions.png
imageAsset: ../assets/internal/thumbnails/rust-weird-expressions.png
imageSize: 1200000
synopsis: Everything is a web app these days, but it wasn't always like that.
preview: true
tags:
  - Apps
---

You may have noticed that a lot of software these days is a web app, but it wasn't always like that.

There's two sides to the web apps: websites and apps packed using a webview, electron, tauri and so on.

- Website: A website hosted on a server, accessed through a browser
- Web app: An application using the system webview or other such browser technologies
- Native app: An application not using browser technologies


## Lack of tooling

There is a lack of cross-platform tooling for creating apps.

As an small group or individual, you just don't have the time and resources to create multiple apps for
multiple platforms with the **same quality**. So reaching for a
website will save you an enormous amount of time.

Many operating systems have system libraries and native features that aren't made easily accessible across languages. For example, if you wanted to create an IOS app that uses widgets
you cannot use rust, go or any other language than SwiftUI.
This limits the experience that developers are able to create
with non-standard tools.

It wouldn't be crazy to say that the developer experience of making a webapp is better that that of making a
native app. At least when it comes to maintenance and support. Apps suffer from platform specific issues and quirks.

### Seamless updates
Deploying is also just much easier for webapps, just (re-)deploy the app to the server and all users
simultaneously have the new updated version. Deploying a native app involvs multiple distribution
channels, multiple stores and certification processes this can take days or weeks. And if your app was
installed with an installer like `exe` installers then it will have to update itself manually or users
will have to download and install new updates themselves.


### Windows
On windows there have been **many** native toolkits, but Microsoft doesn't seem to manage these for very long.

- [WPF](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/)
- [WinRT](https://learn.microsoft.com/en-us/windows/apps/develop/platform/csharp-winrt/)
- [Windows forms](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/overview/)

The windows [smart screen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/)
exists to notify users about potentially dangerous apps. As a devloper
you will either have to get an OV certificate, which costs $100 a year,
or an EV certificate which costs about $400 and removes the smart
screen immediately.

### MacOS & IOS
Apple is probably the best when it comes to actually supporting toolkits, on Macs you can use SwiftUI to create desktop apps, throughout the years Apple has updated this toolkit and it typically receives with every major version of Apple OS's. The only issue is that is closed source, which is usual for Apple but very unusual for developer tools. It's very rare to find a library that's not open source, even if it interacts with closed source tech, Window's API's are all open source and the whole of Linux of open source. I bring up this issue because, while SwiftUI has great support, documentation and guides are few and far between, has it been open source these would have been community driven.

### Linux
Linux is the land of the free, however, supporting apps on linux is hard.
On Linux I'm not really sure if native has a meaning but there's
[Gtk](https://docs.gtk.org/gtk4/) and [Qt](https://www.qt.io/).

Windows and MacOS have the benefit of always having the same
libraries and software. Then there's the issue of drivers,
however this is getting better.

## Features
Certain features and categories of apps just need to use system API's. A file explorer, for example, is not feasible to create as a website. Even basic controls like the camera are heavily guarded on the web.

## Security
Websites are typically more secure, browsers have gone through great lengths to expose as little as possible about the underlying operating system. On Android and IOS similar efforts have been made, as apps are sandboxed and only allowed to access their own resources, but on desktop it's fair game. Apps on desktop are simply executables and there's not that many restrictions on what resources a desktop app can access.

Security is a complex topic, but in terms of how much data the app can access.

The 2000s were plagued with viruses being installed as executables,
videos and such things. So installing an executable to run on your
device was considered, and still is, high risk. So if the
same app is available as a website, where it's sandboxed well
the choice is clear.

Desktop apps rely mostly on user trust, even if signed, they still
have as much access as they desire, pretty insane when you think
about it. Mobile apps are a lot more sandboxed and generally
don't have access to system resources, however they can still
request access to resources like your contact list and
images.

## But I like native

I personally like apps more,...

Apps generally have more features than websites, so if I can help
it I usually prefer apps, especially on mobile. For example,
getting widgets about order, rides and similar stuff, can
only be done on a website.

Native apps usually feel better and more responsive than web apps although this is subjective. Native apps like
Excel (written in C++) feel more responsive than Notion.

### Performance
A native app will usually have better performance that an equivalent web app written in Electron or otherwise framework using a WebView. All web apps have the overhead of of a web view plus all the other browser technologies running. With native apps you only pay for what you use.

## Privacy and security

- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security#relationship_between_security_and_privacy)
- [MDN Privacy](https://developer.mozilla.org/en-US/docs/Web/Privacy)


> Security is the act of keeping private data and systems protected against unauthorized access. This includes both
> company (internal) data and user and partner (external) data.
> Privacy refers to the act of giving users control over how their data is collected, stored, and used, while also ensuring
> that it is not used irresponsibly. For example, you should let your users know what data you are collecting from them,
> the parties with whom it will be shared, and how it will be used. Users must be given a chance to consent to
> your privacy policy, have access to their data you store, and delete it if they choose to.


### Security
Websites can be more private that apps. Disregarding the personal information that you choose to share
like your email address. Apps, in particular desktop apps, have much more access than websites. It 100%
possible for an app on your PC to collect all the information in your `%APPDATA%` folder and sent it to
a private server periodically. On the other hand web browsers don't share much of your information, and
sometimes outright fake it.

On IOS apps can only access their own folder and android...

Browser vulnerabilities like XSS are well known.

Websites are generally safer by default. Apps have more access to local resources, on desktop there's little to no sandboxing of apps, which means
that they are free to access a large amount of the resources on your device. Websites are sandboxed and can only access the information that you
give them. So overtime, people gravitated to websites for common things like watching videos, because there was just less risk, most websites
only really have your email and password.

### Privacy
Privacy on the web is something... there's many ways to track people on the web, so I think, if you trust the developers, apps are inherently more private
that apps.

When browsing the web you can be fingerprinted,
Developers have nore control in the app...

## Resources
- Post on Substack?
