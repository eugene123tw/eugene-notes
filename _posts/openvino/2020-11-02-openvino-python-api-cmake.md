---
title: Build OpenVINO™ 2021.1 Inference Engine
published: true
tags:
  - OpenVINO
  - Deep Learning
---

<!--more-->

## Build on Linux Systems

### Software Requirements
- [CMake]\* 3.13 or higher
- GCC\* 4.8 or higher to build the Inference Engine
- Python 3.6 or higher for Inference Engine Python API wrapper
- (Optional) [Install Intel® Graphics Compute Runtime for OpenCL™ Driver package 19.41.14441].
> **NOTE**: Building samples and demos from the Intel® Distribution of OpenVINO™ toolkit package requires CMake\* 3.10 or higher.

### Build Steps
1. Clone submodules:
    ```sh
    cd openvino
    git submodule update --init --recursive
    ```
2. Install build dependencies using the `install_build_dependencies.sh` script in the
   project root folder.
   ```sh
   chmod +x install_build_dependencies.sh
   ```
   ```sh
   ./install_build_dependencies.sh
   ```
3. Create a build folder:
    ```sh
    mkdir build && cd build
    ```
4. By default, the build enables the Inference Engine GPU plugin to infer models
   on your Intel® Processor Graphics. This requires you to
   [Install Intel® Graphics Compute Runtime for OpenCL™ Driver package 19.41.14441]
   before running the build. If you don't want to use the GPU plugin, use the
   `-DENABLE_CLDNN=OFF` CMake build option and skip the installation of the
   Intel® Graphics Compute Runtime for OpenCL™ Driver.

   Use the `-DENABLE_PYTHON=ON` option. To specify an exact Python version, use the following options:
   ```
   -DPYTHON_EXECUTABLE=`which python3.6` \
   -DPYTHON_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.6m.so \
   -DPYTHON_INCLUDE_DIR=/usr/include/python3.6
   ```

5. CMAKE and Make CLI:
   ```sh
   cmake -DCMAKE_BUILD_TYPE=Release -DENABLE_CLDNN=OFF -DENABLE_PYTHON=ON -DPYTHON_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.6m.so -DPYTHON_INCLUDE_DIR=/usr/include/python3.6 ..
   make --jobs=$(nproc --all)
   ```

6. Export `<INSTALL_DIR>/bin/intel64/Release/lib/python_api/python3.6/` to `PYTHONPATH` in `.bashrc`