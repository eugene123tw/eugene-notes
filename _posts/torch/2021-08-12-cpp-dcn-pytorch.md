---
title: Deformable Convolutional Network CPU version in mmcv/PyTorch
tags:
  - PyTorch
  - mmcv
  - DCN
---

## Introduction
VFNet - VarifocalNet is one of the most accurate detector available on `mmdetection` as of now. That being said, it doesn't run on CPU directly from PyTorch as the CPU version of Deformable Convoluational Network (DCN) is not implemented. The aim of this post is to walk through the procedure of adapting CUDA version to CPU version in `mmcv`. In order to do this, we first setup VSCode for C++ so we can enjoy all the convenient it provides. After that, we write `setup.py` to compile C++ files and create bindings so we can call C++ functions from Python. Finally, we test the implementation by writing a test with forward/backward pass and gradient check.

<!--more-->

## Setup VScode IDE
Download `libtorch` and define all the necessary head file paths in `c_cpp_properties.json` so VScode can find the modules.

* Download `libtorch` and save it under `/home/user`
* Add the header paths to `.vscode/c_cpp_properties.json` like the following block:
```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**",
                "/home/user/libtorch/include",
                "/home/user/libtorch/include/torch/csrc/api/include",
                "/usr/include/python3.6m"
            ],
            "defines": [],
            "compilerPath": "/usr/bin/gcc",
            "cStandard": "gnu17",
            "cppStandard": "gnu++14",
            "intelliSenseMode": "linux-gcc-x64"
        }
    ],
    "version": 4
}
```

## Building with `setuptools`
For the “ahead of time” flavor, we build our C++ extension by writing a `setup.py` script that uses setuptools to compile our C++ code. It looks something like this in `mmcv`:
```python
import glob
import os
from setuptools import find_packages, setup
from torch.utils.cpp_extension import BuildExtension, CUDAExtension


def get_extensions():
    extensions = []
    ext_name = 'ext'

    # prevent ninja from using too many resources
    os.environ.setdefault('MAX_JOBS', '4')
    define_macros = []
    extra_compile_args = {'cxx': []}

    define_macros += [('MMCV_WITH_CUDA', None)]
    cuda_args = os.getenv('MMCV_CUDA_ARGS')
    extra_compile_args['nvcc'] = [cuda_args] if cuda_args else []
    op_files = glob.glob('./mmcv/ops/csrc/pytorch/*')

    include_path = os.path.abspath('./mmcv/ops/csrc')
    ext_ops = CUDAExtension(
        name=ext_name,
        sources=op_files,
        include_dirs=[include_path],
        define_macros=define_macros,
        extra_compile_args=extra_compile_args)
    extensions.append(ext_ops)
    return extensions

setup(
    name='mmcv',
    packages=find_packages(),
    include_package_data=True,
    ext_modules=get_extensions(),
    cmdclass={'build_ext': BuildExtension})
```


## Compartmentalize CUDA and CPU code
ROI Align in mmcv is a great example as it has both the CUDA and CPU implementation. `mmcv` has two files namely `roi_align_cpu.cpp` and `roi_align_cuda.cu` for GPU/CPU. Another `roi_align.cpp` is used as a wrapper for switching between devices (CPU/GPU). As for DCN, there's already an implementation in CUDA `deform_conv_cuda.cu`, we only need to create `deform_conv_cpu.cpp`. We will make changes of the wrapper `deform_conv.cpp` to fill the CPU sections that are not implemented. 

```cpp
void deform_conv_forward(Tensor input, Tensor weight, Tensor offset,
                         Tensor output, Tensor columns, Tensor ones, int kW,
                         int kH, int dW, int dH, int padW, int padH,
                         int dilationW, int dilationH, int group,
                         int deformable_group, int im2col_step) {
  if (input.device().is_cuda()) {
    #ifdef MMCV_WITH_CUDA
        CHECK_CUDA_INPUT(input);
        CHECK_CUDA_INPUT(offset);
        CHECK_CUDA_INPUT(weight);
        CHECK_CUDA_INPUT(output);
        CHECK_CUDA_INPUT(columns);
        CHECK_CUDA_INPUT(ones);

        deform_conv_forward_cuda(input, weight, offset, output, columns, ones, kW,
                                kH, dW, dH, padW, padH, dilationW, dilationH,
                                group, deformable_group, im2col_step);
    #else
        AT_ERROR("DeformConv is not compiled with GPU support");
    #endif
  } else {
        AT_ERROR("DeformConv is not implemented on CPU");
  }
}
```

The CPU section for three functions are yet to be filled: `deform_conv_forward`, `deform_conv_backward_input` and `deform_conv_backward_parameters`. In this post, I'll focus on the forward pass. The other parts are more or less the same. 

### Forward pass of DCN on CPU device
Like the CUDA version, let's implement `deform_conv_forward_cpu` function. Basically we copy the forward function implemented in CUDA and create the same function but with the name changed accordingly. We also declare `DeformConvForwardCPULauncher` function in `deform_conv.cpp` before implement it in `deform_conv_cpu.cpp`.

```cpp
void DeformConvForwardCPULauncher(Tensor input, Tensor weight,
                                  Tensor offset, Tensor output,
                                  Tensor columns, Tensor ones, int kW,
                                  int kH, int dW, int dH, int padW,
                                  int padH, int dilationW, int dilationH,
                                  int group, int deformable_group, int im2col_step);

void deform_conv_forward_cpu(Tensor input, Tensor weight, Tensor offset,
                             Tensor output, Tensor columns, Tensor ones,
                             int kW, int kH, int dW, int dH, int padW,
                             int padH, int dilationW, int dilationH, int group,
                             int deformable_group, int im2col_step){
  DeformConvForwardCPULauncher(
      input, weight, offset, output, columns, ones, kW, kH, dW, dH, padW, padH,
      dilationW, dilationH, group, deformable_group, im2col_step);
}
```

Let's move to the most important part `DeformConvForwardCPULauncher`. In this function, we adapt `deformable_im2col` in CUDA to CPU and called the new function `deformable_im2col_cpu`.

```cpp
void deformable_im2col_cpu(Tensor data_im, Tensor data_offset, const int channels,
                                   const int height, const int width, const int ksize_h,
                                   const int ksize_w, const int pad_h, const int pad_w,
                                   const int stride_h, const int stride_w,
                                   const int dilation_h, const int dilation_w,
                                   const int parallel_imgs, const int deformable_group,
                                   Tensor data_col){
    int height_col = (height + 2 * pad_h - (dilation_h * (ksize_h - 1) + 1)) / stride_h + 1;
    int width_col = (width + 2 * pad_w - (dilation_w * (ksize_w - 1) + 1)) / stride_w + 1;
    int num_kernels = channels * height_col * width_col * parallel_imgs;
    int channel_per_deformable_group = channels / deformable_group;

    AT_DISPATCH_FLOATING_TYPES_AND_HALF(
        data_im.scalar_type(), "deformable_im2col_cpu", [&] {
            deformable_im2col_cpu_kernel<scalar_t>(
                num_kernels, data_im.data_ptr<scalar_t>(), data_offset.data_ptr<scalar_t>(), 
                height, width, ksize_h, ksize_w, pad_h, pad_w, stride_h, stride_w, 
                dilation_h, dilation_w, channel_per_deformable_group, parallel_imgs, channels,
                deformable_group, height_col, width_col, data_col.data_ptr<scalar_t>()
            );
        }
    );
}
```

`deformable_im2col_cpu_kernel` grabs the offset and compute the value. Please refer to DCN paper for more detail. 

```cpp
template <typename T> void deformable_im2col_cpu_kernel(
    const int n, const T *data_im, const T *data_offset, const int height,
    const int width, const int kernel_h, const int kernel_w, const int pad_h,
    const int pad_w, const int stride_h, const int stride_w,
    const int dilation_h, const int dilation_w,
    const int channel_per_deformable_group, const int batch_size,
    const int num_channels, const int deformable_group, const int height_col,
    const int width_col, T *data_col){
    for(int index=0; index<n; index++) {
        // index index of output matrix
        const int w_col = index % width_col;
        const int h_col = (index / width_col) % height_col;
        const int b_col = (index / width_col / height_col) % batch_size;
        const int c_im = (index / width_col / height_col) / batch_size;
        const int c_col = c_im * kernel_h * kernel_w;

        // compute deformable group index
        const int deformable_group_index = c_im / channel_per_deformable_group;

        const int h_in = h_col * stride_h - pad_h;
        const int w_in = w_col * stride_w - pad_w;
        T *data_col_ptr =
            data_col +
            ((c_col * batch_size + b_col) * height_col + h_col) * width_col + w_col;
        const T *data_im_ptr =
            data_im + (b_col * num_channels + c_im) * height * width;
        const T *data_offset_ptr =
            data_offset + (b_col * deformable_group + deformable_group_index) * 2 *
                            kernel_h * kernel_w * height_col * width_col;

        for (int i = 0; i < kernel_h; ++i) {
            for (int j = 0; j < kernel_w; ++j) {
                const int data_offset_h_ptr =
                    ((2 * (i * kernel_w + j)) * height_col + h_col) * width_col + w_col;
                const int data_offset_w_ptr =
                    ((2 * (i * kernel_w + j) + 1) * height_col + h_col) * width_col +
                    w_col;
                const T offset_h = data_offset_ptr[data_offset_h_ptr];
                const T offset_w = data_offset_ptr[data_offset_w_ptr];
                T val = static_cast<T>(0);
                const T h_im = h_in + i * dilation_h + offset_h;
                const T w_im = w_in + j * dilation_w + offset_w;
                if (h_im > -1 && w_im > -1 && h_im < height && w_im < width)
                val = deformable_im2col_bilinear_cpu(data_im_ptr, width, height, width,
                                                h_im, w_im);
                *data_col_ptr = val;
                data_col_ptr += batch_size * height_col * width_col;
            }
        }
    }
}
```

Bilinear interpolation

```cpp
template <typename T> T deformable_im2col_bilinear_cpu(
    const T *input, const int data_width, const int height, const int width, T h, T w) {
  if (h <= -1 || height <= h || w <= -1 || width <= w) {
    return 0;
  }

  int h_low = floor(h);
  int w_low = floor(w);
  int h_high = h_low + 1;
  int w_high = w_low + 1;

  T lh = h - h_low;
  T lw = w - w_low;
  T hh = 1 - lh, hw = 1 - lw;

  T v1 = 0;
  if (h_low >= 0 && w_low >= 0) v1 = input[h_low * data_width + w_low];
  T v2 = 0;
  if (h_low >= 0 && w_high <= width - 1)
    v2 = input[h_low * data_width + w_high];
  T v3 = 0;
  if (h_high <= height - 1 && w_low >= 0)
    v3 = input[h_high * data_width + w_low];
  T v4 = 0;
  if (h_high <= height - 1 && w_high <= width - 1)
    v4 = input[h_high * data_width + w_high];

  T w1 = hh * hw, w2 = hh * lw, w3 = lh * hw, w4 = lh * lw;

  T val = (w1 * v1 + w2 * v2 + w3 * v3 + w4 * v4);
  return val;
}
```

Inplace compile C++ files by running: `MMCV_WITH_OPS=1 python setup.py build_ext --inplace`

## DCN gradient check
```python
import numpy as np
import torch
from deform_conv import DeformConv2dPack
import unittest

input = [[[[1., 2., 3.], [0., 1., 2.], [3., 5., 2.]]]]
offset_weight = [[[0.1, 0.4, 0.6, 0.1]], [[0.3, 0.2, 0.1, 0.3]],
                 [[0.5, 0.5, 0.2, 0.8]], [[0.8, 0.3, 0.9, 0.1]],
                 [[0.3, 0.1, 0.2, 0.5]], [[0.3, 0.7, 0.5, 0.3]],
                 [[0.6, 0.2, 0.5, 0.3]], [[0.4, 0.1, 0.8, 0.4]]]
offset_bias = [0.7, 0.1, 0.8, 0.5, 0.6, 0.5, 0.4, 0.7]
deform_weight = [[[0.4, 0.2, 0.1, 0.9]]]

gt_out = [[[[1.650, 0.], [0.000, 0.]]]]
gt_x_grad = [[[[-0.666, 0.204, 0.000], [0.030, -0.416, 0.012],
               [0.000, 0.252, 0.129]]]]
gt_offset_weight_grad = [[[[1.44, 2.88], [0.00, 1.44]]],
                         [[[-0.72, -1.44], [0.00, -0.72]]],
                         [[[0.00, 0.00], [0.00, 0.00]]],
                         [[[0.00, 0.00], [0.00, 0.00]]],
                         [[[-0.10, -0.20], [0.00, -0.10]]],
                         [[[-0.08, -0.16], [0.00, -0.08]]],
                         [[[-0.54, -1.08], [0.00, -0.54]]],
                         [[[-0.54, -1.08], [0.00, -0.54]]]]
gt_offset_bias_grad = [1.44, -0.72, 0., 0., -0.10, -0.08, -0.54, -0.54],
gt_deform_weight_grad = [[[[3.62, 0.], [0.40, 0.18]]]]


class TestDeformconv(unittest.TestCase):
  def _test_deformconv_cpu(self, dtype=torch.float, threshold=1e-3):
    if not torch.cuda.is_available():
        return
    c_in = 1
    c_out = 1
    x = torch.Tensor(input).type(dtype)
    x.requires_grad = True
    model = DeformConv2dPack(c_in, c_out, 2, stride=1, padding=0)
    model.conv_offset.weight.data = torch.nn.Parameter(
        torch.Tensor(offset_weight).reshape(8, 1, 2, 2))
    model.conv_offset.bias.data = torch.nn.Parameter(
        torch.Tensor(offset_bias).reshape(8))
    model.weight.data = torch.nn.Parameter(
        torch.Tensor(deform_weight).reshape(1, 1, 2, 2))
    model.type(dtype)
    out = model(x)
    out.backward(torch.ones_like(out))

    assert np.allclose(out.data.detach().cpu().numpy(), gt_out, threshold)
    assert np.allclose(x.grad.detach().cpu().numpy(), gt_x_grad, threshold)
    assert np.allclose(
        model.conv_offset.weight.grad.detach().cpu().numpy(),
        gt_offset_weight_grad, threshold)
    assert np.allclose(model.conv_offset.bias.grad.detach().cpu().numpy(),
                        gt_offset_bias_grad, threshold)
    assert np.allclose(model.weight.grad.detach().cpu().numpy(),
                        gt_deform_weight_grad, threshold)

  def test_deformconv(self):
    self._test_deformconv_cpu(torch.double)
    self._test_deformconv_cpu(torch.float)

```

## Inference output comparison with image from COCO dataset

### Output from CUDA forward
<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2021-08-12-cpp-dcn-pytorch/myplot_gpu.png"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Inference CUDA output 
        </div>
    </div>
</div>

### Output from CPU forward
<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2021-08-12-cpp-dcn-pytorch/myplot_cpu.png"/>
    <div class="card-body bg-light">
        <div class="card-text">
            Inference CPU output 
        </div>
    </div>
</div>


## Useful Resources
* [DCNv2 CPU version code](https://github.com/eugene123tw/mmcv-dcnv2)
* [PyTorch Official post: Custom C++ and CUDA Extensions](https://pytorch.org/tutorials/advanced/cpp_extension.html)
* [Github basic example: C++/CUDA Extensions in PyTorch](https://github.com/pytorch/extension-cpp)
* [C++ Implementation of PyTorch Tutorials](https://github.com/prabhuomkar/pytorch-cpp)