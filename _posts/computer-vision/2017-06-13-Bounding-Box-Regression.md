---
title: Bounding-box regression
published: false
tags:
  - cv
---

## The concept behind Bounding Box regression:

<img align="center" src="{{ site.baseurl }}/assets/img/2017-06-09-Fast-RCNN/mapping.jpg" width="300">

We are trying to map the region propasol ($P$) to the ground truth box($G$). By doing this, we first try to map the region propasol to $\hat{G}$. $\hat{G}$ gives us a approximation to the groud truth box. All we are doing is adjusting the region propasol to fit the groud truth box as close as possible.

## Specification

We use a simple bounding-box regression stage to improve localization performance. After scoring each selective search proposal with a class-specific detection SVM, we predict a new bounding box for the detection using a class-specific bounding-box regressor. This is similar in spirit to the bounding-box regression used in deformable part models [17]. The primary difference between the two approaches is that here we regress from features computed by the CNN, rather than from geometric features computed on the inferred DPM part locations.

The input to our training algorithm is a set of $N$ training pairs ${(P,G)} $ ,where $P = (P_{x},P_{y},P_{w} ,P_{h})$ specifies the coordinates of the **center** of proposal $P$'s bounding box together with $P$'s width and height. Each ground-truth bounding box $G$ is specified in the same way: $G = (G_{x},G_{y},G_{w},G_{h})$. Our goal is to learn a transformation that maps a proposed box $P$ to a ground-truth box $G$.

We parameterize the transformation in terms of four functions $d_{x}(P), d_{y}(P), d_{w}(P), $ and $d_{h}(P)$. The first two specify a scale-invariant translation of the center of $P$'s bounding box, while the second two specify log-space translations of the width and height of $P$'s bounding box. After learning these functions, we can transform an input proposal $P$ into a predicted ground-truth box $\hat{G}$ by applying the transformation

$$
\begin{align}
\hat{G}_{x} &= P_{w}d_{x}(P)+P_{x}\\
\hat{G}_{y} &= P_{h}d_{y}(P)+P_{y}\\
\hat{G}_{w} &= P_{w} e^{d_{x}(P)}\\
\hat{G}_{h} &= P_{h} e^{d_{h}(P)}
\end{align}
$$

Each function $d_{\star}(P)$ (where $\star$ is one of $x,y,h,w$) is modeled as a linear function of the pool5 features of proposal $P$ , denoted by $\phi_{5}(P)$. (The dependence of $\phi_{5}(P)$ on the image data is implicitly assumed.) Thus we have $d_{\star}(P)= w_{\star}^{T} \phi_{5}(P)$ , where $w_{\star}$ is a vector of learnable model parameters. We learn $w_{\star}$ by optimizing the regularized least squares objective (ridge regression):

$$
\begin{equation}
w_{\star} = \arg\max_{\hat{w}_{\star}} \sum\limits_{i}^{N} (t_{\star}^{i}-\hat{w}_{\star}^{T}\phi_{5}(P))^{2}+ \lambda (||\hat{w}_{\star}||)^{2}
\end{equation}
$$

The regression targets $t_{\star}$ for the training pair $(P, G)$ are defined as

$$
\begin{align}
{t}_{x} &= ({G}_{x} -P_{x})/P_{w}\\
{t}_{y} &= ({G}_{y} -P_{y})/P_{h}\\
{t}_{w} &= \log ({G}_{w}/P_{w})  \\
{t}_{h} &= \log ({G}_{h}/P_{g})
\end{align}
$$

Note :  
The value of $P = (P_{x},P_{y},P_{w},P_{h})$ is decided according to $G = (G_{x},G_{y},G_{w},G_{h})$. The soruce code looks like this:

```py
widths = boxes[:, 2] - boxes[:, 0] + cfg.EPS # boxes[:, 0] = x-value of top-left corner
heights = boxes[:, 3] - boxes[:, 1] + cfg.EPS # boxes[:, 1] = y-value of top-left corner
ctr_x = boxes[:, 0] + 0.5 * widths # P_{x} : box center point of x
ctr_y = boxes[:, 1] + 0.5 * heights # P_{y} : box center point of y

dx = box_deltas[:, 0::4]
dy = box_deltas[:, 1::4]
dw = box_deltas[:, 2::4]
dh = box_deltas[:, 3::4]

pred_ctr_x = dx * widths[:, np.newaxis] + ctr_x[:, np.newaxis]  #P_{w}d_{x}(P)+P_{x}
pred_ctr_y = dy * heights[:, np.newaxis] + ctr_y[:, np.newaxis] #P_{h}d_{y}(P)+P_{y}
pred_w = np.exp(dw) * widths[:, np.newaxis]                     #P_{w} e^{d_{x}(P)}
pred_h = np.exp(dh) * heights[:, np.newaxis]                    #P_{h} e^{d_{h}(P)}

pred_boxes = np.zeros(box_deltas.shape)
# x1
pred_boxes[:, 0::4] = pred_ctr_x - 0.5 * pred_w
# y1
pred_boxes[:, 1::4] = pred_ctr_y - 0.5 * pred_h
# x2
pred_boxes[:, 2::4] = pred_ctr_x + 0.5 * pred_w
# y2
pred_boxes[:, 3::4] = pred_ctr_y + 0.5 * pred_h

```

### Note:

- `(boxes[r,0],boxes[r,1)` : indicates coordinate of top-left corner
- `boxes[r,2]` : indicates the width plus $x$ shift, the box width equals to `boxes[r,2] - boxes[r,0]`
- `boxes[r,3]` : indicates the height plus $y$ shift, the box height equals to `boxes[r,3] - boxes[r,1]`

<style>
#center {
    margin-left: 150px;
    width: 300px;
}
</style>
