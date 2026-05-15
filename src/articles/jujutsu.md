---
title: Jujutsu is pretty good
author: Wakunguma Kalimukwa
published: 2026-05-12
image: /internal/thumbnails/rust-weird-expressions.png
imageAsset: ../assets/internal/thumbnails/rust-weird-expressions.png
imageSize: 1200000
synopsis: Jutusu is pretty good
preview: false
tags:
  - Version control
  - Jujutsu
---

I've been using Jujutsu for version control for the past couple months and it's been pretty good. I've never known anything other than Git, so I had no real reasons to change. But still, I kept hearing about how it has such a better UX than git, so I decided to try it out, and I simply never left. So these are some highlights of my experience and favourite features.

In Jujutsu, changes to the repository are represented as a [change](https://reasonablypolymorphic.com/blog/jj-strategy/). Jujutsu supports multiple backends, and when using the Git backend, every change is stored inside of a commit. This makes it fully compatible with Git. The current working copy is also stored as a commit. Any changes to the repository update the active commit, as such there is no staging area. This means I never have to use `git stash` again. There's nothing wrong with `git stash`, it's just that I always forget stashes I created. 

>The difference between a commit and a change set is that a commit never changes - it can only be replaced with another commit because commits are immutable. But in jj, you can make a series of changes and add small fixes (like correcting typos) to earlier changes, and the subsequent changes are automatically updated, without needing to do a manual branch / rebase each time. This makes it much less effort to keep changes tidy and to the point. For absolutely nobody in the future it will matter that you initially typed `pritnf(msg, vak)` instead of `printf(msg,val)`. Why put this into an own commit? But merging it into an earlier change requires rebasing.

Another concept I really appreciate is anonymous branches. Branches don't have names, they just diverge from the parent commit.

## Revsets
[Revsets](https://docs.jj-vcs.dev/latest/revsets/) are expressions that are used to specify revisions in Jujutsu. For convenience, changes can be referred to using a short id, which is highlighted in the terminal. Revsets is an entire language, with plenty of complex features, but the features I use the most are:
- `@`: The working copy
- `x-`: Parents of `x`
- `x+`: Children of `x`
- `x::`: Descendants of `x`, including `x` itself
- `::x`: Ancestors of `x`, including `x` itself

As an example, let's say you made a couple changes that you just want to get rid of. Deleting commits in Git will have you searching through [Stack Overflow threads](https://stackoverflow.com/questions/1338728/how-do-i-delete-a-commit-from-a-branch). In Jujutsu you would use `jj abandon` along with revsets pointing to the changes to delete.

```bash
jj log
@  qnyptlup contact@wakunguma.com 2026-05-10 16:19:04 33354738
│  (empty) (no description set)
○  kuptqpxl contact@wakunguma.com 2026-05-10 16:19:04 62cee53c
│  Valid commit
○  rvlmqszq contact@wakunguma.com 2026-05-10 16:18:55 232c1dd4
│  Invalid commit
○  poorzzwq contact@wakunguma.com 2026-05-10 16:18:39 2705a650
│  Invalid commit
○  ooxonzol contact@wakunguma.com 2026-05-10 16:18:30 ec36d2d9
│  Valid commit
○  qmsynsqs contact@wakunguma.com 2026-05-10 16:18:22 724e5b00
│  Initial commit
◆  zzzzzzzz root() 00000000

jj abandon -r p::r
Abandoned 2 commits:
  rvlmqszq 232c1dd4 Invalid commit
  poorzzwq 2705a650 Invalid commit
Rebased 2 descendant commits onto parents of abandoned commits
Working copy  (@) now at: qnyptlup 088bf033 (empty) (no description set)
Parent commit (@-)      : kuptqpxl 0ff98790 Valid commit
Added 1 files, modified 0 files, removed 1 files

jj log
@  qnyptlup contact@wakunguma.com 2026-05-10 16:20:11 088bf033
│  (empty) (no description set)
○  kuptqpxl contact@wakunguma.com 2026-05-10 16:20:11 0ff98790
│  Valid commit
○  ooxonzol contact@wakunguma.com 2026-05-10 16:18:30 ec36d2d9
│  Valid commit
○  qmsynsqs contact@wakunguma.com 2026-05-10 16:18:22 724e5b00
│  Initial commit
◆  zzzzzzzz root() 00000000
```

Changes can also be referred to using metadata, such as the description. For example, we could squash all format...

## Operations
Jujutsu records and stores every operation performed on the repository in the [operation log](https://docs.jj-vcs.dev/latest/operation-log/). Every single thing, changes, rebasing, squashes, edits and so on. Before every change, a snapshot of the current repository state is stored. This means every operation can be undone using `jj undo`.

## Conflicts
Something that caught me off guard about Jujutsu is that it stored conflicts as a change. Coming from Git, this is quite strange because Git conflicts halt the entire operation, preventing you from moving forward.

We can create a simple conflict, as an example, by updating the same file on different branches and rebasing the commits.

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


Jujutsu stores the conflicted state as a change, allowing you to continue the rest of your work, and handle the conflict whenever necessary. The "2-sided conflict" refers to the `main` branch and the branch being rebased.

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

The caveat to this is that `jj git push` will not push conflicted comits. (might have changed)
