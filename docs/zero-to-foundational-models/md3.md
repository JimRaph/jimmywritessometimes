---
cover: /img/md3.png
date: '2026-01-09T09:53:51.005Z'
domain: jimmywritessometimes.vercel.app
slug: module-3-deep-neural-networks
tags: ['Weights', 'Shapes', 'Keras', 'Pytorch', 'Layers', 'DNN']
title: 'Module 3: Deep Neural Networks'
weight: 3
---


# MODULE 3: Deep Neural Networks (DNN)

![module 1](/img/md3.png)

One neuron is limited (it can only solve linear problems). To solve complex problems (like recognizing a face), we connect neurons together. This is what deep neural network is all about. Learning complexity through interconnection of neurons, layers and activation functions.
A typical DNN has three main layers:

1. **Input Layer** – the layer responsible for receiving the raw data (input data)
2. **Hidden Layers**  – the layer that is sandwiched in the middle of Input Layer and Output Layer. It can contain multiple hidden layers. This is where the main computation is done, and complexity is mapped.
* **First Hidden Layer:** this can detect simple patterns like edges, lines
* **Second Hidden Layer:** this could combine what first hidden layer learnt into something more concrete, like combing lines and edges to from shapes like circle.
* **Third hidden Layer:** this learns hidden dimensional attributes like ears.
Basically, each successive hidden layer build on the output of the previous layer.
3. **Output Layer** – Gives the final answer.

Before going forward, Let me show what a perceptron looks like code. I will show using both the Pytorch and Keras library:

#### PYTORCH:
```python
import torch
import torch.nn as nn
class Perceptron(nn.Module):
	def __init__(self):
		super().__init__()
		self.fc = nn.Linear(10, 1)
	def forward(self, x):
		return torch.sigmoid(self.fc(x))
model = Perceptron()
```

There are two things here: **class constructor** and **forward method**.

The constructor is where you would define the structure (layers) of the deep network you want to build. In our case, we are dealing with perceptron (one neuron) so we want only one layer. We use ***nn.Linear*** to create normal deep neural network layers. From the name Linear, it performs linear operations which is what we want for out perceptron example.  
***nn.Linear()*** has two arguments: 
- 10 = number of inputs and 
- 1 = number of neurons (1 output)

The forward method, is where the forward pass (we discussed this in previous modules) takes place. Remember, forward pass is the full process of input entering our network, weighted sum operation, activation function action and output. Sigmoid is the activation function we are using. Sigmoid takes the linear layer, squeezes the output of the layer into (0,1).

We have defined the model, how about the data?  
```python
x = torch.randn(1,10)
output = model(x)
```   

***torch.randn()*** creates a tensor of shape (1,10) -> 1 row and 10 colomns.  
Another way to think of this is, 1 sample, 10 features.

You can think of tensor as array/matrix but much more efficient for gpu calculation (it runs on GPU). Note, NumPy arrays cannot run on GPUs. Tensor support automatic differentiation (autograd, more on this later), which is how PyTorch can track all operations and compute gradients. NumPy arrays can’t track gradient. Keras uses tensors too (TensorFlow tensors) while PyTorch uses torch tensors. Keras sometimes accepts NumPy arrays as input but converts them immediately to tensors before any computation.

:::info A little addition
Libraries like **CuPy** do exist to mirror NumPy on NVIDIA GPUs. It is worth checking out.
:::

I showed Pytorch implementation, time for keras?

#### KERAS IMPLEMENTATION:
```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense
model = Sequential([
 Dense(1, input_shape=(10,), activation='sigmoid')
])
output = model(x)
```

See how short the code is? Keras is easier to use, there is much more automation, you describe the layers and it builds the graph for you. Pytorch is best when you need granular control over the network setup. You write the forward pass yourself.

To create a layer in Pytorch use ***nn.Linear()*** and for Keras, user ***layers.Dense()***.  
Depending on how deep you want the network, you can stack many layers:
```python
def __init__(self):
 	super().__init__()
 	self.fc1 = nn.Linear(10, 64) 
 	self.fc2 = nn.Linear(64, 32)
 	self.relu = nn.ReLU()
def forward(self, x): 
 	x = self.relu(self.fc1(x)) 
 	x = self.relu(self.fc2(x))
 	return x
```
**OR**
```python
model = nn.Sequential(
nn.Linear(10, 64),  
nn.ReLU(),
nn.Linear(64, 32), 
nn.ReLU(),
nn.Linear(32, 1)     # Output layer
)
```

The second form is known as the sequential form. The earlier form is the custom module.  
To stack with keras:
```python
model = keras.Sequential([
layers.Dense(64, activation='relu', input_shape=(10,)),
layers.Dense(32, activation='relu'),
layers.Dense(1)
])
```

**OR**
```python
inputs = keras.Input(shape=(10,))
x = layers.Dense(64, activation='relu')(inputs)
x = layers.Dense(32, activation='relu')(x)
outputs = layers.Dense(1)(x)
model = keras.Model(inputs, outputs)
``` 

The second form is known as the Functional API, it is more flexible than the earlier form.
Now you’ve seen the two forms for each framework. You know how to define a layer. You know how to stack the layers to create deeper network.  

Before we move to the next topic, it is important you understand how shapes work. The relationship between the layer shape and the data shape. Understanding this will make further conversations easier.  

PyTorch expects inputs as batches of row vectors. Its layers like nn.Linear(10, 5) expect input shaped as:
$$
(batch\_size, input\_features)
$$  

So, for a single sample, as in our previous perceptron example:
$$
(batch\_size = 1, input\_features = 10)
$$

In textbooks and math, you usually see a single input vector as a column instead of row:

$$
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\ 
\vdots \\
x_{10}
\end{bmatrix}
$$ 
<div style={{textAlign: 'center', fontWeight:'bold'}}>
Shape is (10, 1)
</div>

But deep learning frameworks use row vectors inside a batch:
$$
[x1 x2 x3 ... x10] → shape (1,10)
$$

This makes batching efficient because stacking multiple samples is easy:
<div style={{textAlign: 'center'}}>
  sample1 -> (1,10) <br />
  sample2 -> (1,10) <br />
  sample3 -> (1,10) <br />
  <strong>Stacked batch -> (3,10)</strong>
</div>

Remember our formula for z? This is how PyTorch finds z:
$$
z = x @ W.T + b
$$
Where:
-	x is (batch, in_features)
-	W is (out_features, in_features)
-	W.T is (in_features, out_features)
-	@ is matrix multiplication

For matrix multiplication to work, the two matrices involved must have inner dimensions that match. This is why in the formula you see W.T, the T means transpose (easy way to think of transpose is to swap the dimension of a matrix or vector). Notice how x and W.T have the same inner dimension ‘in_features’?

We are getting to the end of this module. I want to point out two more things before ending:

1. To figure out how many weights a layer has, you multiply the input and output parameters. Example:
nn.Linear(10, 64)
- Each of the 64 neurons is connected to all 10 inputs.
- 10 * 64 = 640 weights.
- Each neuron also has 1 bias.
- Total parameters: 640 + 64 = 704.

2. Did you notice I switched from Sigmoid to ReLu when I added more layers  

This is why:  
Recall, Sigmoid squeezes the output into (0,1). Gradients here are squashed too much and leads to vanishing gradient which makes it hard for early layers to learn. Meanwhile ReLu just allows positive values to stay same.

How I like to paint an analogy of Sigmoid follows:  
Imagine there are 10 persons in a queue. You tell the person at the end of the queue to take pass along a message but must whisper at 25% of the volume of your voice, the next person is to whisper at 25% of the preceding person volume, and so on. By the time it reaches the 5th or 10th person, the message would be so quiet that the first person hears nothing.  

This is exactly how it works with sigmoid. The volume is the gradient and as it passes along, it vanishes until nothing left and the earlier layers are left with nothing.

This is it for module 3. See you in the next!

Why don't we try a deeper network before closing today's module?

```python
class DeepNet(nn.Module):
    def __init__(self):
        super().__init__() 
        self.hidden1 = nn.Linear(10, 64) 
        self.hidden2 = nn.Linear(64, 32)
        self.output = nn.Linear(32, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()

    def forward(self, x): 
        x = self.relu(self.hidden1(x)) 
        x = self.relu(self.hidden2(x))
        x = self.sigmoid(self.output(x)) 
        return x
```