---
title: A summary of bit manipulation
published: true
tags:
  - Bit Manipulation
  - Programming Interview
  - Python
---

# Bit Manipulation
* Objectives:
  * Be very comfortable with the **bitwise operators**, particularly XOR
  * Understand how to use **masks** and create them in an **machine independent** way
  * Know fast ways to **clear the lowermost set bit** (and by extension, set the lowermost  0, get it's index, etc)
  * Understanding signedness and its implications to **shifting**
  * Consider using a **cache** to accelerate operations by using it to brute-force small inputs

<!--more-->

## Some useful debug functions

* Convert an integer number to a binary string prefixed with “0b”. Some examples:
```python
>>> bin(3)
'0b11'
>>> bin(-10)
'-0b1010'
```

* Convert integer to bits and formats the output to fit in 10 characters width - 2 characters for `0b` prefix, 8 for rest binary digits. 
```python
>>> format(14, '#010b')
'0b00001110'
```

* Convert bits to integer
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

### Odd/Even number check (Parity check)
Because of the previous property, it becomes easy to check the [parity] of a binary number by using a mask equals to 1. 

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

[Parity]: https://en.wikipedia.org/wiki/Parity_(mathematics)

## OR `|` operator (Set union)
* Syntax `x | y`: 
  * Returns each bit of the output 0 if the corresponding bit of `x` AND of `y` is `0`, otherwise it's `1`.

```
 A: 0011 = 3
|B: 0010 = 2
-------------
    0011 = 3
```

## NOT `~` Operator
* Syntax `~x`: 
  * Returns the complement of `x` - the number you get by switching each 1 for a 0 and each 0 for a 1. This is the same as `-x-1`.

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
    0000
```

#### References:  
* https://en.wikipedia.org/wiki/Two%27s_complement
* https://zh.wikipedia.org/wiki/%E4%BA%8C%E8%A3%9C%E6%95%B8  
* https://stackoverflow.com/questions/7278779/bit-wise-operation-unary-invert  


## Left Shifts `<<` operator

* Syntax: `x << y`: 
  * This returns `x` with the bits shifted to the left by `y` places (and new bits on the right-hand-side are zeros). This is the same as **multiplying** `x` by `2**y`.

For example, shift `26` one bit to the left, and shift one bit left again from the previous shifted result.
```
>>> 26 << 1, 26 << 1 << 1
Origin: 0001 1010 = 26 
    LS: 0011 0100 = 26 * (2**1) = 52
    LS: 0110 1000 = 26 * (2**2) = 104
```

## Right Shifts `>>` operator

* Syntax: `x >> y`: 
  * This returns `x` with the bits shifted to the right by `y` places (and new bits on the left-hand-side are zeros). This is the same as **dividing** `x` by `2**y`.

For example, shift `104` one bit to the right, and shift one bit right again from the previous shifted result.
```
>>> 104 >> 1, 104 >> 1 >> 1
Origin: 0110 1000 = 104
    RS: 0011 0100 = 104 / (2**1) = 52
    RS: 0001 1010 = 104 / (2**2) = 26
```
As you can see we are back at 26 again! 


## Common usages

### Get Bit
* Syntax `(x & (1 << y)) != 0`:
  * Returns the `y+1`th bit from `x`
    * `(1 << y)` creates a mask with `1` located at `y+1`
    * Perform `&` operation on `x` with the mask we created above 
    * Result returns `True` if the `y+1`th bit is 1, otherwise `False`

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

### Set Bit
* Syntax `x | (1 << y)`:
  * Set the `y+1`th bit to 1 to `x`
    * `(1 << y)` creates a mask with 1 located at `y+1`
    * Perform `|` operation on `x` with the mask we created above 

For example, set the 4th bit (`y:3`) of value 7 (`x:7`): 
```
>>> 7 | (1 << 3)
        x: 0111
|(1 << 3): 1000 
----------------
           1111
```

### Clear Bit
* Syntax `x & ~(1 << y)`:
  * Clear the `y+1`th bit of `x`
    * `(1 << y)` creates a mask 1 located at `y+1`, then invert the mask with XOR -- `~(1 << y)`
    * Perform `&` operation on `x` with the mask we created above 

For example, set the 1th bit (`y:0`) of value 7 (`x:7`): 
```
>>> 7 & ~(1 << 0)
          x: 0111
& ~(1 << 0): 1110 
------------------
             0110
```