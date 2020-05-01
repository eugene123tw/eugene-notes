---
title: Meta-Learning
comments: true
tags:
  - meta-learning
---

## How do we prepare data generator for meta-learning?
Basically each batch is a task (and also, **mini-batches of tasks**). Each task comprise with $$N$$-class and $$K$$-shots. Technically, during sample, we would sample $$N$$ classes from a pool of classes/labels to form a batch (task). Of course, we will also sample $$K$$ instances(e.g. images,documents, etc.) within each sampled $$N$$ classes.

<!--more-->

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-03-06-Meta-Learning/ravi_larochelle.png"/>
    <div class="card-body bg-light">
        <div class="card-text"> Ravi & Larochelle </div>
    </div>
</div>


### Prepare meta-train dataset
The meta-train of the above example comprises of 2 tasks ($$i = 1, 2$$). Each task has ***5*** classes and ***1*** shot for each class. The sampled classes in $$ \mbox{task}_{1}$$ has a bird, tank, dog, person, piano. And then, we randomly sample 1-shot from each class to form $$ D_{i=1}^{train} $$. 

#### Reserve a test set $$\mathcal{D}^{ts}$$ in meta-train for each task: 
We also random sample 1-shot from 2 random classes to form $$ D_{i}^{ts} $$ for $$\mbox{task}_{i}$$. These 2 classes are from the 5 classes - bird, tank, dog, person, piano, that we sampled earlier. Concatenate this to meta-train, because we are going to use test set for training.

***What? We're going to use test set for training!?***
> Don't worry, we will sample meta-test dataset for testing/evaluation!

Now, the meta-train looks like this for those 2 tasks: 
\$$ D_{\text{meta-train}} = \{ (D_{i=1}^{tr}, D_{i=1}^{ts}), (D_{i=2}^{tr}, D_{i=2}^{ts}) \} $$

Specifically, we define some common terms of data sampling in meta-learning like this:

<div class="card mb-3">
    <img class="card-img-top" src="{{ site.baseurl }}/assets/img/2020-03-06-Meta-Learning/temp-figure0.png"/>
    <div class="card-body bg-light">
        <div class="card-text"> Figure1: In this example, we describe what tasks, meta-train and meta-test are in a visualize way. </div>
    </div>
</div>


### Key Idea
> Training procedure is based on simple machine learning principle: test and train conditions must match.

**In meta-train data: $$\mathcal{D}_{\mbox{meta-train}}$$**
* we have many tasks and we would sample training ($$\mathcal{D}^{\mbox{tr}}$$) and testing set ($$ \mathcal{D}^{\mbox{ts}} $$) for each individual $$\mbox{task}_{i}$$. We should follow the same regime of sampling meta-testing $$\mathcal{D}_{\mbox{meta-test}}$$.

## How do we train a meta-learner with black-box adaptation?

In black-box adaptation, we use $$\mathcal{D}_{\mbox{meta-train}}$$ to train a model $$f_{\theta}$$ that will generate embedding $$\phi$$ from task specific training data $$\mathcal{D}^{\mbox{tr}}$$. The idea is to use $$\phi$$ and $$D^{\mbox{ts}}$$ to optimize $$\theta$$.

<center>
$$ \begin{align*}
\theta^{\star} &= \max\limits_{\theta} \sum\limits^{\boldsymbol{T}}_{i=1} \log p(\phi_{i}| \mathcal{D}_{i}^{\mbox{ts}}) \mbox{ where} \\
\phi_{i} &= f_{\theta}(\mathcal{D}^{\mbox{tr}}_{i}) \end{align*}
$$ 
</center>

### How exactly do we generate $$ \phi $$ that represent $$\mathcal{D}^{\mbox{tr}}$$?


