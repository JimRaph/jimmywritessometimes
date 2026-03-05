---
cover: /img/rnn.png
date: '2026-02-01'
domain: jimmywritessometimes.vercel.app
slug: module-5-sequential-data
tags: ['Bidrectional', 'RNNs', 'GRU', 'LSTM', 'Layers', 'Memory']
title: 'Module 5: Sequential Data'
weight: 5
---


# MODULE 5: SEQUENTIAL MODEL (RNN)

![module 5](/img/rnn.png)

We have discussed CNNs and DNNs. Next natural topic to address is RNNs. As we discussed, CNNs are great for gridlike format data. But what if we could feed text and audio to deep networks without having to do the conversions we did? A network that has the concept of order? This is where RNNs come in. It is used to process sequences, things like sentences, audio waveframes, time series, stock prices, sensor readings. It expects data shape of (sequence length, batch, input size). Keras uses (Batch, sequence len, features).

**Example:**

A sentence with 10 words -> `(10, 1, 300)` -> 1 because we have one sentence -> 10 because there are 10 words -> 300 because each word has an embedding of 300.

Embedding? Where did that come from? Let’s take a little deviation and discuss how text is processed by AI (machines basically).  

AI understands only numbers, not letters. This means text must be converted to number (this process is called tokenization). Next we define a vocabulary size for our use case ( this means deciding how many different texts we want to capture), this number is represent as a vector containing the number of different texts (imagine we agree 5 different words will be possible throughout our training, this means the vector will contain 5 words). Since we have established we can’t pass text, we will replace the words with the numbers we got from the tokenization. Say the five words are:
``` 
- ‘word’ -> 3, 
- ‘me’, -> 1 
- ‘you’ -> 5, 
- ‘come’ -> 4,
- ‘sit’ -> 2 
```
Vector = `[1,2,3,4,5]`. This is a simple case.

More common of this convention is word embedding. Here we convert each word into a vector of a specified length (say 10), now every word will be represented as a vector of length 10, instead of just 1 number as in the case above. Each word is a 10-dimensional vector.

- “The dog chased the boy”  

* "the boy chased the dog”

Two different sentences but with the same words and different meaning (just because of the order). RNNs capture this order.

RNNs has a “memory” loop. It takes two inputs when processing a word:
1. The current word being processed (e.g chased)
2. The hidden state from previous word (e.g from the word ‘god’)
This is what allows RNNs to maintain context as it processes a sentence.

How does RNN process data is that every time step, the input and computation result of previous step (hidden state) is taken into account. The current input combines with the previous result to get a new hidden state. The network learns weights so that after seeing the sequence, its outputs match the desired targets. Training is done with backpropagation through time (BPTT), the gradient is passed backward across time steps. Whenever you see ‘time steps’, you can think of it as each individual words in the input.

To fully grasp what I have mentioned above, I think it’s best I describe concepts involved like I did with DNNs and CNNs.

- **Sequence length (seq_len)** -> number of time steps.  
- **x_t** -> input vector at time `t` -> vector representation of single word ->embedding vector for instance -> `(batch, input_size)```
- **h_t** -> hidden state at time `t` -> result of computation for each time step -> this acts as the memory -> think of it as the Z for RNNs -> `(batch, hidden_size)`
- **y_t** -> `output (prediction)` at time `t` 
- **batch_size** -> number of sequences processed together -> think of it as total `x_t` processes together.
- **input_size** -> dimension of `x_t` (e.g embedding size)
- **hidden_size** -> dimension of `h_t`
- **W_xh, W_hh, W_hy** -> weights matrices -> (hidden_size, hidden_size), `W_hy` is `(hidden_size, output_size)` or `(hidden_size, num_classes)` when producing logits.
- **bh, by** -> bias vectors

It is important to note that at every RNN layer computation, two things are produced: the hidden state `(h_t)` and prediction (`y_t`, this is optional though). The hidden state is passed to the next layer computation, combined with the `x_t` (word) at the time. I keep using ‘word’ when I’m referring to data passed to a layer for ease of visualization, the appropriate term to use here is ‘token’. Remember, token is a number that represent words (not only words though, more on this later).

The process looks like this:

- Sentence = the dog ran  
- Tokenize/sequence = [‘the’, ‘dog’, ‘ran’]     
- Vectorize/embedding = ```[
[12,34,123,534], 
[32,24,435,534],
[23,56,783,232]]```


Again:

- RNN expect input to be of shape `(seq_len, batch_size, input_size)`.  

- A RNN layer looks like this -> `nn.RNN(input_size, hidden_state, num_layers=3)`  

- Each hidden state outputs -> `(num_layers*num_directions, batch_size, hidden_size)`. 

In keras, this is handled by the framework:  

`SimpleRNN(hidden_size)` -> returns `(batch_size, hidden_size)`

A simple RNN cell would look like:
`ht=nn.tanh(W_xh*x_t + W_hh*h_t -1  + bh)` -> this is a matmul operation not dot operation.  
`y_t = ht * W_hy + by`

It doesn’t have to be tanh, could be ReLU, but usually one of the two in simple RNNs. Let’s take a broader breakdown: 

- `x_t -> (batch, input_size)` -> this tells us our many words are being processed in parallel, and embedding size of each of the words.  

- `h_(t-1) -> (batch, hidden_size)` -> this tells us that each word will produce a hidden state after  computation. `(t-1)` means the previous hidden state (hidden state from the previous word), 
batch=32, input_size=50, hidden_size=128.

- `h_t = tanh( x_t @ W_xh + h_{t-1} @ W_hh +  b_h )` -> `(batch, hidden_size)`  
- `y_t = h_t @ W_hy + b_y `-> `(batch, output_size) `-> if needed
`x_t` is (32,50),   
`W_xh` is (50,128) 
- `x_t @ W_xh `→ (32,128),  
`W_hh` is (128,128).  So `h_{t-1} @ W_hh` → (32,128).

Forward pass would be:  
`h = h0  -> (batch, hidden_size)` -> h0 would be just zeros since we are just starting. 

```
outputs = []
for t in range(seq_len):
   x_t = X[t]   X -> (seq_len, batch, input_size) -> X is the input
   h = tanh(x_t @ W_xh + h @ W_hh + b_h)
   y_t = h @ W_hy + b_y    
   outputs.append(y_t) # outputs is list of length seq_len, each (batch, output_size)
```

The ‘h’ at the end of the loop is the final hidden state. The final prediction for the full sequence is (outputs[-1]). You could use the other predictions for things like next token prediction at each time step, sequence labeling.

Now let’s discuss backprop.   
Loss, when it comes to RNNs can be computed per time step or only at final time. Then the gradient computation is L w.r.t weights through chain rule across the time steps.

$$
\frac{\partial L}{\partial W_{hh}}
=
\sum_{t=1}^{T}
\frac{\partial L}{\partial h_t}
\cdot
\frac{\partial h_t}{\partial W_{hh}}
$$

This has the same shape as `W_hh` -> `(hidden_size, hidden_size)`.

$$\frac{\partial L}{\partial h_t}$$ -> depends on gradients from later times `(t+1)`.   

Remember, we are passing the gradient flow backwards. We discussed backprop in DNNs already. There are two unique two things I want to point out about backprob in RNNs: vanishing and exploding gradient. 

We are finding the gradient of Loss to weights, passing the flow backwards. This is done through repeated multiplications. It does happen that the gradient flow zeros out before reaching earlier layers (vanishing gradient) or becomes too much that it becomes unstable (exploding gradient). These are two big issues that RNNs struggle it, a major flaw. I will discuss this in a deeper level in a different article.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

seq_len = 5
batch = 2
input_size = 10
hidden_size = 8
output_size = 3

X = torch.randn(seq_len, batch, input_size) -> (seq, batch, input_size)
y = torch.randint(0, output_size, (batch,)) -> labels for classification or whatever

Wxh = nn.Parameter(torch.randn(input_size, hidden_size) * 0.1)
Whh = nn.Parameter(torch.randn(hidden_size, hidden_size) * 0.1)
Why = nn.Parameter(torch.randn(hidden_size, output_size) * 0.1)
bh = nn.Parameter(torch.zeros(hidden_size))
by = nn.Parameter(torch.zeros(output_size))
h = torch.zeros(batch, hidden_size)  -> h0

for t in range(seq_len):
    x_t = X[t]
    h = torch.tanh(x_t @ Wxh + h @ Whh +bh )

logits = h @ Why + by -> (batch, output_size)
optimizer = torch.optim.Adam([Wxh, Whh, Why, bh, by], lr=0.01)
criterion = nn.CrossEntropyLoss()

for epoch in range(100):
    h = torch.zeros(batch, hidden_size)

    for t in range(seq_len):
    x_t = X[t]
    h = torch.tanh(x_t @ Wxh + h @ Whh + bh)
    logits = h @ Why + by -> (batch, output_size)

loss = criterion(logits, y)
optimizer.zero_grad()
loss.backward()
optimizer.step()

if epoch % 10 == 0:
  	print(f"Epoch {epoch}, Loss {loss.item():.4f}")
```

So far what we have discuss is unidirectional RNN. The problem is unidirectional RNNs is that they use only past context (ht-1 to find ht) to predict current output, but some tasks require knowing the future context too. 

Exampe, look at the sentence “She went to the bank for money”. Imagine we are at ‘bank’, we don’t know what ‘bank’ means. Is it bank of a river, bank where money is, or any other bank that could exists?

### Birectional RNNs

Bidirectional RNNs are useful here. The idea is simple, run two RNNs, one forward (past -> future) and the other backends (future -> past). This then means that each output at a time step is (htforward, htbackend). This makes the network to perform between at speech recognition, sentiment analysis, etc.

```python
rnn = nn.RNN(input_size=10, hidden_size=16, num_layers=1, batch_first=True) # ->(batch, seq, feature)->unidirectional
x = torch.randn(4, 5, 10) # -> (batch=4, seq=5, input_size=10)
output, h_n = rnn(x)
print(output.shape)  #-> (4, 5, 16)
print(h_n.shape)   #-> (1, 4, 16)   (num_layers, batch, hidden_size)
```

``` python
rnn = nn.RNN(input_size=10, hidden_size=16, bidirectional=True, batch_first=True)
x = torch.randn(4, 5, 10)
output, h_n = rnn(x)
print(output.shape) # -> (4, 5, 32) → concatenation of forward (16) + backward (16)
print(h_n.shape) # -> (2, 4, 16) → 2 directions
```

**KERAS IMPLEMENTATION WOULD LOOK LIKE THIS:**
``` python
from tensorflow.keras.layers import SimpleRNN, Bidirectional, Input
from tensorflow.keras.models import Model
inputs = Input(shape=(5, 10))
unidirectional:
x = SimpleRNN(16, return_sequences=True)(inputs)
```

**bidirectional**
``` python
x = Bidirectional(SimpleRNN(16, return_sequences=True))(inputs)
model = Model(inputs, x)
```
**OK SO RNNs VANISHES AND EXPLODES, SURELY THERE SHOULD BE BETTER OPTIONS?**

### LSTM
Earlier I mentioned a major flaw of RNNs but never mentioned the solution for it. LSTMs (Long Short-Term Memory). 

LSTMs has internal mechanisms called Gates to control memory flow:
- **Forget Gate:** Decides what info to throw away (e.g., "We changed the subject, forget the old subject").
- **Input Gate:** Decides what new info to store.
- **Output Gate:** Decides what to pass to the next word
The memory box in LSTMs is the cell state. It is the long-term memory. It carries information forward through the sequence. With RNNs we had input and previous hidden state, but with LSTMs we have input, previous hidden state and previous cell state. 

**How it works:**

- Cell state passes information from previous time step (c_t-1).  
- The Forget Gate decides which old information to discard from memory, formula is:  
`f_t = sigmoid(current input + previous hidden state)` -> `f_t` is a value between 0 and 1.  
- `output(FG) = f_t * c_t-1` -> elementwise multiplication -> partially forgotten memory -> 0 – forget this memory completely, 1 – keep this memory fully.
- The Input Gate decides what new information to store in the cell state.
- `i_t = sigmoid (x_t + h_t-1)` -> how much of the new info to write
- `cbar_t = tanh(x_t + h_t=1)` -> candidate new memory values
- `output(IG) = i_t * cbar_t `-> elementwise multiplication
- The next step is to update the cell state:
`c_t = FG + IG`
- The Output Gate then decides what to output (hidden state) at the current timestep 
- O_t = sigmoid(x_t + h_t-1)
- h_t = O_t * tanh(c_t)
input to the output gate are x_t and h_t-1, hidden state – c_t.

All gates depend on `current input + previous hidden state`, but the cell state itself flows separately across timesteps.

LSTMs allowed machines to translate languages and generate text for the first time, setting the stage for the modern era.

### GRU

Then there is **GRU**, Gated Recurrent Unit. A simplied variant of LSTM if you like. It combines forget and input gate to give update gate, combines cell state and hidden state to give a single state. Fewer gates mean fewer parameters, which makes GRUs faster to train. It is faster and almost as accurate as LSTMs, but LSTMs is better for very long sequences.

**How it works:**

- It has two gates: Update and Reset Gate
- At each time step `t`, input is `x_t`, previous hidden state is `h_t-1`. Update Gate decides how much of the old hidden state to keep:
- `z_t = sigmoid(x_t + h_t-1)` -> close to 1 (keep old hidden state), close to 0 (replace old hidden state)
- Next step is the Reset Gate, which controls how much of the old hidden state to forget when computing new candidate state.
- `r_t = sigmoid(x_t + h_t-1)`
- `hbar_t = tanh(x_t + r_t * h_t-1) > r_t * h_t-1` decides which old info is relevant for new candidate and it is elementwise multiplication.
- Last step is to compute the new hidden state:` h_t = (1-z_t) * hbar_t + z_t*h_t-1` -> weighted combination of old hidden state and new candidate

```python
import torch
import torch.nn as nn
X = torch.randn(2, 5, 10)
 LSTM
lstm = nn.LSTM(input_size=10, hidden_size=8, batch_first=True)
out, (h_n, c_n) = lstm(X)
 GRU
gru = nn.GRU(input_size=10, hidden_size=8, batch_first=True)
out, h_n = gru(X)
```

See you in the next module, where we discuss Attention.