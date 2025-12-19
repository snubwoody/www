---
title: Why is windows so slow
preview: true
author: Wakunguma Kalimukwa
synopsis: Dozens of services, only one app
image: /internal/thumbnails/hosting-rust.png
imageAsset: ../assets/internal/thumbnails/hosting-rust.png
imageSize: 12
published: 2025-05-23
tags:
  - Windows
---

- Disk usage
- Anti-virus
- IO

I haven't used Linux in a while, but I remember when I did I would be **quite**
shocked at the low resource use while I was using my PC, coming from Windows. 

My ram usage is consistently closer to 100% even though my computer is not doing 
anything worthwhile.

![](../assets/external/windows-performance/ram-screenshot.png)


![](../assets/external/windows-performance/process-screenshot.png)

I wonder if this is due to the fundamental design of the operating system architecture
or just accumulating crap over the years.  I rarely ever use windows with a ram usage <60%.

I'm not here to hate on windows just genuinely curious, windows github action runners
also have (LINK) slower performance than linux and macos.

Maybe it's Docker and I forgot to drop some images.

```bash
docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# No images
```

But that's not it.


Most applications in windows run separate background processes, for updating,
telemetry and so on.


```bash
tasklist | findstr /i "Figma"

Figma.exe                    16716 Console                    1     37,980 K
Figma.exe                     1540 Console                    1      1,504 K
Figma.exe                    19380 Console                    1     11,912 K
Figma.exe                    15800 Console                    1     16,420 K
Figma.exe                     1464 Console                    1      2,364 K
Figma.exe                    26112 Console                    1     20,316 K
figma_agent.exe              22168 Console                    1      5,488 K
```

```bash
tasklist | findstr /i "node"

node.exe                     89960 Console                    1     57,056 K
node.exe                     88732 Console                    1  1,169,024 K
node.exe                     70220 Console                    1        144 K
node.exe                     89944 Console                    1    327,988 K
node.exe                     66208 Console                    1    451,376 K
node.exe                     56784 Console                    1    148,464 K
node.exe                     64012 Console                    1     59,576 K
```

I suspect windows defender is a big portion of this resource usage.

`MsMpEng.exe`

TODO: try creating go program to stack trace I/O

Windows has [file system filters](https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/about-file-system-filter-drivers)
which attach to the file system. They can monitor, filter, modify or even prevent I/O operations.

```bash
fltmc filters

Filter Name                     Num Instances    Altitude    Frame
------------------------------  -------------  ------------  -----
bindflt                                 1       409800         0
UCPD                                    5       385250.5       0
WdFilter                                5       328010         0
storqosflt                              1       244000         0
wcifs                                   0       189900         0
gameflt                                 2       189850         0
CldFlt                                  1       180451         0
bfs                                     7       150000         0
FileCrypt                               0       141100         0
luafv                                   1       135000         0
UnionFS                                 0       130850         0
npsvctrig                               1        46000         0
Wof                                     2        40700         0
FileInfo                                5        40500         0

fltmc instances
Filter                Volume Name                              Altitude        Instance Name       Frame   SprtFtrs  VlStatus
--------------------  -------------------------------------  ------------  ----------------------  -----   --------  --------
CldFlt                C:                                        180451     CldFlt                    0     0000000f
FileInfo                                                         40500     FileInfo                  0     0000000f
FileInfo              C:                                         40500     FileInfo                  0     0000000f
FileInfo                                                         40500     FileInfo                  0     0000000f
FileInfo              \Device\Mup                                40500     FileInfo                  0     0000000f
FileInfo              G:                                         40500     FileInfo                  0     0000000f
UCPD                                                            385250.5   UCPD - Top Instance       0     0000000f
UCPD                  C:                                        385250.5   UCPD - Top Instance       0     0000000f
UCPD                                                            385250.5   UCPD - Top Instance       0     0000000f
UCPD                  \Device\Mup                               385250.5   UCPD - Top Instance       0     0000000f
UCPD                  G:                                        385250.5   UCPD - Top Instance       0     0000000f
WdFilter                                                        328010     WdFilter Instance         0     0000000f
WdFilter              C:                                        328010     WdFilter Instance         0     0000000f
WdFilter                                                        328010     WdFilter Instance         0     0000000f
WdFilter              \Device\Mup                               328010     WdFilter Instance         0     0000000f
WdFilter              G:                                        328010     WdFilter Instance         0     0000000f
Wof                   C:                                         40700     Wof Instance              0     0000000f
Wof                                                              40700     Wof Instance              0     0000000f
bfs                                                             150000     bfs                       0     0000000f
bfs                   C:                                        150000     bfs                       0     0000000f
bfs                                                             150000     bfs                       0     0000000f
bfs                   \Device\Mailslot                          150000     bfs                       0     0000000f
bfs                   \Device\Mup                               150000     bfs                       0     0000000f
bfs                   \Device\NamedPipe                         150000     bfs                       0     0000000f
bfs                   G:                                        150000     bfs                       0     0000000f
bindflt               C:                                        409800     bindflt Instance          0     0000000f
gameflt               C:                                        189850     gameflt Instance          0     0000000b
gameflt                                                         189850     gameflt Instance          0     0000000b
luafv                 C:                                        135000     luafv                     0     0000000f
npsvctrig             \Device\NamedPipe                          46000     npsvctrig                 0     00000008
storqosflt            C:                                        244000     storqosflt                0     0000000f
```

## Resources

- [Github discussion](https://github.com/Microsoft/WSL/issues/873#issuecomment-425272829)
> Windows's IO stack is extensible, allowing filter drivers to attach to volumes and 
> intercept IO requests before the file system sees them. This is used for numerous 
> things, including virus scanning, compression, encryption, file virtualization, 
> things like OneDrive's files on demand feature, gathering pre-fetching data to 
> speed up app startup, and much more. Even a clean install of Windows will have a 
> number of filters present, particularly on the system volume 
> (so if you have a D: drive or partition, I recommend using that instead, since it 
> likely has fewer filters attached). Filters are involved in many IO operations, 
> most notably creating/opening files.

> The NT file system API is designed around handles, not paths. Almost any operation 
> requires opening the file first, which can be expensive. Even things that on the 
> Win32 level seem to be a single call (e.g. DeleteFile) actually open and close the 
> file under the hood. One of our biggest performance optimizations for DrvFs which 
> we did several releases ago was the introduction of a new API that allows us to query 
> file information without having to open it first.

- [Windows NT contributor](https://blog.zorinaq.com/i-contribute-to-the-windows-kernel-we-are-slower-than-other-oper/)
- [Understanding windows IO](https://www.microsoftpressstore.com/articles/article.aspx?p=2201309&seqNum=3)
- [File system filters](https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/about-file-system-filter-drivers)

## Conclusion
I consider myself a power user, but I still think these results apply to people in general.

Although for an operating system that is decades old and has to support decades old software,
otherwise it will get sued, and is being depended on by the whole planet, windows isn't doing
too bad.
