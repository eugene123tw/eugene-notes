---
title: A summary of Stacks and Queues
published: true
tags:
  - Programming Interview
  - Python
---

# Stacks and Queues

<!--more-->

## Stacks

Stacks supports last-in, first-out (**LIFO**) semantics with 2 operations -- **push** and **pop** (just like Pringles).
If the stack is empty, pop returns null or throws an exception. A stack can support additional operations such as **peek**,
which returns the top of the stack without popping it.

- Tips
  - Learn to recognize when the stack **LIFO** property is **applicable**. For example, **parsing** typically benefits from a stack
  - Consider **augmenting** the basic stack or queue data structure to support additional operations, such as finding the maximum element.

### 8.3 Is a string well-formed?

A string over the characters `"{,},(,),[,]"` is said to be well-formed if the different types of brackets match in the correct order.

For example, `"([]){()}"` is well-formed, as is `"[()[]{()()}]"`. However, `"{)"`, `"{(})"`, and `"[()[]{()()"` are not well-formed.

```python
def is_well_formed(s: str) -> bool:
    lookup = {
        "{": "}",
        "(": ")",
        "[": "]",
    }

    stack = []
    for c in s:
        if c in lookup:
            stack.append(c)
        elif len(stack) == 0 or lookup[stack.pop()] != c:
            return False
    return len(stack) == 0
```

## Queues

A queue supports two basic operations -- enqueue and dequeue. Elements are added (enqueued) and removed (dequeued) in first-in, first-out order (**FIFO**).

Below is the basic queue API -- enqueue and dequeue using [`collection.deque`](https://docs.python.org/3.8/library/collections.html#collections.deque) library

```python
class Queue:
  def __init__(self) -> None:
    self._data: Deque[int] = collections.deque()

  def enqueue(self, x: int) -> None:
    self._data.append(x)

  def dequeue(self) -> int:
    return self._data.popleft()

  def max(self) -> int:
    return max(self._data)
```

- Tips:
  - Learn to recognize when the queue FIFO property is applicable. For example, queues are ideal **when order needs to be preserved**.

### 8.8 Implement a queue using stacks

Queue insertion and deletion follows FIFO semantics; stack insertion and deletion is LIFO.
How to implement a queue given a library implementing stacks?

```python
class Queue:
    def __init__(self):
        self._main_stack = []
        self._temp_stack  = []

    def enqueue(self, x: int) -> None:
        self._temp_stack.append(x)

    def dequeue(self) -> int:
        if self._main_stack:
            return self._main_stack.pop()
        while self._temp_stack:
            self._main_stack.append(self._temp_stack.pop())
        return self._main_stack.pop()
```

Since it's impossible to solve this problem with a single stack, we have to create `_temp_stack` to store elements.
When `dequeue()` is called, first check if there's any element in `_main_stack`, pop if there is. If not, then pop all elements in
`_temp_stack` to `_main_stack` -- this will reverse the order of `_temp_stack`,
and store the reversed elements in `_main_stack` so we can achieve queue operations by using stack operations.

After popping all `_temp_stack` elements to `_main_stack`, pop `_main_stack`.
