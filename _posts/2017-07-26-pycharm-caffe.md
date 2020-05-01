---
title: Import caffe in pycharm
published: false
tags:
  - cv
---

I set Virtual Environment in pycharm.  
But ```caffe``` can not import straightly.  
If I start python from terminal, everything works fine miracally.  
I am guessing it's because ```.bashrc``` is called when terminal started and not called when pycharm started.  
I spent hours and hours to figure out, but in vain.  
Below is the error code I got when I ```import caffe```.  

``` python
Connected to pydev debugger (build 171.4694.38)
Traceback (most recent call last):
  File "/home/eugene/Documents/pycharm-2017.1.4/helpers/pydev/pydevd.py", line 1591, in <module>
    globals = debugger.run(setup['file'], None, None, is_module)
  File "/home/eugene/Documents/pycharm-2017.1.4/helpers/pydev/pydevd.py", line 1018, in run
    pydev_imports.execfile(file, globals, locals)  # execute the script
  File "/home/eugene/Documents/py-faster-rcnn/tools/demo.py", line 17, in <module>
    from fast_rcnn.test import im_detect
  File "/home/eugene/Documents/py-faster-rcnn/tools/../lib/fast_rcnn/test.py", line 14, in <module>
    import caffe
  File "/home/eugene/Documents/py-faster-rcnn/tools/../caffe-fast-rcnn/python/caffe/__init__.py", line 1, in <module>
    from .pycaffe import Net, SGDSolver, NesterovSolver, AdaGradSolver, RMSPropSolver, AdaDeltaSolver, AdamSolver, NCCL, Timer
  File "/home/eugene/Documents/py-faster-rcnn/tools/../caffe-fast-rcnn/python/caffe/pycaffe.py", line 12, in <module>
    from ._caffe import Net, SGDSolver, NesterovSolver, AdaGradSolver, \
ImportError: libcudart.so.8.0: cannot open shared object file: No such file or directory

Process finished with exit code 1
```
Eventually, some people mentioned I can try start Pycharm from the terminal.  
So, redirect to the project folder and keyin the following command in terminal ```charm .```.  
Pycharm will start shortly after you enter the command.  
Everything should works fine now!  
Have Fun!

* Reference solution:  
Sol1: <https://stackoverflow.com/questions/33371954/pycharm-import-caffe-error/33397590>  
Sol2: <https://stackoverflow.com/questions/39827242/i-can-not-import-caffe-in-pycharm-but-i-can-import-in-terminal-why>  
Sol3: <https://askubuntu.com/questions/684550/importing-a-python-module-works-from-command-line-but-not-from-pycharm>  
Sol4: <https://stackoverflow.com/questions/39500438/opening-pycharm-from-terminal-with-the-current-path)>  
Sol5: <https://stackoverflow.com/questions/27063361/how-to-run-pycharm-in-ubuntu-run-in-terminal-or-run)> 