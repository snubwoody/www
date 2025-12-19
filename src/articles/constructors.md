---
title: Evil constructors
preview: true
author: Wakunguma Kalimukwa
synopsis: What's the most optimal branching strategy?
image: /internal/thumbnails/branching-strategies.png
imageAsset: ../assets/internal/thumbnails/branching-strategies.png
imageSize: 5723169
published: 2025-08-06
tags:
  - Language design
---

When using a constructor have you ever wondered where `this` or `self` comes from? The constructor is 
supposed to be initialising an object so what are we referring to?

The issue is also with side effects, in rust and go constructors are simply methods or functions, they 
can do anything. But in OOP languages constructors usually have some limitations.

In python for example you may have noticed that `__init__` takes a reference to the object `self`, but what 
is this object and where did it come from? Well in python the actual object is created by the `__new__` method
which is then passed on to the `__init__` method.

```python
class Person:
    def __new__(cls,):
        return object.__new__(cls)
```

This creates a new empty object which is then passed onto the `__init__` method.

The issue in some languages is that it leads to boilerplate because of the `new` keyword.


