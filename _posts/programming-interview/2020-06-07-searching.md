---
title: A summary of Searching
published: true
tags:
  - Programming Interview
  - Python
---

# Searching

- Tips:
  - **Binary search** is an effective search tool. It is applicable to more than just searching in sorted array e.g. it can be used to search an **interval of real numbers or integers**
  - If your solution uses sorting, and the computation performed after sorting is faster than sorting e.g. $$ O(n) $$ or $$ O(\log n) $$, **look for solutions that do not perform a complete sort**
  - Consider **time/space tradeoffs**, such as making multiple passes through the data

<!--more-->

## [Binary Search APIs](https://docs.python.org/3/library/bisect.html)

`bisect.bisect_left(a, x)`/`bisect.bisect_right(a, x)` locate the insertion point for `x` in a to maintain sorted order.

- `bisect.bisect_left(a, x, lo=0, hi=len(a))`:

  - The returned insertion point `i` partitions the array a into **two halves** so that `all(val < x for val in a[lo:i])` for the left side and `all(val >= x for val in a[i:hi])` for the right side.

- `bisect.bisect_right(a, x, lo=0, hi=len(a))`:
  - The returned insertion point `i` partitions the array a into two halves so that `all(val <= x for val in a[lo:i])` for the left side and `all(val > x for val in a[i:hi])` for the right side.
