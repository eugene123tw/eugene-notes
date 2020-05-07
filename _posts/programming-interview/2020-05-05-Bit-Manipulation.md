---
title: A summary of bit manipulation
published: true
tags:
  - Bit Manipulation
  - Programming Interview
  - Python
---

# Bit Manipulation

- Objectives:
  - Be very comfortable with the **bitwise operators**, particularly XOR
  - Understand how to use **masks** and create them in an **machine independent** way
  - Know fast ways to **clear the lowermost set bit** (and by extension, set the lowermost 0, get it's index, etc)
  - Understanding signedness and its implications to **shifting**
  - Consider using a **cache** to accelerate operations by using it to brute-force small inputs

<!--more-->

## Some useful debug functions in Python

- Convert an integer number to a binary string prefixed with “0b”. Some examples:

```python
>>> bin(3)
'0b11'
>>> bin(-10)
'-0b1010'
```

- Convert integer to bits and formats the output to fit in 10 characters width - 2 characters for `0b` prefix, 8 for rest binary digits.

```python
>>> format(14, '#010b')
'0b00001110'
```

- Convert bits to integer

```python
>>> int('11111111', 2)
255
```

## AND `&` Operator (Set intersection)

### Masking

AND takes two equal-length bit patterns. If both bits in the compared position of the bit patterns are 1, the bit in the resulting bit pattern is 1, otherwise 0.

For example:

```
 A: 0011 = 3
&B: 0010 = 2
-------------
    0010 = 2
```

From result `0010`, we know the second bit in the original pattern was set. This is often called bit **masking**. (In this case, the `0` values mask the bits that are not of interest). This operator can help us locate intersected bits between 2 patterns.

### Odd/Even number check

Because of the previous property, it becomes easy to check the [parity] of a binary number by using a mask equals to 1. (caveat: this is different to the [Parity bit problem])

```
 A: 0011 = 3
&M: 0001 = 1
-------------
    0001 = 1
```

Because `3 & 1` is one, which means `3` is not divisible by two and therefore odd.

Let's look another example with even number `6`:

```
 A: 0110 = 6
&M: 0001 = 1
-------------
    0000 = 0
```

Because `6 & 1` is zero, which means `6` is divisible by two and therefore even.

[parity]: https://en.wikipedia.org/wiki/Parity_(mathematics)
[parity bit problem]: https://en.wikipedia.org/wiki/Parity_bit

## OR `|` operator (Set union)

- Syntax `x | y`:
  - Returns each bit of the output 0 if the corresponding bit of `x` AND of `y` is `0`, otherwise it's `1`.

```
 A: 0011 = 3
|B: 0010 = 2
-------------
    0011 = 3
```

## NOT `~` Operator

- Syntax `~x`:
  - Returns the complement of `x` - the number you get by switching each 1 for a 0 and each 0 for a 1. This is the same as `-x-1`.

It's an artifact of two's complement integer representation.

In 16 bits, 1 is represented as `0000 0000 0000 0001`. Inverted, you get `1111 1111 1111 1110`, which is -2 (-1-1). Similarly, 15 is `0000 0000 0000 1111`. Inverted, you get `1111 1111 1111 0000`, which is -16 (-15-1).

```
Origin: 0000 0000 0000 0001 = 1
Invert: 1111 1111 1111 1110 = -2 (in two's complement representation)
```

## XOR `^` Operator

Bitwise XOR also takes two equal-length bit patterns. If both bits in the compared position of the bit patterns are 0 or 1, the bit in the resulting bit pattern is 0, otherwise 1.

```
 A: 0101
^B: 0011
---------
    0110
```

```
 A: 0101
^B: 1010
---------
    1111
```

```
 S: 0000
^M: 0001
---------
 S: 0001
```

```
 S: 0001
^M: 0001
---------
    0000
```

#### References:

- https://en.wikipedia.org/wiki/Two%27s_complement
- https://zh.wikipedia.org/wiki/%E4%BA%8C%E8%A3%9C%E6%95%B8
- https://stackoverflow.com/questions/7278779/bit-wise-operation-unary-invert

## Left Shifts `<<` operator

- Syntax: `x << y`:
  - This returns `x` with the bits shifted to the left by `y` places (and new bits on the right-hand-side are zeros). This is the same as **multiplying** `x` by `2**y`.

For example, shift `26` one bit to the left, and shift one bit left again from the previous shifted result.

```
>>> 26 << 1, 26 << 1 << 1
Origin: 0001 1010 = 26
    LS: 0011 0100 = 26 * (2**1) = 52
    LS: 0110 1000 = 26 * (2**2) = 104
```

## Right Shifts `>>` operator

- Syntax: `x >> y`:
  - This returns `x` with the bits shifted to the right by `y` places (and new bits on the left-hand-side are zeros). This is the same as **dividing** `x` by `2**y`.

For example, shift `104` one bit to the right, and shift one bit right again from the previous shifted result.

```
>>> 104 >> 1, 104 >> 1 >> 1
Origin: 0110 1000 = 104
    RS: 0011 0100 = 104 / (2**1) = 52
    RS: 0001 1010 = 104 / (2**2) = 26
```

As you can see we are back at 26 again!

### Common usages

#### Get Bit

- Syntax `(x & (1 << y)) != 0`:
  - Returns the `y+1`th bit from `x`
    - `(1 << y)` creates a mask with `1` located at `y+1`
    - Perform `&` operation on `x` with the mask we created above
    - Result returns `True` if the `y+1`th bit is 1, otherwise `False`

For example, get the 1st bit (`y:0`) of value 7 (`x:7`):

```
>>> (7 & (1 << 0)) != 0
         x: 0111
& (1 << 0): 0001
-----------------
            0001
```

For example, get the 2nd bit (`y:1`) of value 7 (`x:7`):

```
>>> (7 & (1 << 1)) != 0
         x: 0111
& (1 << 1): 0010
-----------------
            0010
```

#### Set Bit

- Syntax `x | (1 << y)`:
  - Set the `y+1`th bit to 1 to `x`
    - `(1 << y)` creates a mask with 1 located at `y+1`
    - Perform `|` operation on `x` with the mask we created above

For example, set the 4th bit (`y:3`) of value 7 (`x:7`):

```
>>> 7 | (1 << 3)
        x: 0111
|(1 << 3): 1000
----------------
           1111
```

#### Clear Bit

- Syntax `x & ~(1 << y)`:
  - Clear the `y+1`th bit of `x`
    - `(1 << y)` creates a mask 1 located at `y+1`, then invert the mask with XOR -- `~(1 << y)`
    - Perform `&` operation on `x` with the mask we created above

For example, clear the 1st bit (`y:0`) of value 7 (`x:7`):

```
>>> 7 & ~(1 << 0)
          x: 0111
& ~(1 << 0): 1110
------------------
             0110
```

#### Clear the lowest bit

- Syntax: `x & (x-1)`

For example,

```
>>> 44 & 43
       x: 0010 1100
&  (x-1): 0010 1011
--------------------
          0010 1000
```

#### Get the lowest bit

- Syntax: `x & ~(x-1)`

For example, get the lowest bit of 44:

```
>>> 44 & ~43
       x: 0010 1100
& ~(x-1): 1101 0100
--------------------
          0000 0100
```

As you can see the lowest bit of `0010 1100` is `0000 0100`!

## 4.1 Computing the parity of a word

The parity of a binary word is 1 if the number of 1s in the word is odd; otherwise, it is 0.

For example, the parity value of `1011` is 1, because the total count of occurrences of 1s is 3 -- an odd number.
And the parity value of `10001000` is 0, because the total count of occurrences of 1s is 2 -- an even number. [Solution Here](https://github.com/eugene123tw/EPIJudge/blob/master/epi_judge_python/parity.py)

### Method 1:

The XOR (`^`) tells us that if both bits in the compared position of the bit patterns are 1,
the bit in the resulting bit pattern is 0. We will use the property of XOR to count the number of 1s in a binary word.

```python
def parity(x: int) -> int:
  result = 0  # cache
  while x:
    result ^= x & 1
    x = x >> 1  # right shift
  return result
```

#### Note

We create `result` and initialize as zero, we then use this to determine if the bit word has odd or even number of 1s.

```python
result = 0
while x:
  result ^= 1
  x >>= 1
return result
```

We basically codelyzed $$ 0 \oplus A \oplus B \oplus C \oplus D \oplus E ... $$. This formula returns 1 iff the word has odd number of 1s.

#### Analysis

The time complexity is $$ O(n) $$, where $$ n $$ is the word size. The first improvements is based on erasing the lowest set bit using `x & (x-1)`, thereby achieve the best- and average-cases -- let $$ k $$ be the number of bits set to 1 in a particular word, the time complexity of the algorithm below is $$ O(k) $$.

### Method 2:

```python
def parity(x: int) -> int:
  result = 0
  while x:
    result ^= 1
    x = x & (x-1)
  return result
```

### Method 3 - Lookup table:

One way to improve performance processing large number of words is to utilize lookup table.
Obviously it's impossible to cache parity value of all 64-bit integer. However, we can group bits into four non-overlapping 16-bit sub-words, computing the parity of each sub-words, and then computing the parity of these four sub-results.

##### Lookup Concept

First build a **lookup table** for 2-bit word:

```
    lookup: [ 0,    1,   1,    0]
2-bit word: (00), (01), (10), (11)
```

The lookup table caches the parity value `[0,1,1,0]` of `[0b00, 0b01, 0b10, 0b11]`, respectively. Another case would be to compute the parity of `11101010`, we break up the word every 2-bit as `(11)`, `(10)`, `(10)` and `(10)` -- sub-words, then fetch the parity of these 4 sub-words from the lookup -- this becomes `[0,1,1,1]` (sub-results), we then compute the parity of the sub-results with $$ 0 \oplus 1 \oplus 1 \oplus 1 = 1 $$.

##### Implementation

We know how to build a lookup table, but we still need to know how to shift bits, so we could mask the first 2-bit with `&` to form a sub-word. Follow the previous example `11101010`, we first right shift `6` bit to get `00000011`, then `&` with `00000011`. We then shift `4` bit to get `00001110`, then mask with `00000011` again till we reach the final 2 bit.

```python
## BUILD LOOKUP TABLE WITH METHOD-1: def parity
LOOKUP =  [0,1,1,0]
for i in range(65536):
  LOOKUP.append(parity(i))

def parity(x: int) -> int:
  mask_size = 16
  mask = 0xFFFF
  return (LOOKUP[(x >> (3 * mask_size)) & mask] ^  # subword 1st item
    LOOKUP[(x >> (2 * mask_size)) & mask] ^ # subword 2nd item
    LOOKUP[(x >> (mask_size)) & mask] ^ # subword 3rd item
    LOOKUP[x & mask]) # subword 4th item
```

## 4.3 Reverse bits

### WIP

## 4.8 Rectangle Intersection (Intersection over union)

Write a program which tests if 2 rectangles have a nonempty intersection. If the intersection is nonempty, return the rectangle formed by their intersection

<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" src="{{ site.baseurl }}/assets/demo/rectangle_intersection.html"></iframe>
</div>

The example I used for the above visualization:

```
left rectangle: [x:76, y:9, width:12, height:14],
right rectangle: [x:20, y:1, width:62, height:60]
union in yellow: [x:76, y:9, width:6, height:14]
```

### Implementation

```python

Rect = collections.namedtuple('Rect', ('x', 'y', 'width', 'height'))

def intersect_rectangle(r1: Rect, r2: Rect) -> Rect:
    """ (x, y) indicates the coordinate of top-left corner

    :param r1: Rect
    :param r2: Rect
    :return:
    """

    def is_intersect(r1: Rect, r2: Rect) -> bool:
        return (r1.x + r1.width >= r2.x) and (r2.x + r2.width >= r1.x) and (r1.y + r1.height >= r2.y) and (
                    r2.y + r2.height >= r1.y)

    if is_intersect(r1, r2):
        return Rect(
            max(r1.x, r2.x),
            max(r1.y, r2.y),
            min(r1.x + r1.width, r2.x + r2.width) - max(r1.x, r2.x),
            min(r1.y + r1.height, r2.y + r2.height) - max(r1.y, r2.y),
        )
    return Rect(0, 0, -1, -1)
```

I personally prefer this though:

```python
def intersect_rectangle(r1: Rect, r2: Rect) -> Rect:
    b1 = [r1.x, r1.y, r1.x + r1.width, r1.y  + r1.height]
    b2 = [r2.x, r2.y, r2.x + r2.width, r2.y  + r2.height]
    xmin = max([b1[0], b2[0]])
    xmax = min([b1[2], b2[2]])
    ymin = max([b1[1], b2[1]])
    ymax = min([b1[3], b2[3]])
    interArea = max(0, xmax - xmin + 1) * max(0, ymax - ymin + 1)
    if interArea > 0:
        return Rect(xmin, ymin, xmax - xmin, ymax - ymin)
    return Rect(0, 0, -1, -1)
```
