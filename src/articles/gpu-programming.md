---
title: GPU programming is so hard
preview: true
author: Wakunguma Kalimukwa
synopsis: What's the most optimal branching strategy?
image: /internal/thumbnails/branching-strategies.png
imageAsset: ../assets/internal/thumbnails/branching-strategies.png
imageSize: 5723169
published: 2025-08-06
tags:
  - Graphics
---

- History of CPU vs GPU programming

GPU programming is hard, it's hard to test, it's hard to debug and there's a shockingly low amount 
of information on it compared to other areas of programming. So why is it like this?

Well when we say hard, it's mostly because we expect it to be more like CPU programming but this couldn't 
be farther from the truth.

All programming languages compile to a specific architecture like `x86_64`, which means that if you have a 
CPU and a programming language can compile to it, then it is supported.

On the other hand GPUs use shading languages, which are specifications and depend on the hardware vendors
for implementation.

## Different API's
Well for one, there's different API's for different manufacturers, written in completely different shading
languages. Which usually don't have intelligence and may compile with errors.

- Metal
- OpenGL
- Vulkan
- Direct3D
- WebGPU

## Specifications
Shading languages are only specifications and rely on the hardware vendors for their implementation.
But implementations vary, and vendors may have slightly different implementations of the API.

Different manufacturers support different features.
Why isn't there a shared API like CPU's?

- No intellisense.
- Hard to test.
- Vendor specific extensions
- Compiled at runtime
- Vendor lock
- Differences between shader code and rust code

The main difference is due to the fact that CPU programs compile to a certain architecture, while GPU
programs rely on a specification and are compiled at runtime.

## Lack of tooling and debugging
Because shading languages run on the GPU, they are quite hard to debug, if at all possible. They are also
hard to test, if you wanted to test a GPU program you would have to run the whole pipeline and wait to see 
the output.

The path to output is not an easy one either, you need to get a reference to the GPU and some kind of 
surface to draw on. Then you must initialise assets and resources.

## Different task
GPUs work in parallel which means it's very different from CPU programming. Shaders usually run per vertex, 
per pixel or per workgroup, as opposed to typical programming languages that run sequentially.

Typically, you would pass the initialised resources onto the GPU, however there's no compiler errors
for missing resources, so this is an error you would see at runtime.
