---
title: Faster RCNN
published: false
tags:
  - Computer Vision
---

<!-- more -->

## Region proposals Network

RPN 利用各種不同的尺度跟比例, 作為有效率預測 region proposals 的工具。可以把這種架構想像成一種 regression references 的金字塔, 如下圖, 用 sliding windows 的方式在 feature maps 上做移動, 每次移動都產出多種的不同的尺度跟比例 anchor boxes, 然後再去預測每個 anchor boxes 上的兩種分數 (兩個分數: 一個分數用來評分 anchor boxes 於位置上的評分, 另一個分數用來評價 anchor boxes 是物件或者不是物件)

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-23-faster-rcnn/pyramids_refbox.png">

RPN

A Region Proposal Network (RPN) takes an image (of any size) as input and outputs a set of rectangular object proposals, each with an objectness score [3]. We model this process with a **fully convolutional network** [7], which we describe in this section. Because our ultimate goal is to share computation with a Fast R-CNN object detection network [2], we assume that both nets share a common set of convolutional layers. In our experiments, we investigate the Zeiler and Fergus model [32](ZF), which has 5 shareable convolutional layers and the Simonyan and Zisserman model [3](VGG-16), which has 13 shareable convolutional layers.

To generate region proposals, we slide a small network over the convolutional feature map **output by the last shared convolutional layer**. This small network takes as input an n × n spatial window of the input convolutional feature map. Each sliding window is mapped to a lower-dimensional feature (256-d for ZF and 512-d for VGG, with ReLU [33] following). This feature is fed into two sibling fully- connected layers—a box-regression layer (reg) and a box-classification layer (cls). We use n = 3 in this paper, noting that the effective receptive field on the input image is large (171 and 228 pixels for ZF and VGG, respectively). This mini-network is illustrated at a single position in Figure 3 (left). Note that because the mini-network operates in a sliding-window fashion, the fully-connected layers are shared across all spatial locations. This architecture is naturally implemented with an n×n convolutional layer followed by two sibling 1 × 1 convolutional layers (for reg and cls, respectively).

[3]: “Region” is a generic term and in this paper we only consider rectangular regions, as is common for many methods (e.g., [27], [4], [6]). “Objectness” measures membership to a set of object classes vs. background.

## Fast R-CNN detector

## Reference

- VGG16: https://gist.github.com/baraldilorenzo/07d7802847aaad0a35d3
