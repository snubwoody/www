---
title: The perfect error
preview: true
author: Wakunguma Kalimukwa
synopsis: If debugging is the process of removing software bugs then programming must be the process of putting them in
image: /internal/thumbnails/rust-nightly-features.png
imageAsset: ../assets/internal/thumbnails/rust-nightly-features.png
imageSize: 120000
published: 2025-08-24
guid:
tags:
  - Rust
---

> If debugging is the process of removing software bugs then programming must be 
> the process of putting them in - Edsger W. Dijkstra

- Structs vs Box? 
- Trait errors?
- `Box<dyn Error>`?
- thiserrror backtrace
- Bubbling up errors

A common convention in the rust ecosystem is to have a large error enum that 
holds all the possible errors that can occur in your program, sometimes 
marked as `#[non_exhaustive]`. With libraries like 
[`thiserror`](https://docs.rs/thiserror/latest/thiserror/) this becomes fairly trivial. 

```rust
use thiserror::Error;
use uuid::Uuid;
use std::io;

#[derive(Error,Debug)]
pub enum Error{
	#[error("Network error occured: {0}")]
	NetworkError(#[from] reqwest::Error),
	#[error(transparent)]
	DatabaseError(#[from] sqlx::Error)
	#[error("Session {0} not found")]
	SessionNotFound(String),
	#[error("Network timeout after {0}ms")]
	NetworkTimeout(u64),
	#[error("No user with the id: {user_id} was found")]
	UserNotFound{ user_id: Uuid },
	#[error("Io error: {0}")]
	IoError(#[from] io::Error),
	#[error("Configuration file not found")]
	ConfigNotFound,
	#[error("Failed to parse config: {0}")]
	FailedToParseConfig(String)
	#[error("Invalid config format")]
	InvalidConfigFormat,
	#[error("User JWT expired")]
	JwtExpired
}
```

This is good in the sense that it shows all the possible sources of errors.
The issue comes in when you have a function that returns this error, and you want to handle it by
matching. Usually errors are propagated up the chain (`?`), but sometimes callers actually want
to handle the error.

Let's say we had a function that parses a file as a `UserConfig` and returns a default 
`UserConfig` if the config is not found, but returns an error if the config is invalid. You would 
technically need to match against every variant. Unless you looked inside the source code, 
you wouldn't know what errors are possible, and technically each one is equally valid. Even if you 
did look in the source code, there might be a lot of error propagating, which makes it harder to predict.

## Nested errors

This problem is made even worse due to the fact that we might wrap 
an `io::Error` for example and also wrap another error that wraps 
the same `io::Error` so now we have two sources of the same error. 
So if we wanted to handle all io errors we would need to match twice or 
somehow combine both. The underlying error might be from two different 
versions of the same crate.

## Context specific errors
We could make this better by making a smaller, more focused error that only involved errors 
related to parsing the config. We'll get rid of the database errors, that's not going to 
happen, as well as all the errors related to networking.

```rust
use thiserror::Error;
use uuid::Uuid;
use std::io;

#[derive(Error,Debug)]
pub enum ParseConfigError{
	#[error("Configuration file not found")]
	ConfigNotFound,
	#[error("Syntax error on line {line} col {col}: {message}")]
	SyntaxError{
		line: u64
		col: u64,
		message: String,
	},
	#[error("Unexpected EOF")]
	UnexpectedEof,
	#[error(transparent)]
	IoError(#[from] io::Error),
}
```

Now it's much easier to handle the error.

```rust
use config::{parse_user_config,ParseError,UserConfig};

fn load_config() -> UserConfig{
	if let Err(err) = parse_user_config(){
		match err {
			Error::ConfigNotFound => UserConfig::default(),
			Error::SyntaxError{..} | UnexpectedEof => 
				eprintln!("Failed to parse config: {err}"),
			IoError(_) => eprintln!("{err}")
			
		}
	}
}
```

It's important to have this info, in the example above, if the config is not found then you 
could replace it config, but panic if the config was found but has errors.

There's a limit to this however, you can't make an error for every function. So it's 
good to think of errors as covering different "scopes". The idea is to think about 
the end goal of your error, if you are making a CLI, then the end user merely needs 
a descriptive error, which the [anyhow](https://docs.rs/anyhow/latest/anyhow/) crate would 
be great for.

### Structs as errors
But enums aren't the only kind of errors, structs, as the name implies, work best for 
structured errors, when errors of a specific kind all need to have the same information 
in them. Like an API, API errors usually have a message, description and response code.

```rust
use std::{error::Error, fmt::Display};
use http::StatusCode;
  
#[derive(Debug,Clone,PartialEq)]
pub struct ResponseError{
    message: String,
    details: String,
    status: StatusCode,
}

impl Error for ResponseError{}

impl Display for ResponseError{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f,"Error: [{}] {}",self.status,self.message)
    }
}
```
## Unrecoverable errors
Errors should be designed with their purpose in mind, for applications, especially 
simpler ones, a lot of the time the point of the error is just to give the user a 
message to know what went wrong.

You could design the most intricate error, but that's going to get compiled away and if 
the error context is never used by any of the application code, then you might as well return strings.

But do you want to handle the error? If the code base is full of `?` all the way up to main 
and there's no error handling, then you probably don't need an intricate error.

But what is unrecoverable? There's a misconception that applications only have unrecoverable errors 
while libraries only have recoverable errors. So the advice is to use `anyhow`. However the 
context is still important in certain scenarios, the user typing in an invalid password is important 
to both you and them. You could use the context and keep track of the tries for security reasons.

## No errors
The best error is no error, try to design your code in such a way that the error prone things 
are handled elsewhere and the other stuff has no errors.

If you plan your crate into a `setup -> execution` structure, then most of the errors would happen 
during the setup phase. Things such as network requests and reading files, where you can 
gracefully handle errors. Then after the setup has been completed, the execution step would work with 
concrete types that are known to be valid and have little room for errors. 

Let's say you have a renderer that renders images to the screen. There's nothing that can go wrong in 
the final rendering step, when you are just drawing images to the screen. It's all the stuff before, 
such as opening the image, whether the image format is supported and so on, where stuff can go wrong. 
So the idea is to have "setup" code that has errors that the caller would expect and "execution" code 
that has no errors because all the setup has been taken care of.

```rust
struct Pixel(u8,u8,u8);

struct Image {
	pixel: Vec<Pixel>
}

pub fn draw_image(image: Image){
	...
}
```

Another issue is that rust doesn't really show what kind of errors can occur, since errors are 
just values like every other return type. It's also not feasible for every function to have docs 
describing what kind of errors it returns.
