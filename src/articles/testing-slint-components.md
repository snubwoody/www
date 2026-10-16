---
title: Testing Slint components
author: Wakunguma Kalimukwa
published: 2026-10-16
image: /internal/thumbnails/rust-weird-expressions.png
imageAsset: ../assets/internal/thumbnails/rust-weird-expressions.png
synopsis: Testing Slint components
preview: false
tags:
  - Slint
---

I've been developing my app [Mukwa](https://github.com/snubwoody/mukwa) for a few months now and for a quite a while the codebase has no frontend tests, which made things quite fragile. Features would not work as intended, old errors would re-appear and changes to the code would cause unintended changes and breakage, it was overall very brittle. Finally, I decided to look into how the Slint developers test their own code and I adopted those techniques in my codebase, which has made things more stable. I'm going to share those techniques in this blog post.

> These are internal, unstable APIs that are subject to change, so use with caution.

For demonstration purposes we'll be testing a simple checkbox component.

```slint
export component Checkbox inherits Rectangle {
	width: 20px;
	height: 20px;
	in-out property <bool> checked: false;
	forward-focus: focus-scope;
	
	accessible-default-action => toggle();
	callback toggled();
	
	public function toggle() {
		checked = !checked;	
		toggled();
	}
	
	focus-scope := FocusScope {
		
	}
	
	touch-area := TouchArea {
		clicked => toggle();
	}
}
```

These component tests will live in a seperate `component-tests` crate. Each test case will be a `.slint` file in the `component-tests/cases` directory. In a build script we will iterate over each of these test cases, compile the Slint code to Rust, write a test against that compiled code and inject both the compiled code and test code into a Rust test file. The Rust test files can then be run using Cargo's test runner. There's sadly no way to dynamically generate Rust tests so each `.slint` file will need a corresponding `.rs` file.


To compile and run the tests the following dependencies are required:

```toml
[package]
name = "component-tests"
version = "0.0.0"
edition = "2024"

[dependencies]
slint = "1.18.1"
i-slint-backend-testing = "1.18.1"
i-slint-core = "1.18.1" # Expose core types

[build-dependencies]
smol = "2.0.2" # Run the async parts of the Slint compiler
i-slint-compiler = "1.18.1" # Compile Slint code
```

First we collect test cases.

```rust
use std::{fs,io};

struct TestCase {
	source: String,
	name: String
}

fn collect_cases() -> Result<Vec<TestCase>,io::Error> {
	let cases_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("cases");
	println!("cargo::rerun-if-changed={}",cases_dir.display());
	
	let mut test_cases = vec![];
	for entry in fs::read_dir(&cases_dir)? {
		let entry = entry?;
		let file_name = entry.file_name();
		let name: Vec<&str> = file_name.to_str().unwrap().split(".").collect();
		let source = fs::read_to_string(entry.path())?;
		let case = TestCase {
			source,
			name: String::from(name[0]),
		};
		test_cases.push(case);
	}
	Ok(test_cases)
}
```

Then we compile each test case and write the compiled out to a `.rs` file in Cargo's `OUT_DIR`.

```rust
use std::fs;
use std::fs::File;
use std::path::PathBuf;

fn compile_test(case: TestCase){
    let include_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("app/ui");
        
	let mut diag = BuildDiagnostics::default();
	let syntax_node = parser::parse(case.souce.clone(),None,&mut diag);
	let mut compiler_config = CompilerConfiguration::new(OutputFormat::Rust);
	compiler_config.debug_info = true;
	compiler_config.include_paths = vec![include_path.clone()];
	
	let (root_component, diag,loader) = smol::block_on(compile_syntax_node(syntax_node,diag,compiler_config));
	
	if diag.has_errors(){
		diag.print_warnings_and_exit_on_error();
	} else {
		diag.print();
	}
	
	let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());
	let mut file = File::create(out_dir.join(format!("{}.rs",case.name))).unwrap();
	generator::generate(
		OutputFormat::Rust,
		&mut file,
		None,
		&root_component,
		&loader.compiler_config,
	).unwrap();
}

fn main() {
	let test_cases = collect_cases();
	let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());
	let include_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
		.parent()
		.unwrap()
		.join("app/ui");
		
	for case in test_cases {
		compile_test(case);
	}
}
```

`compiler.debug_info` must be set to true because running tests the Slint test runner required debug info to run tests. `compiler.include_path` must be set to the root directory of the Slint code, in our case `app/ui`.

The actual Rust test code will be written in a multi-line comment in the Slint file. The downside of this method is that there is no syntax highlighting, intellisense or formatting. It might be possible to write the code in actual `.rs` file, but this method ensures that all the related code stays together.

```slint
import { Checkbox } from "widgets/checkbox.slint"

export component TestCase inherits Window {
	out property <bool> checked <=> checkbox.checked;
	out property <string> text;
	
	checkbox := Checkbox {
	    toggled => {
			text += "a";
        }
	}
}

/*
use i_slint_backend_testing::{ElementRoot,AccessibleRole,PointerEventButton};

let instance = TestCase::new();
assert!(!instance.get_checked());

let checkbox = instance
	.root_element()
	.query_descendants()
	.match_type_name("Checkbox")
	.find_first()
	.unwrap();
	
assert_eq!(checkbox.accessible_role(),Some(AccessibleRole::Checkbox));
checkbox.mock_single_click(PointerEventButton::Left);
assert!(instance.get_checked());
assert_eq!(instance.get_text(),"a");
checkbox.mock_single_click(PointerEventButton::Left);
assert!(!instance.get_checked());
assert_eq!(instance.get_text(),"aa");
*/
```

We can write a simple function to extract the Rust code from the test case, and inject that code into the test file.

```rust
fn extract_test_function(source: &str) -> String {
	let mut in_comment = false;
	let mut function = String::new();
	for line in source.lines(){
		if line == "/*" {
			in_comment = true;
			continue;
		}
		
		if line == "/*" {
			break;
		}
		
		if !in_comment {
			continue;
		}
		
		function += line;
		function += "\n";
	}
	function
}
```

No we can change the `compile_test` function to write our extracted code to the generated Rust file.

```rust
// ...
let test_function = extract_test_function(&case.source);
writeln!(file,"\n#[test]\nfn test_{}(){{", case.name).unwrap();
writeln!(file,"i_slint_backend_testing::init_no_event_loop();").unwrap();
writeln!(file,"smol::block_on(async {{\n{}}})\n}}",test_function).unwrap();
```

And finally we add a single line in the `component-tests/tests/checkbox.rs` file to include the generated code.

```rust
include!(concat!(env!("OUT_DIR"), "/checkbox.rs"));
```
