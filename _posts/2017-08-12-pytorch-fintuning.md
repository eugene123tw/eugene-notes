---
title: PyTorch fine tuning
tags:
  - cv
---

<!--more-->

* Prepare a ```skip_list=[]```, append keys you want to skip in the ```skip_list```. 
* Prepare a pytorch model we want to fine tune (```model```).
* Prepare a pretrained model (e.g.  ```vgg16-397923af.pth```)

```python
pretrained_file = 'vgg16-397923af.pth'
pretrained_dict = torch.load(pretrained_file)
```

* ```pretrained_dict```: containing a whole state of the pretrained model (```vgg16-397923af.pth```).


```python
model_dict = model.state_dict()
```

* ```model_dict```: containing a whole state of the PyTorch model we defined.

* ```state_dict() ```, returns a dictionary containing a whole state of the module. Both parameters and persistent buffers (e.g. running averages) are included. Keys are corresponding parameter and buffer names. 

Filter out unnecessary keys and values defined in ```skip_list``` from the pretrained model.

```python
# 1. filter out unnecessary keys and values from the pretrained model
pretrained_dict1 = {k: v for k, v in pretrained_dict.items() if k in model_dict and k not in skip_list }
```

Check the keys from the model we want to fine tune, pretrained model and the transfered model
```python
print('model_dict.keys()')
print(model_dict.keys())
print('pretrained_dict.keys()')
print(pretrained_dict.keys())
print('pretrained_dict1.keys()')
print(pretrained_dict1.keys())
```

```model.load_state_dict(model_dict)```, copies parameters and buffers from ```model_dict``` into ```model``` module and its descendants. The keys of ```model_dict``` must exactly match the keys returned by this module’s ```state_dict()``` function.

``` python 
# 2. overwrite entries in the existing state dict
model_dict.update(pretrained_dict1)
# 3. load the new state dict
model.load_state_dict(model_dict)
```

## Reference
ref1:<http://pytorch.org/docs/master/notes/autograd.html>  
ref2:<https://discuss.pytorch.org/t/how-to-load-part-of-pre-trained-model/1113/3>  
state_dict():<http://pytorch.org/docs/master/nn.html#torch.nn.Module.state_dict>  