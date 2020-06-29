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

### 9.1 Search a sorted array for first occurrence of $$ k $$

Write a method that takes a sorted array and a key and returns the index of the **first occurrence** of that key in the array. Return `-1` if the key doesn't appear in the array. For example, when applied to the array below, the method should return `3` if the given key is `108`, if it is `285`, it should return `6`

```
-14  -10   2   108  108  243  285  285  285  401
[0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]
```

#### Solution

Implement binary search to find the index of key value, if found, otherwise return `-1`. After finding the key index, we then need to check if the key is the first occurrence. This can be done by checking the previous value before the current index, change to the previous index if it has the same value as key, otherwise we have the first occurrence index of key.

```python
def search_first_of_k(A: List[int], k: int) -> int:
    lower, upper, result = 0, len(A)-1, -1
    while lower <= upper:
        m = (lower + upper) //2
        if A[m] < k:
            lower = m + 1
        elif A[m] == k:
            result = m
            upper = m - 1
        else:
            upper = m - 1
    return result
```

### 9.3 Search a cyclically sorted array

An array is said to be cyclically sorted if it is possible to cyclically shift its entries so that it becomes sorted. For example, the array below is cyclically sorted -- a cyclic left shift by 4 leads to a sorted array:

```
378  478  550  631  103  203  220  234  279  368
[0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]
```

Design an $$ O(\log n) $$ algorithm for finding the position of the smallest element in a cyclically sorted array. Assume all elements are distinct.
For example for the array above, the algorithm should return 4.

#### Solution

If `A[m] > A[n-1]` then the minimum value must be in the range of `[m+1, n-1]`. Conversely, if `A[m] < A[n-1]`, then the minimum value is definitely not within the range of `[m+1, n-1]`

```python
def search_smallest(A: List[int]) -> int:
    lower, upper = 0, len(A) - 1
    while lower < upper:
        m = (lower + upper)//2
        if A[m] > A[upper]:
            lower = m + 1
        else:  # A[m] < A[upper]
            upper = m
    return lower
```
