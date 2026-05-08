---
title: Jujutsu is pretty good
author: Wakunguma Kalimukwa
published: 2025-06-23
image: /internal/thumbnails/rust-weird-expressions.png
imageAsset: ../assets/internal/thumbnails/rust-weird-expressions.png
imageSize: 1200000
synopsis: Explore weird quirks of rusts type system
preview: false
tags:
  - Version control
  - Jujutsu
---

I've been using [Jujutsu](https://github.com/jj-vcs/jj) as a VCS for the past couple months and it's been pretty good. Jujutsu is a new version control system, that abstracts the user interface from the storage system. This means it's possible to use it with many backends, Mercurial, Git, Subversion. So these are the highlights of my favourite features and experience.

Jujutsu doesn't have anything that Git can't be done in Git, but it makes things so much easier.

At the time of writing Jujutsu is on v0.41.0

In Jujutsu, changes to the repo are represented as a "change", backed up with a git commit (if using a git backend). Every change has a consistent change id, as well as a commit id for the git commit, which can change under certain operations [??]. The current working copy is also a change, any changes to files are tracked. There is no index or staging area. Most `jj` commands will update the working copy.

>So we are protected from accidentally deleting stuff on the `main` branch. Protected commits are called **immutable** and Jujutsu represents them in the log graph with a **diamond** (**`◆`**) symbol. Unprotected commits are called **mutable** and represented with a **circle** (**`○`**). These protections don't just apply to `jj abandon` and `jj rebase`, but to all commands that edit existing history. We'll learn about a lot of commands like that in the next level.


```
**Git users:** The commit ID/hash is what you're used to from Git and should match what you see when you look at the repository using `git log` in a Git checkout of the repository. The change ID however, is a new concept, unique to Jujutsu.
```

## Editing

- `jj arrange`

## Revsets

[Revsets](https://docs.jj-vcs.dev/latest/revsets/) is a functional language that describe changes in a Jujutsu repository. For convenience, changes can be referred to using a short id, which is highlighted in the terminal. Revsets is an entire language, but the features I use the most are:

- `x-`: Parents of `x`
- `x+`: Children of `x`
- `x::`: Descendants of `x`, including `x` itself
- `::x`: Ancestors of `x`, including `x` itself

Let's say you made a couple changes and you simply want to get rid of them. You can `jj abandon` those specific changes and (if there's no conflicts) move on. `jj abandon -r x::y` [check]

You can get fairly wild with these though `jj squash -r "description(Format) | description(Lint)"`

```bash
@  nrsyvtsv contact@wakunguma.com 2026-05-04 20:51:35 cd070cb7
│  (empty) (no description set)
○  vmytxsvu contact@wakunguma.com 2026-05-04 20:51:35 6a20a66a
│  Run cargo clippy
○  oxpztmrr contact@wakunguma.com 2026-05-04 20:51:05 ffd6221d
│  Show app version in settings panel
○  sttllttz contact@wakunguma.com 2026-05-04 20:50:24 d89ed721
│  Format code
○  kulvtuzy contact@wakunguma.com 2026-05-04 20:49:58 536eac2e
│  Add export button
○  xzptptkm contact@wakunguma.com 2026-05-04 20:46:50 20a39ac3
│  Initial commit
◆  zzzzzzzz root() 00000000
```

The simplest way to refer to a change is using the change id `jj log -rzzzzzz`

## Operations
In JJ every operation performed on the repository is stored. Every single thing, changes, rebasing, squash, edits, deletions. After every change, a snapshot of the previous repo state is stored, meaning every operation can be undone using `jj undo`. Although some operations, like `jj git push`, can't really be undone, how would you even unsend a request?

## Branches -> Bookmarks

Git works via branches everything is a branch. Work on changes in a specific branch then merge or rebase those onto another branch. JJ works a bit differently.

The jj equivalent of branches would be bookmarks. When you `jj git init`, in an existing repo, all the branches are "converted" to bookmarks.

Although saying JJ's bookmarks are Git's branches, is true, it's an oversimplification. Bookmarks are simply pointers to a change. Multiple bookmarks can point to the same change, in fact this is how origins are tracked `main` and `main@origin` both point to the same change (if they are tracked). In Git, you can't really have two coexisting branches, that both have the same changes [can you?]. 
## Crap!

One of my favourite parts of JJ is the editable commit history. I was pretty sceptical about this when I first heard of it, it seems like it would be a nightmare to maintain. But it works best when 

`jj undo` is one of the best things to ever happen to my workflow. Grub is dumb and grub messes up sometimes.

- `jj split`
- `jj diffedit`


## How Jujutsu handles conflicts

Something that caught me off guard is how Jujutsu is that it stores conflicts as a change. Coming from Git, this is quite strange because Git conflicts halt the entire operation, preventing you from moving forward.

We can create a simple conflict, as demonstration, by updating the same file on different branches and rebasing the commits.

```bash
jj log
@  wyssxxxw contact@wakunguma.com 2026-05-07 07:08:38 86e4f491
│  Update README.md
│ ○  znuxrtvt contact@wakunguma.com 2026-05-07 07:07:58 2169d89d
├─╯  Update README.md
○  nlzuoxnx contact@wakunguma.com 2026-05-07 07:07:03 b7364d52
│  Create README.md
◆  zzzzzzzz root() 00000000

jj rebase -ozn
Rebased 1 commits to destination
Working copy  (@) now at: wyssxxxw 5b112f25 (conflict) Update README.md
Parent commit (@-)      : znuxrtvt 2169d89d Update README.md
Added 0 files, modified 1 files, removed 0 files
Warning: There are unresolved conflicts at these paths:
README.md    2-sided conflict
New conflicts appeared in 1 commits:
  wyssxxxw 5b112f25 (conflict) Update README.md
Hint: To resolve the conflicts, start by creating a commit on top of
the conflicted commit:
  jj new wyssxxxw
Then use `jj resolve`, or edit the conflict markers in the file directly.
Once the conflicts are resolved, you can inspect the result with `jj diff`.
Then run `jj squash` to move the resolution into the conflicted commit.

jj log
@  wyssxxxw contact@wakunguma.com 2026-05-07 07:09:00 5b112f25 (conflict)
│  Update README.md
○  znuxrtvt contact@wakunguma.com 2026-05-07 07:07:58 2169d89d
│  Update README.md
○  nlzuoxnx contact@wakunguma.com 2026-05-07 07:07:03 b7364d52
│  Create README.md
```

Jujutsu stores the conflicted state as a change, allowing you to continue the rest of your work, and handle the conflict whenever necessary. The "2-sided conflict" refers to the `main` branch and the branch being rebased. Merging multiple conflicting branches can result in `n-sided` conflicts. (example...)

```text
<<<<<<< conflict 1 of 1
%%%%%%% diff from: nlzuoxnx b7364d52 "Create README.md" (parents of rebased revision)
\\\\\\\        to: znuxrtvt 2169d89d "Update README.md" (rebase destination) (no terminating newline)
-
+# JJ Blog
+++++++ wyssxxxw 86e4f491 "Update README.md" (rebased revision) (no terminating newline)
# New information
>>>>>>> conflict 1 of 1 ends
```

We can edit this like any text based conflict and resolve it.

```md
# New information
```

The output of `jj st` will show that the conflict has been resolved.

```
jj st
Working copy changes:
M README.md
Working copy  (@) : wyssxxxw d933302f Update README.md
Parent commit (@-): znuxrtvt 2169d89d Update README.md
```

There are lots of benefits to this approach, for example, you could just discard the commit. Act like it never happened. This probably only works in the rare occasion where you were going to abandon that file anyways.

We can also continue with the repo and fix the conflict later. This is the real benefit.
Say the conflict only affects certain files that you don't plan on working on, you can leave the commit as is, finish the work, and then resolve the conflict when you're ready. (example...)

Another workflow instead of creating a new commit, is editing the conflicted commit directly. This is where Jujutsu's mutable commits come in handy.

This comes with a caveat, however, conflicted changes cannot be pushed to git remotes.

`jj git push` will not push conflicted commits, because Git doesn't have any concept of storing commits.

What does 2 sided conflict mean...?

It's only mutable when it hasn't been pushed...

Of course JJ will enable workflows that wouldn't have been possible with Git, or at least wouldn't have been easy to use.

The best thing is that JJ is fully compatible with Git so your personal choices don't have to affect other people using the codebase. This also means that if you decide you don't like it you could commit your last changes and delete the `.jj` folder.

Pushing a branch with conflicts will not work.

How is it stored in git?

## Further reading
- [Jujutsu for everyone](https://jj-for-everyone.github.io/log.html)

