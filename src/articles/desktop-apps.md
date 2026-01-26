---
preview: false
title: The horrible landscape of desktop app development
author: Wakunguma Kalimukwa
synopsis: ""
image: /internal/thumbnails/desktop-apps.png
imageAsset: ../assets/internal/thumbnails/desktop-apps.png
imageSize: 0
published: 2026-01-25
tags:
  - GUI
---

Developing apps on desktop is difficult. Desktop platforms don't really have the official 
frameworks and tools like mobile platforms. Even more so, if you are trying to create a cross-platform 
app, there are few truly good, cross-platform GUI frameworks.


## Mobile app development
As a precursor, let's discuss app development on mobile platforms. On IOS the official frameworks are SwiftUI 
and UIKit, with SwiftUI being the newer, more modern framework. On Android the official framework is Jetpack 
Compose. Both SwiftUI and Jetpack Compose are kept up to date with each release of IOS and Android respectively; 
as such these frameworks will always have the latest features. You also benefit from official guides and documentation.
Anything that you can do as a developer on mobile should be accessible through these frameworks.

Cross-platform frameworks exist as well, like Flutter and React Native, which make it easier to develop 
for both platforms with a single codebase.

In summary on mobile, you could either use native frameworks or cross-platform frameworks, both of which are 
good, battle tested options.

## Desktop app development

On desktop the options are a bit less clear. There isn't really a single cross-platform framework 
that you can use for all platforms.

### MacOS

On macOS the official framework is SwiftUI, which is kept up to date with the latest version of macOS. 
To build apps for macOS, you will need Xcode and Mac device. Additionally, to 
[sign](https://developer.apple.com/documentation/security/code-signing-services) apps you need to be 
part of the Apple Developer Program, which costs about USD $99 a year. Unsigned apps cannot be run on a 
user's machine without disabling additional security checks.

### Windows

Unlike macOS, Windows doesn't really have a single official GUI framework. Instead, throughout 
the years, Microsoft has published "new and improved" frameworks every couple years, and slow stopped
supporting its old ones. So there are more than a couple native frameworks:

- [Windows Forms](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/overview/)
- [WPF](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/)
- [Win UI 3](https://learn.microsoft.com/en-us/windows/apps/winui/winui3/)
- [.Net MAUI](https://learn.microsoft.com/en-us/dotnet/maui/?view=net-maui-10.0)
- [React Native for Windows](https://github.com/microsoft/react-native-windows)

Publishing apps on Windows is free, any `.exe` file can be run, unlike macOS. However, applications 
need to be signed in order to avoid the 
[Windows Defender SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/) 
from flagging the executable. Signing can cost anywhere from $100 to $400 a year. For apps that are not signed, 
the smart screen *may* go away eventually after enough time and enough downloads, however there aren't any 
official reports on this. One way to evade the code signing requirement is by publishing your app to the 
Microsoft store, apps published this way will be signed by Microsoft on the servers.

### Linux

On Linux the biggest two frameworks are [Qt](https://www.qt.io/)and [GTK](https://www.gtk.org/), 
making the choice easier compared to Windows. Both Qt and GTK double as cross platforms. Publishing 
apps on Linux is free. Signing on Linux exists in some capacity: apps do not have to be signed to 
be run, however most package managers sign packages for security purposes.

Distribution on Linux can be a pain since you will need to distribute your app on different package 
managers, however many you wish to support. There is no single package manager, but the closest 
thing is [Flatpak](https://flatpak.org/).

On Linux there is no native look, since there are thousands of distros. There's the KDE design 
and the Gnome design, and then there's dozens of other desktop environments, and even people that 
[rice](https://www.reddit.com/r/unixporn/) their system and create their own custom look. So if you 
wanted to create a native look, you're best bet is targeting Gnome or KDE.

### Cross-platform

To develop for Windows, macOS and Linux you would either need to create 3 separate apps or use
a cross-platform framework. Creating three is a lot of work, 
especially for smaller teams. The three apps can **never** be exactly the same, so you will be 
cursed to deal with platform specific issues, and new features will have to be replicated for each app.

When it comes to cross-platform frameworks there's web based and "native" frameworks. Web based 
frameworks, like [Electron](https://www.electronjs.org/), use browser technologies to create 
applications. Since websites have become lightweight in modern times, this works fairly well. 
But browsers were designed for the web so a number of issues arise. For one, these frameworks usually 
embed an entire browser engine with your application, which means performance and size take a hit. 
Security also needs to be taken more seriously, websites allow running arbitrary third party scripts, 
which works fine for browsers but not applications on a user's machine.

"Native" or non web based frameworks, like Flutter and Qt, draw custom graphics to the screen, 
typically via graphics API's or rendering engines like Skia. Because of this they typically have 
better performance and less resource usage. They can also emulate native controls and UX better.
