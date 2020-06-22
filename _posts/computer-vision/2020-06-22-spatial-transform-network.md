---
title: A summary of Heaps
published: false
tags:
  - Programming Interview
  - Python
---

Source: https://pytorch.org/tutorials/intermediate/spatial_transformer_tutorial.html

```python
from __future__ import print_function

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


def array2img(x):
    """Converts a numpy array to a PIL img."""
    x = np.asarray(x)
    x = x + max(-np.min(x), 0)
    x_max = np.max(x)
    if x_max != 0:
        x /= x_max
    x *= 255
    if x.shape[2] < 3:
        x = x[:, :, 0]
    plt.imshow(x.astype('uint8'), cmap='gray')
    plt.show()


def spatial_transformer_network(feature_map, theta):
    B, C, H, W = feature_map.shape
    theta = np.reshape(theta, (B, 2, 3))
    sampling_grids = affine_grid_generator(H, W, theta)

    x_s = sampling_grids[:, 0, :, :]
    y_s = sampling_grids[:, 1, :, :]

    # sample input with grid to get output
    out_fmap = bilinear_sampler(feature_map, x_s, y_s)

    return out_fmap


def affine_grid_generator(height, width, theta):
    batch_size = len(theta)
    x = np.linspace(-1, 1, width)
    y = np.linspace(-1, 1, height)
    x_t, y_t = np.meshgrid(x, y)

    # flatten
    x_t_flat = np.reshape(x_t, [-1])
    y_t_flat = np.reshape(y_t, [-1])
    ones = np.ones_like(x_t_flat)
    sampling_grid = np.stack([x_t_flat, y_t_flat, ones])

    # repeat grid num_batch times
    sampling_grid = np.expand_dims(sampling_grid, axis=0)
    sampling_grid = np.tile(sampling_grid, np.stack([batch_size, 1, 1]))

    batch_grids = np.matmul(theta, sampling_grid)
    batch_grids = np.reshape(batch_grids, [batch_size, 2, height, width])
    return batch_grids


def get_pixel_value(feature_map, x, y):
    shape = np.shape(x)
    batch_size = shape[0]
    tmp = []
    for b in range(batch_size):
        tmp.append(feature_map[b, :, y[b], x[b]].transpose(2, 0, 1))
    return np.stack(tmp)


def bilinear_sampler(feature_map, x, y):
    H, W = np.shape(feature_map)[2:]
    max_y = H - 1
    max_x = W - 1

    # Scale back from ((-1, -1), (1/2, 1/2), (1, 1)) to ((0, 0), (W/2, H/2), (W-1, H-1)):
    # - we need to solve linear interpolation from (-1, 1) coordinate system to original coordinate system
    x = 0.5 * (max_x - 1) * (x + 1)
    y = 0.5 * (max_y - 1) * (y + 1)

    # grab 4 nearest corner points for each (x_i, y_i)
    x0 = np.floor(x).astype(np.int32)
    x1 = x0 + 1
    y0 = np.floor(y).astype(np.int32)
    y1 = y0 + 1

    x0 = np.minimum(max_x, np.maximum(0, x0))
    x1 = np.minimum(max_x, np.maximum(0, x1))
    y0 = np.minimum(max_y, np.maximum(0, y0))
    y1 = np.minimum(max_y, np.maximum(0, y1))

    Ia = get_pixel_value(feature_map, x0, y0)
    Ib = get_pixel_value(feature_map, x0, y1)
    Ic = get_pixel_value(feature_map, x1, y0)
    Id = get_pixel_value(feature_map, x1, y1)

    # calculate deltas
    wa = (x1 - x) * (y1 - y)
    wb = (x1 - x) * (y - y0)
    wc = (x - x0) * (y1 - y)
    wd = (x - x0) * (y - y0)

    # add dimension for addition
    wa = np.expand_dims(wa, axis=1)
    wb = np.expand_dims(wb, axis=1)
    wc = np.expand_dims(wc, axis=1)
    wd = np.expand_dims(wd, axis=1)

    # add dimension for addition
    out = wa * Ia + wb * Ib + wc * Ic + wd * Id
    return out


class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 10, kernel_size=5)
        self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
        self.conv2_drop = nn.Dropout2d()
        self.fc1 = nn.Linear(320, 50)
        self.fc2 = nn.Linear(50, 10)

        # Spatial transformer localization-network
        self.localization = nn.Sequential(
            nn.Conv2d(1, 8, kernel_size=7),
            nn.MaxPool2d(2, stride=2),
            nn.ReLU(True),
            nn.Conv2d(8, 10, kernel_size=5),
            nn.MaxPool2d(2, stride=2),
            nn.ReLU(True)
        )

        # Regressor for the 3 * 2 affine matrix
        self.fc_loc = nn.Sequential(
            nn.Linear(10 * 3 * 3, 32),
            nn.ReLU(True),
            nn.Linear(32, 3 * 2)
        )

        # Initialize the weights/bias with identity transformation
        self.fc_loc[2].weight.data.zero_()
        self.fc_loc[2].bias.data.copy_(torch.tensor([1, 0, 0, 0, 1, 0], dtype=torch.float))

    # Spatial transformer network forward function
    def stn(self, x):
        xs = self.localization(x)
        xs = xs.view(-1, 10 * 3 * 3)
        theta = self.fc_loc(xs)
        theta = theta.view(-1, 2, 3)

        grid = F.affine_grid(theta, x.size())
        x = F.grid_sample(x, grid)

        return x

    def forward(self, x):
        # transform the input
        x = self.stn(x)

        # Perform the usual forward pass
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.conv2_drop(self.conv2(x)), 2))
        x = x.view(-1, 320)
        x = F.relu(self.fc1(x))
        x = F.dropout(x, training=self.training)
        x = self.fc2(x)
        return F.log_softmax(x, dim=1)


if __name__ == '__main__':
    from torchvision.datasets import MNIST

    dataset = MNIST(root="/home/eugene/_DATASETS/PYTORCH_VISION", train=True, download=True)
    image1 = np.array(dataset[0][0])[np.newaxis]
    image2 = np.array(dataset[10][0])[np.newaxis]
    feature_maps = np.stack([image1, image2])

    degree = 45
    theta = np.array(
        [
            [[2 * np.cos(np.deg2rad(degree)), -np.sin(np.deg2rad(degree)), 0],
             [np.sin(np.deg2rad(degree)), 2 * np.cos(np.deg2rad(degree)), 0]],
            [[0.5, 0, 0], [0, 0.5, 0]]
        ]
    )

    out_image = spatial_transformer_network(feature_maps, theta)
    array2img(out_image[0].transpose(1, 2, 0)).show()

```
