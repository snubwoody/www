---
preview: true
title: The perfect git history
author: Wakunguma Kalimukwa
synopsis: ""
image: /internal/thumbnails/hosting-rust.png
imageAsset: ../assets/internal/thumbnails/hosting-rust.png
imageSize: 0
published: 2025-08-07
tags:
  - Git
---
> Git the version manager from hell
> - Linus Torvals

- `git replace`

What does the perfect git history look like? One question that comes up all the time is whether to rebase, squash or merge.
## Merging changes
Say you just got done implementing a change in a feature branch: adding a login form to a website. The commit history looks like this:

![branch-off-1.png](/assets/the-perfect-git-history/branch-off-1.png)

What's the ideal way to merge these changes into the main branch.
### Merge
You can simply merge these into main with a commit message.

```bash
git checkout main
git merge login-form -m "Add login form"
```

This creates a new merge commit that takes the changes from both branches and combines them. This works perfectly fine. The problem with always merging is that it can lead to quite a convoluted history.

![Convoluted git history](/assets/the-perfect-git-history/convoluted-history.png)

The other issue is that when you are writing code, you're not always concerned with having the perfect commit message every time, commits can get noisy and you often have to backtrack, fix typos, format code and so on. Seeing commit messages like `Run formatter` everywhere doesn't help. 

Of course merge is not bad at all, it's the default for a reason as it's the safest and preserves the most information.

#### Fast forward merge
When merging one branch into another branch, if there are not new commits on the target branch a **fast forward merge** can be performed. No new merge commit is needed to combine the changes, instead the HEAD (along with the index) is pointed to the latest commit. Similar to rebasing, except it doesn't modify any history.

```bash
git checkout main
git merge login-form -ff-only
```

A fast forward merge simply treats the commits as if they were on the main branch the entire time. Github unfortunately doesn't support fast forward merges even though they are safer than rebasing. 

#### Squash merge
A squash merges combines all the commits on the current branch into one single commit.

```bash
git checkout main
git merge login-form --squash
git branch -d login-form
```

Squash merging is great when you branch off to implement a single feature, or at least a small number of changes.

[animation]
### Rebasing
[`git rebase`](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) takes all the commits on one branch and replays them, one by one, onto the target branch. It leaves you with a linear history, making it seem as though you were always working on a single branch.

```bash
git checkout topic-branch
git rebase main
```

This works by:
- Go to the common ancestor 
- Get the diff of each commit on the current branch and save them to temporary files
- Resetting the current branch to the same commit as the target branch
- Applying each of the commits each change one by one

Now you can do a fast forward merge. Rebasing is good for a linear history, however it is dangerous because it makes new commits. even though they have the same content, they have different hashes. This could be detrimental if other people are depending on those same commits.

[animation]

>Ahh, but the bliss of rebasing isn’t without its drawbacks, which can be summed up in a single line:
>**Do not rebase commits that exist outside your repository and that people may have based work on.**

- `--onto`

#### Interactive rebase

### Cherry pick

## Is linear history even important
Is a convoluted history that bad? Well kind of, yes. When using a GUI to traverse the git history it can get quite bad, and people do traverse the git history. You end up having to move around a lot, to branches that are not really important now. It's my personal opinion that long-lived branches should be important, e.g. main, beta, stable, lts.
## Soft reset
You can so a soft reset to the commit you branched off of and apply all this changes in a single commit.

There's no perfect git history, overall the most important part is having good commit messages.
## Pulling upstream changes
Prefer rebase when pulling changes

## Ammend commits
## Commit messages
Of course all of this is useless if the git repo consists of `WIP` everywhere. A commit message should be a short description of the changes. In fact bad commit messages is why a lot of teams prefer squash merging. Message bodies... When in doubt use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). 

## Long-lived branches vs feature branches
Git will most likely be a part of your developer life for a long time, so you might as well get good at git.

The more long lived branches you have the more complex your repo will be. However there are genuine use cases for long lived branches.
- LTS versions
- Release candidates
- Experimental features/rewrites

However these are highly special use cases so in general **prefer feature branches**.

## Merging changes from upstream
You working on a feature but there's been some changes to the main branch, how do you update your feature branch?

## Workflows

## Tag
You can tag when you switch to different tooling
