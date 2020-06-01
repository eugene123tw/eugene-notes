---
title: A summary of Binary Tree
published: true
tags:
  - Programming Interview
  - Python
---

## Full binary tree

A full binary tree is a binary tree in which **every node other than the leaves has two children**.

<div id="full_binary_tree"></div>

## Perfect binary tree

A perfect binary tree is a full binary tree in which **all leaves are at the same depth**, and in which every parent has two children.

<div id="perfect_binary_tree"></div>

## Complete binary tree

A complete binary tree is a binary tree in which every level, except possibly the last, is completely filled, and all nodes are as far left as possible

<div id="complete_binary_tree"></div>

## Tree traversing

<div id="example_tree"></div>

### In-order traverse

Traverse the left subtree, visit the root, then traverse the right subtree

```python
def tree_traverse(root):
  tree_traverse(root.left)
  print("In-order: %d" % root.data)
  tree_traverse(root.right)
```

### Pre-order traverse

Visit the root, traverse the left subtree, then traverse the right subtree

```python
def tree_traverse(root):
  print("Pre-order: %d" % root.data)
  tree_traverse(root.left)
  tree_traverse(root.right)
```

### Post-order traverse

Traverse the left subtree, traverse the right subtree, and then visit the root

```python
def tree_traverse(root):
  tree_traverse(root.left)
  tree_traverse(root.right)
  print("Post-order: %d" % root.data)
```

### 9.1 Test if a binary tree is height-balanced

A binary tree is said to be height-balanced if fore each node in the tree, the difference in the height of its left and right subtrees is at most one.

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-05-22-binary-tree/unbalanced_tree-1.svg"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Unbalance Tree
        </div>
    </div>
</div>

For instance, at node `A`, the height of the left subtree is 3, and 2 for the right subtree, because the height difference is 1, the tree is balanced at node `A`. However, at node `B` the height of left subtree and right subtree is 0, and 2. Therefore, this tree is unbalanced.

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-05-22-binary-tree/unbalanced_tree-2.svg"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Unbalanced Subtree
        </div>
    </div>
</div>

The brute-force solution is to compute the height of its left and right subtrees **for each node**. Once found the height difference is larger than 1, the programme returns a boolean value. Otherwise, keep searching recursively.

```python
def is_balanced_binary_tree(tree: BinaryTreeNode) -> bool:
    def maxDepth(root):
        if root is None:
            return 0
        else:
            left_depth = maxDepth(root.left)
            right_depth = maxDepth(root.right)
            if left_depth > right_depth:
                return left_depth + 1
            else:
                return right_depth + 1

    if tree:
        height = {'right': 0, 'left': 0}
        height['left'] = maxDepth(tree.left)
        height['right'] = maxDepth(tree.right)
        if abs(height['left'] - height['right']) > 1:
            return False
        if not is_balanced_binary_tree(tree.left):
            return False
        if not is_balanced_binary_tree(tree.right):
            return False
        return True
    return True
```

### 9.2 Test if a binary tree is symmetric

A binary tree is symmetric if you can draw a vertical line through the root and then the left subtree is the mirror of the right subtree.

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-05-22-binary-tree/symmetric_tree.svg"/>
    <div class="card-body bg-light">
        <div class="card-text">
            (a) Symmetric Tree (b) Asymmetric Tree (Data Asymmetric) (c) Asymmetric Tree
        </div>
    </div>
</div>

```python
def is_symmetric(tree: BinaryTreeNode) -> bool:
    def check_symmetric(subtree_0, subtree_1):
        if not subtree_0 and not subtree_1:
            return True
        elif subtree_0 and subtree_1:
            return (subtree_0.data == subtree_1.data) and \
                   check_symmetric(subtree_0.left, subtree_1.right) and \
                   check_symmetric(subtree_0.right, subtree_1.left)
        return False
    return check_symmetric(tree.left, tree.right)
```

<script type="module">
import {
  build_binary_tree,
  tree_traversal,
  tree_to_d3stratify,
  CreateBinaryTreeGraph,
} from "/eugene-notes/assets/demo/js/binarytree.js";

var width = 420;
var padding = 30;

// Full binary tree, Perfect binary tree, Complete binary tree



var full_binary_root = d3.stratify()([
  {id: "1"},
  {id: "2" , parentId: "1"},
  {id: "3", parentId: "1"},
  {id: "4" , parentId: "2"},
  {id: "5" , parentId: "2"},
  {id: "6", parentId: "4"},
  {id: "7", parentId: "4"},
]);

var perfect_binary_root = d3.stratify()(
  tree_to_d3stratify(
    build_binary_tree([1, 2, 3, 4, 5, 6, 7]),));

var complete_binary_root = d3.stratify()(
  tree_to_d3stratify(
    build_binary_tree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])));

var non_balanced_tree_root = d3.stratify()(
  tree_to_d3stratify(
    build_binary_tree([1, 2, 3, null, 5, 6, null, null, 9])
  ));

// Tree Traverse 
var example_root = d3.stratify()([
  {id: "A"},
  {id: "B" , parentId: "A"},
  {id: "C", parentId: "B"},
  {id: "D" , parentId: "C"},
  {id: "E" , parentId: "C"},
  {id: "F", parentId: "B"},
  {id: "null", parentId: "F"},
  {id: "G", parentId: "F"},
  {id: "H", parentId: "G"},
  {id: "null", parentId: "G"},
  {id: "I", parentId: "A"},
  {id: "J", parentId: "I"},
  {id: "null", parentId: "J"},
  {id: "K", parentId: "J"},
  {id: "L", parentId: "K"},
  {id: "null", parentId: "L"},
  {id: "M", parentId: "L"},
  {id: "N", parentId: "K"},
  {id: "O", parentId: "I"},
  {id: "P", parentId: "O"},
]);

var non_balanced_tree_root = d3.stratify()([
      { id: "A" },
      { id: "B", parentId: "A" },
      { id: "C", parentId: "A" },
      { id: "null", parentId: "B" },
      { id: "D", parentId: "B" },
      { id: "null", parentId: "D" },
      { id: "E", parentId: "D" },
      { id: "F", parentId: "C" },
      { id: "null", parentId: "C" },
    ]);

CreateBinaryTreeGraph(full_binary_root, width, $("#full_binary_tree")[0]);
CreateBinaryTreeGraph(perfect_binary_root, width, $("#perfect_binary_tree")[0]);
CreateBinaryTreeGraph(complete_binary_root, width, $("#complete_binary_tree")[0]);
CreateBinaryTreeGraph(example_root, width, $("#example_tree")[0], 40, 50);


</script>
