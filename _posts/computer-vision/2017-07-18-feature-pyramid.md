---
title: Feature Pyramid Networks for Object Detection
published: false
tags:
  - Computer Vision
---

這篇主要由 FAIR 的 3 位大神共同參與 Piotr Dollar, Ross Girshick, 何凱明, 內容的論述也是相當精彩。
用了簡單的概念就把過去在訓練多尺度特徵時所詬病的問題解決了, 如果對 object detection 與 classification 有興趣的讀者, 也不妨參照論文中的方法來實作一次。

下圖讓小篇簡單介紹目前幾種擷取特徵與預測的方法:
<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure1.png">

- Figure 1: 藍色框框代表 feature maps, 粗線條代表語義上強的 feature maps
- Figure 1(a) - **Featurized image pyramids**: 利用**[圖像金字塔]**得到每個不同尺度的圖形, 以不同尺度的圖形訓練, 得到不同尺度的 feature maps 並做預測, 這樣的優點為每個不同尺度的 feature maps 語義都很強, 在每個 feature maps 上進行預測也較不容易失真, 缺點是這樣訓練相當耗費時間且不實際。而不同尺度的特徵構成的集合稱為特徵金字塔 (feature pyramids)
- Figure 1(b) - **Single Feature Map**: 最傳統的方法, 單一尺度的圖形透過 ConvNets 產出最上層單一尺度但特徵語義強的 feature map, 並在單一尺度的 feature maps 上做預測
- Figure 1(c) - **Pyramid Feature Hierachy**: (b)方法的變形, 類似 SSD 使用的方法, input 也是單一尺度的圖形但在各層的 feature maps 上都做預測, 但也因為將較淺層的 feature maps 一併納入預測所以效果不如預期
- Figure 1(d) - **FPN**: 本文採用的方法, 透過 button-up, top-down 最後再做側向連結(lateral connection), 並在每個尺度語義都很強的 feature maps 上做預測

# Introduction

在圖形預測中, 最基本的方式就是只對一種尺度的圖形進行訓練並在最上層的 feature maps 進行預測。但是近期的圖像辨識競賽(例如 ImageNet, COCO detection challenges), 前幾名的方法都會應用 featurized image pyramids 的方法, 以多尺度的圖形進行測試 (multi-scale testing), 這樣的優點在於我們可以得到在每種尺度上的特徵且在每個尺度上的特徵語義都很強。

然而, 以這樣的方法進行推論, 訓練/測試時間會大幅增加, 讀者也可以試想一下, 一種模型但是要在不同尺度的圖形上進行訓練, 是相當耗費時間且不實際的。再者, 以記憶體使用的角度來看, 要一次訓練多種尺度的模型也是不可能的。因為上述原因, 通常只有在測試的時候會用 Featurized image pyramids, 但是只在測試時使用, 會造成訓練與測試時推論上的不一致。

雖然如此, 但其實 Featurized image pyramids 並不是唯一可以讓我們提取多尺度特徵的方法。讀者可以思考一下, 其實在訓練 Deep ConvNet 時就已經在計算不同尺度的特徵, 以 VGG 舉例來說, 每次只要經過 3-4 次的 Conv layer,都會做一次降維 (down-sampling), 降維的方式可以 MaxPooling 或是 Average Pooling, 但是通常都會以 $2^{-1}$ 階層遞減, 例如原本 512 x 512 大小的圖形做降維會得到 256 x 256, 再一次 128 x 128,..., 依此類推, 其實圖像金字塔本身的概念也大致如此。以這樣的方式得到各個階層的特徵, 再以特徵產生各個不同解析度的 feature maps, 但是也因為深度的不同會造成不同 feature maps 語義上的差距, 高解析度較淺層的 feature maps 會帶有較低階的特徵, 這些表徵通常對物件識別都較無鑑別度, 而低解析度但較深層 feature maps 會帶有較好的特徵, 這些表徵對物件識別也較有用。

Single Shot Detector 是其中一個嘗試 Conv pyramid feature 的方法 (如下圖), 也就是利用每一層的 feature maps 進行預測推論。照理來說, SSD 應該重複利用在 forward pass 時每層的 feature maps, 但是 SSD 為了避開 low-level features 所以拋棄較淺層的 feature maps, 直接於較高層的 feature 上 (VGG 中的 conv4-3) 建立 pyramid 並且多加了幾層。也因此 SSD 失去了善用高解析度 feature maps 的特徵。本文也證明這些較淺層的特徵對於偵測較小的物件是相當重要的。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure1c.png">

此篇論文的目的在找出一個方法平衡 ConvNet 特徵階層的大小但同時也產出每個尺度語義都很強的特徵金字塔。本篇論文提出的架構如下圖, 這個架構由兩個方法構成 1. top-down pathway 與 2.側向連結 (lateral connections) 結合高層低解析度但語義強的特徵與低層高解析度但語義弱的特徵。透過這樣的方式就可以得到一個在每個階層語義都很強的特徵金字塔, 也因為我們只需要訓練一種尺度圖形的模型所以解決了耗時與記憶體不足的問題。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure1d.png">

類似的架構在 [28, 17, 8, 26] 也有被提出。但是這些方法都是產生出一個高層的 feature map, 並在單一的 feature map 上做預測, 架構可見下圖。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure2a.png">

讀者可以比較一下本文提出的方法, 在每一階層的 feature pyramid 都進行一次預測 ,如下圖

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure2b.png">

這篇將上述的方法稱作 Feature Pyramid Network (FPN), 作者將這個方法結合到 Faster R-CNN, 只用了一個模型就在 COCO 與 VOC detection 的成績大幅超過其他方法, 讀者如果對詳細實驗數據有興趣可參考本文。

讀者可以試看看用 Feature Pyramid Network (FPN)的方法訓練模型, 以這樣的方式就只需要對一種尺度的圖形進行訓練/測試, 而不需要對不同尺度的圖形分別進行訓練跟測試, 可以省下很多時間跟記憶體資源。

# Feature Pyramid Networks

本篇論文主要討論 FPN 如何使用於 Faster RCNN 裡的 Region Proposal Network 與 Fast RCNN 裡的 region-based detectors, 但其實 FPN 的用途不只限於 detection, 也可以套在一般的 classification 中。

本篇論文以 ResNets 當為背後 CNN 的主架構 (Backbone), 讀者也可以使用 VGG 或 DenseNet。 首先先由任一種 ConvNets 做出 bottom-up pathway, 再透過 up-sampling 做出 top-down pathway, 在 top-down pathway 的同時也進行側向連結(lateral connections), 如下圖。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-18-feature-pyramid/figure3.png">

## Bottom-up pathway

其實上面已經大致講完 Bottom-up pathway 在做的了, 詳細說明就是先由你訓練的 ConvNet 骨幹 (VGG, AlexNet, ResNet,...)
進行一次 feed-forward propagation, 在計算的過程先把每一階段, max pooling 前的 feature maps 存起來。什麼叫做每一階段呢？ 以 VGG 作為例子, 在每一次 Max Pooling 前 feature maps 的維度基本上是不變的, 基本上 Max Pooling 前就算是一個階段, 所以以 VGG 而言就可分為 5 個階段因為做了 5 次 Pooling。 那為什麼要選每一階段最後一個 feature maps 存起來？ 為什麼不每個階段的 feature maps 都存呢？因為在每一階段中最好的 feature maps 都會在最後一個 Conv layer。

## Top-down pathway and lateral connections

接下來就是介紹要怎麼做側向連結 (lateral connections), 以原圖 256 x 256 與 VGG 為例, 做完 Bottom-up pathway 與 5 次 pooling, 最後一個 feature map 的大小就只剩下 8 x 8, 我們再由 8 x 8 做一次 nearest neighbor up-sampling 就可以得到 16 x 16 的 up-sampling feature maps, 這時候再把剛剛存好的第 4 個階段大小 16 x 16 的 feature maps 做 element-wise 相加就做完側向連結。 做完側向連結的 feature maps, 我們還會再加一個 3 × 3 Conv layer 來產生最後的 feature maps, 多加 Conv lyaer 為的是減少在 up-sampling 時所產生摺疊的問題。

# Conclusion

這篇論文主要解決了 multi-scale feature pyramids 的一些根本問題, 只用了 single model 就可以讓預測結果大幅提高, 如果讀者對 FPN 用在 RPN 與 Fast R-CNN 有興趣也可參考原文, 小編就不帶大家一一走過實驗數據與如何將 FPN 應用於 Faster RCNN。

# Reference

[圖像金字塔](http://www.opencv.org.cn/opencvdoc/2.3.2/html/doc/tutorials/imgproc/pyramids/pyramids.html)
