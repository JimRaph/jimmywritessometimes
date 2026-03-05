---
cover: /img/cnn.png
date: '2026-02-27'
domain: jimmywritessometimes.vercel.app
slug: module-4-spatial-data
tags: ['Filters', 'Pooling', 'Keras', 'Pytorch', 'Layers', 'CNN']
title: 'Module 4: Spatial Data'
weight: 4
---


# MODULE 4: SPATIAL DATA (CNN)

![module 4](/img/cnn.png)

Standard Deep Neural Networks (DNNs) struggle with images. If you have a 1080p image `(1920 *1080 pixels)`, that is approx. 2 million inputs. If the next layer has 1,000 neurons, that is 2 billion weights to calculate. It's too slow. We shouldn’t use Linear or Dense layers for spatial data like an image. This is where Convolutional Neural Network (CNN) shines.

The reason DNNs don’t work with images is because they look at the whole image `(1920 * 1080 pixels)` at once. CNN looks at small patches of an image using something known as Filter.
Imagine a flashlight scanning across a photo. The flashlight (filter) is looking for one specific thing, like a vertical line. When it finds it, it lights up. That is the idea with filters.

A filter is defined with a size (say 3 * 3), this filter slides over the image, creating a something known as a Feature Map (which is basically a map of where the thing that filter is looking for are)

### Components Involved in CNN you will be seeing a lot:
- Input tensor - e.g., an image represented as a multi-dimensional array (height × width × channels).
- Convolutional layer - learns small filters (kernels) that slide over the image.
- Activation function - nonlinear function (ReLU, sigmoid, etc.) applied elementwise.
- Pooling layer - reduces spatial dimensions (max-pool, average-pool).
- Batch normalization - normalizes activations per channel, improves training stability.
- Fully-connected (dense) layer - for final classification/regression.
- Loss + Backprop + Optimizer - training machinery.

**Note:** 
1. Going forward I might use filter and kernel interchangeably but it is important not to lose sight of what each actually means in the broader scope of things. A kernel is a 2D matrix (e.g. 3*3). It is what slides across an input during convolution. A filter is a 3D tensor (e.g. 3*3*C). It is a collection of kernels, one per input channel, producing one output feature map per filter.

2. Remember how I said Neural networks learn the weight on their own back when we discussed DNNs? Same thing applies here. The kernels are the learnable parameters (the weights).  The output of one filter (after convolution + activation) is a feature map, which highlights the presence/strength of a specific learned pattern (e.g., edges, textures) across the input spatial locations.

## Input Tensor & Shapes
I took out time to talk about shape in DNNs, for CNNs understanding the shape of the input data (input tensor) is very important. The two framework we’ve been using have different convention for input tensor.

### PyTorch:
Uses `(B, C, H, W)`; Where B = batch size, C = channels, H = height, W = width. The only thing here that could be strange is channels. Channel here represents the depth. In CNNs, it is defined by if an image is coloured or gray-scaled. If it is a coloured image, channel = 3, and if it is gray-scaled channel = 1. It is that simple. 

The number 3, represents red, green and blue (RGB). Example, a coloured image of size 224 * 224 = `(1, 3, 224, 224)`.

### Keras: 
Uses `(B, H, W, C)`. Example from earlier for keras would look like this: `(1, 224, 224, 3)`

## Convolutional Layer

The whole idea of CNN as explained earlier is to apply small filters across the input. In some resources, filter is replaced with kernels. Each filter has a small spatial size and scans through the all input channels. As the filter slides across the input, at each location, it computes the dot product between its weights and the input patch it is currently on to produce a single activation value (result of the calculation). The same filter is used across all spatial positions; this means the weights are shared which drastically reduces parameter count. This is why CNNs are better for images than DNNs.

For the convolutional operation, we have to understand the shape of W and b. 
- PyTorch: `W = (C_out, C_in, K_h, K_w)`
- Keras: `W = (K_h, K_w, C_in, C_out)`
- b is the same for both of them = `(C_out, )`

Where:
- `C_in` = number of input channels (e.g., 3 for RGB)
- `C_out` = number of output channels (number of filters)
- `K_h, K_w` = kernel(filter) height and width (e.g., 3×3)
- `S` = stride (step size when sliding the kernel) – think, how spaced out should the next place where the filter be from where the current filter position.
- `P` = padding (zeros added around input) – used to preserve dimension size
- `B` = batch size

Now, what of the output tensor shape? Since we could be stacking layers, what will be the shape of the output of each layer? This is what goes into the next layer as input.

**PyTorch:** `(B, C, H, W) – (B, C_out, H_out, W_out)`. Where `H` & `w` = input height and width  
**Keras:** `(B, H, W, C) – (B, H_out, W_out, C_out) `

$$
H_{\text{out}} =
\frac{H_{\text{in}} + 2P - K_h}{S} + 1
$$

$$
W_{\text{out}} =
\frac{W_{\text{in}} + 2P - K_w}{S} + 1
$$

**Note:** `H_in` and `W_in` = `H` and `W`

Number of parameters of a convolutional weight = `C_out * C_in * K_h * K_w + C_out(bias)`

**Example:**

Let’s take an example, it will make the discussion more concrete: Say input is a coloured image `H_in=224`, `W_in=224`, `C_in=3`.

A common first layer would look:
- C_out = 64 (number of filters), 
- K = 7*7 (kernel/filter size), 
- S = 2 (stride) and P = 3 (padding)
- parameter count = 64×3×7×7 = 9408 + 64(biases) = 9472 parameters.

Comparing this with a Dense or Linear layer => `224 * 224 * 3 = 150,528 * 64 neurons = 9,633, 792`. Number of parameter for Convolution is tiny by comparison.

`H_out = (224 + 2(3) – 7)/ 2 + 1 = 112.` Calculating for `W_out = 112.`
So the output tensor (PyTorch) = `(1, 64, 112, 112)`.

## Activation functions
We discussed this in detail in the DNN section. In convolution, after the convolutional operation + bias, Z (logit – output not yet passed through an activation function) is computed per output channel. Then this is passed through an activation function elementwise. It is at this point that nonlinearity is introduced, enabling complex function approximation. Shapes are not altered here.

## Pooling layers
Convolution reduces the spatial dimension of input when stride > 1 is applied, as such, the reduction is optional. Stride = 2 would have the dimension. The pooling layers reduces spatial dimensions (height * width) to make representations more compact and translation-invariant (this is a term that means that the CNNs network recognizes the same feature regardless of small shifts in its positions across the input image, e.g a small shift in the position of an eye won’t make the CNN not to recognize it as an eye). It is not optional. Once you apply a pooling layer know the dimension will be reduced. There are different types of pooling layers you can use to reduce the spatial dimension of the data you are working with. Just like with convolution layer, you define a size for the kernel (e.g 2 * 2).  

**Max pooling:** takes the max value in the kernel patch. Example, kernel = (2,2), stride =2, the kernel is slid across the input, and at every location of the 2 by 2 box, the max value in the box is taken. The 4 by 4 is squeezed into 1 box with the value being the max value that was in the 4 by 4 box. Stride = 2 means the dimension at the end of the computation will be half the input dimension.  

**Average pooling:** takes average.  

For pooling layers, there are no learning parameters. All it does is reduce the dimension.

## Batch Normalization
The output of every convolution can have different distributions as weights update. The batch normalization layer is used to normalize these outputs (channel-wise). This helps the network learn faster and more reliably. It doesn't change the size or shape of the images or feature maps, only adjusts the values within them to be more stable. Examples are `nn.BatchNorm2d()`, `nn.BatchNorm3d()`.

## The Fully Connected Layer
This is the output layer. At the end of the conv/pool stack, the result(activation maps) is often flatten into vectors and feed into dense layers(or linear for PyTorch). The number of neuron here depends on the number of output we want.

## BackPropagation in CNNs
This is the same as with DNNs, but the convolution shape is respected.  
Compute derivative of Loss to Z (output activation) – same shape as output feature maps.  
Gradient with respect to W – same shap as weight tensors `(C_out, C_in, K_h, K_w)`.  
Gradient of Loss to  biases – shape = `(C_out, )`.  
Gradient for previous layer activations – same shape as that layer’s input


#### Code Snippet – PyTorch:

``` python   
import torch
import torch.nn as nn
import torch.nn.functional as F
Class smallCNN(nn.module):
      def __init__(self):
 	super().__init__()
 	self.conv1 = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, stride=1, padding=1)
              self.pool = nn.MaxPool2d(2,2)
 	self.conv2 = nn.Conv2d(16, 32, 3, 1, 1)
 	self.fc1 = nn.Linear(32 * 8 * 8, 64)
	self.fc2 = nn.Linear(64, 10)
def forward(self, x): 
 	x = F.relu(self.conv1(x))
          x = self.pool(x)
 	x = F.relu(self.conv2(x))
          x = self.pool(x)
          x = torch.flatten(x, 1)
          x = F.relu(self.fc1(x))
          x = self.fc2(x)
 	return x
model = smallCNN()
print(model)
```

#### KERAS
``` python
from tensorflow import keras
from tensorflow.keras import layers
model = keras.Sequential([
 layers.Input(shape=(32,32,3)), 
layers.Conv2D(16, 3, padding='same', activation='relu'),
layers.MaxPool2D(2),
layers.Conv2D(32, 3, padding='same', activation='relu'),
layers.MaxPool2D(2),
layers.Flatten(),
layers.Dense(64, activation='relu'),
layers.Dense(10)])
```

**Common CNN architectures (just names & ideas)**
- LeNet — early simple conv net for digits.
- AlexNet — large conv net that popularized deep learning for images.
- VGG — stacks of 3×3 convs.
- ResNet — residual (skip) connections solve training degradation.
- MobileNet — depthwise separable convolutions for efficiency.
- U-Net — encoder-decoder with skip connections for segmentation.

CNNs can be used for videos too. So far, we have only discussed CNNs with regards to images, but CNN is not limited to just images. It can be used for Audios and Videos. To use CNNs for video, you have to switch to 3D CNNs.

- For images, we had Conv2D() and data shape was `height * width * channel -> H*W*C`  
- For videos, we use Conv3D() and data shape is `time steps * height * width * channel -> T*H*W*C`
- For audios ( as spectrogram), we use Conv2D() and data shape is `frequency * time -> (F * T)`
- CNNs can even be used for texts -> Conv1D -> `seq * embed -> (sequence * embedding)`

The time steps represent the frames. Videos are just frames of images across time.

For CNNs to be used with audios, the audio has to be converted into gridlike format. The reason CNNs work with images is not because it understands image but because images are gridlike. This is how the filter kernel can slide across the image and learn patterns. Same thing happens for audios and texts. They have to be converted before using with CNNs.

#### Example for audio:
```python
import librosa
import librosa.display

y, sr = librosa.load(‘audio file’) # y is a 1D array containing the audio sample and sr is the number of samples per second (frequency)
audio_grid = librosa.feature.melspectrogram(y=y, sr=sr, n_mels = 128) # n_mels is the frequency bins and audio_grid is the 2D grid (frequency bins * time frame) -> say (128, 470)
audio_grid_lg = librosa.power_to_db(audio_grid, ref = np.max) # this is just process step which makes the amplitudes into a nicer image-like range.
#Remember our pytorch conv layers need the input shape to be (b, c, h, w). You can reference previous discussions. Our audio_grid_lg is of a different shape (h*w). Pytorch has a nice method that can turn our out of shape audio grid into a shape that conv layer needs
Spec = torch.tensor(audio_grid_lg).unsqueeze(0).unsqueeze(0) # (1,1, 128, 470) 

# We can now fed audio_grid into cnn.
class AudioCNN(nn.Module):
def __init__(self):
  	 super().__init__() 
 	self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)  
 	self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)     
   	self.pool = nn.MaxPool2d(2, 2) 
   	self.fc = nn.Linear(32 * 32 * 117, 10)  
def forward(self, x):
   	x = self.pool(F.relu(self.conv1(x))) #  shape: (1, 16, 64, 235)  -> pooling layer (2,2) -> dimension is halved
   	x = self.pool(F.relu(self.conv2(x)))  #  shape: (1, 32, 32, 117)
   	x = x.view(x.size(0), -1) # x.size(0) = 1 (batchsize) -> -1 means multiple everything except batchsize -> this is done because Linear layer expects (batch, features)
   	x = self.fc(x)    
   	return x

model = AudioCNN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()
for epoch in range(10):
  	optimizer.zero_grad()
  	output = model(spec)
  	target = torch.tensor([3])  # example class index
   	loss = criterion(output, target)
  	loss.backward()
  	optimizer.step()
  	print(epoch, loss.item())
```

Don’t worry too much about it if there are some things you don’t understand here. The main idea is to understand that conversion to gridlike format must be done, the shape changes across the stack, we have to explicitly reshape data to what Linear layer expects.

`.zero_grad()` is done to reset the gradient graph. It is very important to always do this.

## How activations, nonlinearities and normalization affects data shape and distribution

In complex networks like cnn and transformers, activation functions are usually placed after linear operations. Even though they don’t change shape, they define how representational space expands or contracts, determining what information flows forward.

- **ReLU:** keeps positive features → information sparsity.
- **Tanh:** smooth nonlinearity → bounded but symmetric.
- **GELU:** used in transformers → smooth ReLU-like curve for better gradient flow.
