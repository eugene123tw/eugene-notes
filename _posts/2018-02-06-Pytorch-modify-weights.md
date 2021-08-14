---
title: Modify layer weights in Pytorch
tags:
  - PyTorch
---

* Build your net: `net = create_network(protofile)`
* Load the pytorch weights: `net_state_dict = torch.load(model_path)` 

```python
load_weights(net, net_state_dict)

def load_weights(torch_model, pretrained_weights):
    # print list(pretrained_weights)

    for i, (name, params) in enumerate(pretrained_weights.items()):
        lname =  list(torch_model.state_dict())[i]
        torch_model.state_dict()[lname].copy_(params) # Copy the parameters to your net layers

    return torch_model
```