---
title: Property based UI testing
preview: false
author: Wakunguma Kalimukwa
synopsis: Property based UI testing
image: /internal/thumbnails/hosting-rust.png
imageAsset: ../assets/internal/thumbnails/hosting-rust.png
published: 2026-11-16
tags:
  - UI
---

While developing [Mukwa](https://github.com/snubwoody/), I did the usual unit testing, which helped verify that features were working as intended, but it didn't really help much with catching bugs. If you had the insight to write a test case for it, then you probably already accounted for it in the code. I have noticed, at least for user interfaces, that a lot of the errors are due to features interacting with each other in unexpected ways, not the individual features themselves. This is much harder to test for however, even just a few features could interact with each other in hundreds of ways. Especially in an application where every action is essentially random data from the user.

After reading a few blog posts and this [paper](https://users.cs.utah.edu/~regehr/papers/swarm12.pdf), I decided to implement property based UI tests. The idea behind the property tests is to generate pseudo-random inputs and verify that a certain property always holds. This enables more structural issues with the code to be discovered, since many more inputs can be tested than the developer could have written individually or even thought about. It looks something like [this](https://github.com/snubwoody/mukwa/blob/d6292dbe8fbce04f7bfb56f14d6a85007f39f7a6/tests/prop/main.rs):

```rust
fn run(&mut self) -> mukwa::Result<()> {
    let all_actions = [
        Action::CreateAccount(CreateAccount),
        Action::EditOutflow(EditOutflow),
        Action::CreateTransaction(CreateTransaction),
    ];

    // Pick a random subset of actions to run
    let len = self.rng.usize(1..=all_actions.len());
    let actions = self.rng.choose_multiple(all_actions, len);
    
    for run in 1..=3 {
        self.current_run = run;

        // Run a random combination of actions
        for i in 0..self.rng.u8(1..=10) {
            let action = self.rng.choice(&actions).unwrap();
            match action {
                Action::CreateTransaction(act) => act.execute(&self.app, &mut self.rng),
                Action::EditOutflow(act) => act.execute(&self.app, &mut self.rng),
                Action::CreateAccount(act) => act.execute(&self.app, &mut self.rng),
            }
        }
        self.succeeded = true;
        Ok(())
    }
```

An `Action` is any complete action that a user may perform &mdash; a unit of work &mdash; such as creating a transaction or deleting an account. Every action performs a series of changes via the user interface and then asserts that certain properties hold. For example, the `CreateTransaction` action creates a transaction with a randomly chosen account and amount, and then asserts that the newly created transaction has the same values. As well as some other UI stuff, like testing if the new transaction is visible in the UI. 

The test runner has a list of all the possible actions (*not yet but it will*), it then picks a random subset of those actions to run. The good part about this is the way features can interact, for example does creating a transaction without an account always fail? The most important feature of `simulacrum` is that is uses a deterministic seed for its PRNG, so any test can be replayed by passing in the same seed.

```rust
fn main() -> mukwa_core::Result<()> {
    let cli = Cli::parse();
    let seed = cli.seed.unwrap_or(fastrand::u64(..));
    println!("Running test runner with seed {seed}");
    println!("To re-run this test use the command:");
    println!("cargo run --bin simulacrum -- --seed {seed}");

    let mut runner = TestRunner::new(seed);
    runner.run()?;
    println!("No errors found");
    Ok(())
}
```

It also saves some info about the test run on panic such as the database.

## Shrinking

Currently, it is just a proof of concept; I am not totally sure how effective it is going to be in the end. But so far it has helped catch a few overflow errors. The end goal is to try all the difference possible permutations of interactions that can be performed using the app &mdash; to a feasible degree at least. The next goal, before I implement more actions, is to implement test case shrinking i.e. find the minimum sequence of actions that led to the bug. 

Right now finding bugs is less than ideal, I have to manually inspect all the actions that run and figure out what happened,
which is why I have limited it to only 3 runs of 0..255 iterations for now.
