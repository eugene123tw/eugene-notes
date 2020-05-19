---
title: A summary of Linked List
published: true
tags:
  - Programming Interview
  - Python
---

# Linked List

- Tips:
  - List problems often have a simple brute-force solution that uses $$ O(n) $$ space, but a subtler solution that uses the **existing list nodes** to reduce space complexity to $$ O(1) $$
  - Consider using a **dummy head** (a sentry) to avoid having to check for empty list.
  - Algorithms operating on singly linked lists often benefit from using **two iterators**, one ahead of the other, or one advancing quicker that the other

<!--more-->

## Basic APIs

```python
def search_list(L: ListNode, key: int) -> ListNode:
  while L and L.data != key:
    L = L.next
  return L
```

```python
def insert_after(node: ListNode, new_node: ListNode) -> None:
  new_node.next = node.next
  node.next = new_node
```

```python
def delete_after(node: ListNode) -> None:
  node.next = node.next.next
```

## 7.3 Test for Cyclicity

Create 2 pointers, a fast pointer advances with 2 steps and a slow pointer advances 1 step each iteration. If a cycle exists both pointers will eventually overlap, since the fast pointer will jump over the slow pointer, then the slow pointer will meet the fast pointer in the next step – imagine 2 athletes running on the track, the faster runner will eventually surpass a lap more than the slower runner.

To find the first node on the cycle, we have to first find out the cycle length -- denoted as $$ C $$. We use two pointers, one point to `head` and the other point to the node that is $$ C $$ steps ahead of `head`. We then advance them in tandem, and when they meet, the node **must** be the first node on the cycle.

```python
def has_cycle(head: ListNode) -> Optional[ListNode]:
    def cycle_len(end):
        start, step = end, 0
        while True:
            step += 1
            start = start.next
            if start is end:
                return step

    slow = fast = head
    while fast or slow:
        if (fast.next == None) or (fast.next.next == None):
            return None
        fast = fast.next.next
        if fast is slow:
            # finds the start of the cycle
            adv_iter = head
            for _ in range(cycle_len(slow)):
                adv_iter = adv_iter.next
            it = head
            while it is not adv_iter:
                it = it.next
                adv_iter = adv_iter.next
            return it
        slow = slow.next
    return None
```
