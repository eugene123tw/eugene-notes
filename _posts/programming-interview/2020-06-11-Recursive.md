---
title: A summary of Recursion
published: true
tags:
  - Programming Interview
  - Python
---

# Recursion

- Tips

  - Recursion is especially suitable when the **input is expressed using recursive** rules such as a computer grammar
  - Recursion is a good choice for **search**, **enumeration**, and **divide-and-conquer**
  - Use recursion as alternative to deeply nested iteration loops. For example, recursion is much better when you have an undefined number of levels, such as the IP address problem generalized to k substrings
  - If you are asked to **remove recursion** from a program, consider mimicking call stack with the **stack data structure**
  - Recursion can be easily removed from a **tail-recursive** program by using a while-loop - no stack is needed
  - If a recursive function may end up being called with the **same arguments** more than once, **cache** the results -- this is the idea behind Dynamic Programming
  <!--more-->

### 15.4 Generate Permutations

This problem is concerned with computing all permutations of an array. For example, if the array is <1,2,3> one output could be [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]

```python
def permutations(A: List[int]) -> List[List[int]]:
    permutation_list = []
    def permute(A, begin):
        if begin >= len(A):
            permutation_list.append(A[:])
            return
        for i in range(len(A)):
            A[begin], A[i] = A[i], A[begin]
            permute(A, begin + 1)
            A[begin], A[i] = A[i], A[begin]
    permute(A, 0)
    return permutation_list
```
