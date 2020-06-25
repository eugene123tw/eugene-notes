---
title: From R-CNN to Faster R-CNN
published: false
tags:
  - Computer Vision
---

## Object Detection

Goal : Find where and what

- Convolutional : sliding window operations
- Feature : encoding **what** (and implicitly encoding **where**)
- Map : explicitly encoding **where**

## RCNN

### Steps

1. Run Region Proposals (~2000 proposals).
2. Warped region proposals image to the same size.
3. Run CNN on each Warped region proposals.
4. Classify region-based features

### How can we improve?

1. Given proposal regions, what we need is a **feature for each region**. Running a CNN on each proposal(~2000 CNN) to get feature is tedious.

2. What about cropping feature map regions? If we can extract feature map using a single CNN.,them there is no need to run CNN on each proposals.

## Fast-RCNN

### Steps

1. Compute convolutional feature maps on the entire image only once.
2. Project an image region to a feature map region.
3. Extract a region-based feature from the feature map region
4. Classify region-based features

### How Can we improve?

Perform region proposal on the same set of feature maps. (Run Region Proposal on Feature Maps)

## Faster-RCNN

[Understanding Neural Networks Through Deep Visualization](yosinski-2015-ICML-DL-understanding-neural-networks)
<img id="center" src="{{ site.baseurl }}/assets/img/2017-06-21-RCNN-FasterRCNN/feature_map.png">

<img id="center" src="{{ site.baseurl }}/assets/img/2017-06-21-RCNN-FasterRCNN/feature_map_2.png">
