---
title: Tensorflow Object Detection API
published: false
tags:
  - cv
---

# Run Faster R-CNN using Tensorflow Object Detection API

這次小編要用 Tensorflow 新推出的 Object Detection API 帶大家走一遍 Faster RCNN 的training。
Faster RCNN 是 object detection 中的經典方法, 而 object detection 主要是由 classification 與 localization 所組成。
更細部的介紹可以參考 [cs231n]

<img id="center" src="{{ site.baseurl }}/assets/img/2017-06-27-TF-Detection-API/detection.png">

## 安裝 Detection API
先照著 [Tensorflow Object Detection API Installation](https://github.com/tensorflow/models/blob/master/object_detection/g3doc/installation.md) 的官方文件把 Detection API 裝起來並完成測試

## 產生 PASCAL VOC TFRecord files

Tensorflow Object Detection API 必須吃TFRecord的檔案格式, 小編用的是2007年的datasets, 如果你手邊有2012年的```--year``` 要改成2012。  
解壓縮```VOCtrainval```然後執行 ```create_pascal_tf_record.py``` 產生 Training 跟 Valuation 的 TFRecord。

* 產生TFRecord
``` Unix 
# From tensorflow/models/object_detection
tar -xvf VOCtrainval_11-May-2007.tar
python create_pascal_tf_record.py --data_dir=VOCdevkit \
    --year=VOC2007 --set=train --output_path=pascal_train.record
python create_pascal_tf_record.py --data_dir=VOCdevkit \
    --year=VOC2007 --set=val --output_path=pascal_val.record
```

* ```create_pascal_tf_record.py``` 的功能大致上大致分為幾個步驟:
1. 將每張圖片 Annotation參數 (圖片的 width 與 height, object Bounding Box, Class Name,...,etc) 跟label map（Class ID 跟 Class 名稱的對應關係）讀出來並塞進 ```tf.train.Example``` protocol buffers
2. serializes ```tf.train.Example``` protocol buffers 為字串 
3. 最後透過 ```tf.python_io.TFRecordWriter``` 把字串寫入 ```TFRecords``` 
4. 詳細內容可參考[Standard TensorFlow format], [Pascal VOC datasets]

PS: Pascal VOC label map 已經有提供可以到 ```object_detection\data\pascal_label_map.pbtxt``` 下察看


## 設定 Training Configuration
Tensorflow Object Detection API 需要透過定義 protobuf 來設定我們的training model, 這跟caffe有點雷同, protobuf 主要是用來作為資料的serializing, 格式上跟json檔略為類似, [protobuf的詳細文件]
<img id="center" src="{{ site.baseurl }}/assets/img/2017-06-27-TF-Detection-API/protobuf.png">
Figure 1: protobuf

可以直接複製一個sample出來改(``` object_detection/samples/configs/```),
這邊小編使用的是```faster_rcnn_resnet101_voc07.config```
來看一下 Pascal VOC datasets 在 Res Net Faster RCNN 下的 Training Configuration, 　

``` javascript

model {
  faster_rcnn {
    num_classes: 20
    ...
    feature_extractor {
      type: 'faster_rcnn_resnet101'
      first_stage_features_stride: 16
    }
    ...
  }
}

train_config: {
  batch_size: 1
  optimizer {
    ...
  }
  gradient_clipping_by_norm: 10.0
  fine_tune_checkpoint: "PATH_TO_BE_CONFIGURED/model.ckpt"
  from_detection_checkpoint: true
  num_steps: 800000
  data_augmentation_options {
    random_horizontal_flip {
    }
  }
}

train_input_reader: {
  tf_record_input_reader {
    input_path: "PATH_TO_BE_CONFIGURED/pascal_train.record"
  }
  label_map_path: "PATH_TO_BE_CONFIGURED/pascal_label_map.pbtxt"
}

eval_config: {
  num_examples: 4952
}

eval_input_reader: {
  tf_record_input_reader {
    input_path: "PATH_TO_BE_CONFIGURED/pascal_val.record"
  }
  label_map_path: "PATH_TO_BE_CONFIGURED/pascal_label_map.pbtxt"
}
```
  
* 設定檔的內容可分為5類, 如同上面的框架,
  1. The ```model``` 模型的框架,如 meta-architecture, feature extractor...
  2. The ```train_config```, 定義optimizer (Momentum, Adam, Adagrad...), fine-tune model
  3. The ```eval_config```, 定義valuation指標
  4. The ```train_input_config```, 定義作為training datasets與label map路徑
  5. The ```eval_input_config```, 定義作為valuation datasets的路徑與label map路徑

* 請注意```train_input_reader``` 與 ```eval_input_reader``` 
  1. ```input_path``` 必須要改為剛剛產生TFrecord的路徑,  
  2. ```label_map_path```官方已經有提供放在 ```object_detection/pascal_val.record```

* ```fine_tune_checkpoint```
  1. 通常在進行訓練時不會從頭開始訓練, 大部份會利用別人已經train好的參數來fine tune以減少訓練的時間
  2. 從 [Tensorflow detection model zoo] 下載 ```faster_rcnn_resnet101_coco_11_06_2017.tar.gz```
  3. 解壓縮　```faster_rcnn_resnet101_coco_11_06_2017.tar.gz```
  4. ```fine_tune_checkpoint``` 定義你的```faster_rcnn_resnet101_coco_11_06_2017```位置 (Ex:```"object_detection/faster_rcnn_resnet101_coco_11_06_2017/model.ckpt"```)

## Training
```python
python object_detection/train.py \
    --logtostderr \
    --pipeline_config_path=${定義的Config} \
    --train_dir=${訓練結果要放的檔案路徑}
```

## 結論
Tensorflow新推出的API在安裝上相當快速, 小編從設定到開始訓練總共約1小時,
目前[Github]也有其他tutorial,可以自己走過一遍或是拿自己手邊的資料玩看看, Happy Training!

<img id="center" src="{{ site.baseurl }}/assets/img/2017-06-27-TF-Detection-API/tf_object_detection.png">

[Github]:https://github.com/tensorflow/models/tree/master/object_detection
[cs231n]:http://cs231n.github.io/
[protobuf的詳細文件]: https://developers.google.com/protocol-buffers/
[Tensorflow detection model zoo]: https://github.com/tensorflow/models/blob/master/object_detection/g3doc/detection_model_zoo.md
[Standard TensorFlow format]:https://www.tensorflow.org/programmers_guide/reading_data
[Pascal VOC datasets]:http://host.robots.ox.ac.uk/pascal/VOC/