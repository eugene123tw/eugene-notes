---
title: VisualBackProp
published: false
tags:
  - Computer Vision
---

這次要介紹由 Nvidia, NYU,Google Brain Robotics 共同發表的論文。這個方法可以在短時間內找出圖形中對 CNN 預測模型貢獻最多的 pixel sets。 此篇論文所提出的方法主要是作為自駕車 CNN-based system 的 debug 工具。

<!--more-->

# Intro

視覺化工具的目標主要是在偵測出原圖中對預測結果影響最深的部位, 其實也可以把這個工具當成一個 debug 工具, 因為我們希望在 training 前期時就知道我們的模型有在偵測出圖形預測的合理線索。

這個方法仰賴了一個直覺, 就是當 Network 越深的時候 feature map 含的資訊就會越精華, 對最後預測的結果也會越重要。如果是這樣那最後一層的 CNN feature maps 應該就會包含影響預測結果的關鍵資訊, 但通常 deep neural network 最後一層的 feature maps 解析度都比較低(例如用一張 224 x 224 的圖輸入經過 VGG 16 模型, 最後一層的 feature map 只會剩下 14 x 14 )。 那如果結合底層(deep)解析度差但資訊量含量較高的 feature maps 與淺層(shallow)解析度高但資訊量含量較少的 feature maps, 那這樣我們是不是就可以得到一個還不錯的圖形遮罩？

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/figure1.png">

# Visualization method

如先前提到, 這個方法希望能結合底層(deep)解析度差但資訊量含量較高的 CNN layer 與淺層(shallow)解析度高但資訊量含量較少的 CNN layer feature maps。 為了能達到此目的, 這個模型會將圖形中有關係的區域資訊 back-propagate 但同時也提高解析度。這邊的 back-propagation 是 value-based。這也是為什麼這篇的名稱會取做 VisualBackProp, 因為是對圖的數值做 back-propagation 而非傳統的 gradient-based back-propagation。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/figure2.png">
基本架構可以見圖2a。

為了得到圖形的預測結果, 我們一定會將圖形 forward pass, 而此方法將會在 forward pass 結束後進行。這個方法會將每層的 ReLu layer 後的 feature maps 平均, 以得到每一層的 averaged feature maps (例如某$l$層原本有 64 個 feature maps 全部平均後得到一個平均的 feature map) 。再來將最深層的 conv layer 平均過後的 feature map scale up 到跟前一層 feature map 一樣的大小。這邊 scaling 的方法是利用 deconvolution (小編這邊先不詳細介紹 Deconvolution Network, 有興趣的讀者可以參考 XXXX)。得到 deconv 後的 averaged feature map 在跟前一層的 averaged feature map 以 point-wise 的方式相乘。一直重複此方法直到源頭, 最後就可以得到跟原圖一樣大小的 mask, 再來將 mask 標準化到閉區間[0,1]。

上圖 2(b)的例子中, 左邊是 averaged feature maps, 順序是輸入的圖形在最上層;輸出的圖形在最底層。右邊是對應的遮罩,也就是 point-wise 相乘後的結果, 從右邊可以看出遮罩從 network 的輸出直到輸入成行的過程。下圖是擷取最上層中 averaged feature 與 Mask, 可以發現 Mask 中許多細節被移除, 讀者可以自行比較一下。如果讀者有興趣可以參考原文中的理論推導。

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/compare.png">

# 實驗

小篇擷取了下面幾張圖讓讀者比較此方法跟 LRP 在自駕車上應用的結果

<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/figure6.png">
<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/figure7.png">
<img id="center" src="{{ site.baseurl }}/assets/img/2017-07-11-VisualBackProp/figure8.png">

# 結論

這篇 paper 提出了視覺化圖形中重要區域的方法。透過實驗也證明這個方法相當有效率而且可以用來作為即時應用, 這個方法也不侷限於應用在自駕車, 也可以拿來嘗試辨識 satellite images 中的道路等等。如果讀者有興趣可以參考論文在理論上的證明。
