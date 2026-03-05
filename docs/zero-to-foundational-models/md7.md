---
cover: /img/md3.png
date: '2026-03-04'
domain: jimmywritessometimes.vercel.app
slug: module-7-transformers
tags: ['Attention', 'MultiHead Attention', 'Encoder', 'Decoder', 'Sine & cosine', 'Transformer']
title: 'Module 7: Transformers'
weight: 7
---


# MODULE 7: TRANSFORMERS

![module 7](/img/transformers.png)


In 2017, a team at Google released the paper “Attention Is All You Need” (see, my grandma was right, if only I listened to her).  They threw away RNNs and LSTMs entirely. The built a structure made only of Attention layers, and named it the Transformer (action soundtrack plays in the background).

This architecture has two massive advantages: Context and Parallelization.
1. Context: It understands relationships between distant words perfectly (no vanishing gradient)
2. Parallelization: Unlike RNNs (which must go step-by-step), Transformers can process the entire sentence at once. This allowed training on massive datasets (the entire internet).

### Getting into the mechanics:

Transformer looks at the whole sentence at once, because of this it has no clue which word comes first (no order). To the model, "The dog bit the man" looks exactly the same as "The man bit the dog.". It doesn’t know which direction the sequence flows, which words are close or far apart. To the Transformer, the input is just an unordered bag of embeddings.

To fix this, we must manually add positional information. We add a special set of numbers (vectors) to each word embedding that represents its position (1st, 2nd, 3rd, etc). 

Sequence is "The dog bit the man".  
we encode the sentence to get:

$$
\mathbf{E}_0, \mathbf{E}_1, \mathbf{E}_2, \mathbf{E}_3, \mathbf{E}_4
$$

Each $$\mathbf{E}_i$$ represents an embedding dimension which encodes the meaning of the word or token. At this point the transformer can't tell the difference if some words were to be swapped as earlier mentioned. We add positional information, which we will call $$\mathbf{P}_i$$:

$$
\mathbf{X}_i = \mathbf{E}_i + \mathbf{P}_i
$$

At this point, the transformer not only knows the meaning of a word but also where it is in the sequence.

We don't just use integers (1, 2, 3) because for long sentences, the numbers get too big, and it just doesn’t generalize. Instead, we use Sine and Cosine waves of different frequencies.


### Why don’t we use integer? Sounds easier to do so:

1. Absolute numbers turn out not to generalize well to long sequence. Suppose the longest sequence you trained on has length 50, during training the model only sees position embeddings for 1-50. During inference, if user gives it a 100 token sequence, the model can’t generalize because it hasn’t seen the new embeddings before and can’t tell the position they hold.  

2. The model can’t derive relative position (how far apart two words are). “But we could just minus the values from each other?” Theoretically yes but it makes no real sense in practice. These “position” information we add are not Numbers but high-dimensional learned vectors, subtracting these does not yield a smooth or meaningful distance. This is because learned embeddings do not preserve arithmetic meaning. ` Embedding(14) – Embedding(10) != Embedding(4)`. It is just random vector differences.

3. It doesn’t encode repeating patterns. Depending on context, there is usually a pattern. For example, with poetries, there is a pattern. Plays, there is a pattern. Music, there is a pattern. Using Integer can’t capture these patterns but sine/cosine have natural repeating patterns, so it fits.

### Why use Sine & Cosine then?

1. They give a unique fingerprint to each position. Each position gets a distinct, smooth, predictable pattern. Even longer sequences still maintain distinguishable encodings. This is because sine/cosine encodings for large positions follow the same smooth mathematical pattern. A model trained on 1-50, can generalize up to 2500 because there is a pattern (the repeating wave structure).
2. The model can compute relative distances. For two positions a and b, `sin(a) – sin(b)` is smoothly related to `a – b`. This means attention mechanism can infer the distance between tokens using simple dot products of their embeddings.  
Since Transformers learn relationships using dot products, projections, similarity, linear transformations, these operations behave well with smooth, continuous, periodic functions. They behave poorly with arbitrary integer embeddings, random high-dimensional vectors, discontinuous jumps and non-generalizable values.

3. Smoothness helps attention. Self-attention naturally works with continuous signals. Sine/cosine change gradually across positions, and this helps attention learn proximity naturally. The model can easily learn patterns like “words within 5 positions matter more”

Sine and cosine create vectors where order is encoded in direction, distance in smooth changes, and relative positions can be computed algebraically. Patterns repeat naturally in a predicted way like I mentioned earlier and extrapolation to long sequences works.

Trigonometry identity is key to why sinusoidal positional encodings work so well in Transformers. For any numbers a and b:

$$
\sin(a+b) = \sin(a)\cos(b) + \cos(a)\sin(b)
$$
$$
\cos(a+b) = \cos(a)\cos(b) - \sin(a)\sin(b)
$$

These two equations are why sinusoidal positional encoding was chosen.

Let’s look at this key trig identity more:  
In the original transformer:
$$
PE(p) =
\left[
\sin\!\left(\frac{p}{10000^{\frac{2i}{d_{\text{model}}}}}\right),
\;
\cos\!\left(\frac{p}{10000^{\frac{2i}{d_{\text{model}}}}}\right)
\right]
$$
`p = position (0,1,2,3,…)`

`i = dimension index (0,1,2,3….d_model-1) -> d_model means dimension of model.`  

Each pair of sin/cos acts like a 2D rotation subspace.`

It is the self-attention that uses this PE. It compares all pairs of tokens and through the PE infers relative distance. To show how this works, lets get back to the trig identity.

We encode position a as:
```
P(a) = 
[  
sin(a)   
cos(b)  
] -> positional encoding has alternating sin/cosine pattern
```
 
position p(a+k): 
```
p(a+k) = 
[
sin(a+k) 
cos(a+k)
] -> think of k as the relative distance, so a+1 would mean token 1 place ahead of token a.
```

The later position can be computed from an earlier one + the distance between them.
The embedding at position (a+k) is a predictable rotation of the embedding at position a. The rotation angle is exactly k (distance). Self-attention can therefore infer relative relative distance from embeddings.

Transformers can figure out distance between two tokens because their embeddings encode:  
`p(a+k) = Rotation by k of p(a)`  
“Rotation” is something dot products, matrices, and linear layers naturally understand.

The goal is to rewite `p(a+k)` interms of `p(a)` and the distance `k`:
$$
\sin(a+k) = \sin(a)\cos(k) + \cos(a)\sin(k)
$$
$$
\cos(a+k) = \cos(a)\cos(k) - \sin(a)\sin(k)
$$

Plug into the formula for p(a+k): 
$$
p(a+k) =
\begin{bmatrix}
\sin(a)\cos(k) + \cos(a)\sin(k) \\
\cos(a)\cos(k) - \sin(a)\sin(k)
\end{bmatrix}
$$

We can rewrite: 

$$
p(a+k) =
\begin{bmatrix}
\cos(k) & \sin(k) \\
-\sin(k) & \cos(k)
\end{bmatrix}
\begin{bmatrix}
\sin(a) \\
\cos(a)
\end{bmatrix}
$$ 
This works because of matrix * vector computation -> if you apply this matrix * vector calculation: 

$$
=
\begin{bmatrix}
\cos(k)\sin(a) + \sin(k)\cos(a) \\
-\sin(k)\sin(a) + \cos(k)\cos(a)
\end{bmatrix}
$$

We get back the original trig identity we had.

$$
=
\begin{bmatrix}
\sin(a+k) \\
\cos(a+k)
\end{bmatrix}
$$


$$
R(k) =
\begin{bmatrix}
\cos(k) & \sin(k) \\
-\sin(k) & \cos(k)
\end{bmatrix}
$$
This rotates any vector by k radians.


We now have: 
`p(a+k) = R(k) + p(a)`

**IMPORTANT:**

In the math discussion above, p(a) & p(a+k) is 2-dimensional and I stacked them. This I did to make it visually easier to grab the intuition. In reality, the dimension of p(a) depends on the dimension of each input token (commonly 512, 768, 1024, etc). The stacking does not impy a 2x1 vector. p(a) is vector of values calculated from alternating sine/cosine. Also note that `a` and `b` used doesn't mean different words but index (even or odd) of the dimension. 

**Example:**

Let's compute the positional encoding for the 3rd word (pos = 2) with d = 4.
Remember the formula for PE(p), we substitute the values into the it:

$$
P(2) =
\left[
\sin\!\left(\frac{2}{1000^{0}}\right),
\;
\cos\!\left(\frac{2}{1000^{0}}\right),
\;
\sin\!\left(\frac{2}{1000^{\frac{2}{4}}}\right),
\;
\cos\!\left(\frac{2}{1000^{\frac{2}{4}}}\right)
\right]
$$
For d=0 -> i=0 (even)  
For d=1 -> i=0 (odd)   
first pair  
For d=2 -> i=1 (even)  
For d=3 -> i=1 (odd)  
second pair 


Don’t worry too much about the math here if it is confusing, it was just to show how self-attention is able to infer relative distance. The important thing is understanding why sin/cosine was used.

**Example:**

we have 8-dimensional embedding
```
p(a) = [sin(a), cos(b), sin(a), cos(b), sin(a), cos(b), sin(a), cos(b)]
Each consecutive (sin, cos) pair is an independent 2D rotational subspace:
pair 1: dims(0,1) -> low frequency wave
pair 2: dims(2,3) -> medium
pair 3: dims(4,5) -> high
pair 4: dims(6,7) -> very high
```

The 8-dimensional `p(a)` is 4 tiny rotation arrows.
position `(a+k)` is then just -> move all these 4 pairs forward by k ticks.

This creates a unique multi-frequency signature the model can decode. Low frequencies capture long-distance relationships and high frequencies capture local, short-distance relationships.

Also, this relative-position inference is only for self-attention, because it compares tokens within the same sequence making the trig identity useful.

When Q and K interact:
- Q contains token meaning + position
- K contains token meaning + position
- Dt products Q·K let the model decode relative distances using trig identities.

In general, how the self-attention works:  
- Sequence: [x0, x1, x2, x3, x4]
- Each token has -> token embedding E and positional encoding PE.
- Input to self-attention -> Z = E + PE

### Queries, Keys, Values:

For each token t in the sequence:  
$$
Q_t = Z_t \cdot W_q
$$

$$
K_t = Z_t \cdot W_k
$$

$$
V_t = Z_t \cdot W_v
$$
Where $$\mathbf{W}_q$$, $$\mathbf{W}_v$$, $$\mathbf{W}_k$$ are all trainable parameters.

You can think of these parameters ($$\mathbf{Q}_t$$, $$\mathbf{V}_t$$, $$\mathbf{k}_t$$) as:   
`Query` -> ‘what is this token looking for in the sequence’,   
`Key` -> ‘what does this token offer to others’,  
`Value` -> ‘actual information that will be passed along’

**NOTE:**

The original paper uses the sin/cosine. Modern transformer models use a learned position embedding (i.e trained just like with word embedding)

### Attention computation (done simultaneously):

For token 0, attention looks at all other tokens.  

$$
\text{score}_{0,j}
=
\frac{Q_0 K_j^{\top}}{\sqrt{d_k}},
\quad \text{for } j = 0, \dots, 4
$$
$$\mathbf{d}_k$$ is dimension of each query/key vector (not necessarily the full model dimension). This divison is a normalization trick for numerial stability.

When $$\mathbf{d}_k$$ is large, the dot product $$Q_0 K_j^{\top}$$ can have large values -> softmax becomes very peaked -> gradients vanish during backprop.  
Dividing by $$\sqrt{d_k}$$ scales the dot product to a reasonable range, stabilizing training.

Scores measure relevance of each token (including itself) to token 0.  
Softmax turns the scores into weights:
$$
\alpha_{0,j}
=
\text{softmax}(\text{score}_{0,j})
$$
$$
\text{softmax}(\text{score}_{0,j})
=
\frac{\exp(\text{score}_{0,j})}
{\sum_{m=0}^{4} \exp(\text{score}_{0,m})}
$$

 
We are yet to see value ($$\mathbf{v}_t$$) participate, where is value? Value flows forward.

$$
a_{t,j}
=
\text{softmax}
\left(
\frac{Q_t K_j^{\top}}{\sqrt{d_k}}
\right)
$$

This is repeated for all tokens:
$$
O_t
=
\sum_{j=0}^{4}
a_{t,j} V_j
\quad \text{for } j = 0, \dots, 4
$$
Which is the sequence we are working with.

For the entire computation of $$O_t$$, we represent final result as $$O$$

For attention (cross-attention), we deal with two different sequences, target sequence (decoder) and source sequence (encoder). Example translating a sequence from English to Espanol. The `Q` comes from the target and` K`,`V` from the source. The same computation process is done with cross-attention.


### MULTI-HEAD ATTENTION.
If a single attention mechanism works so well, why not have many? A single attention head might focus on grammar (connecting "subject" to "verb"). But we also need to understand tone, gender, and tense. Basically, a single attention head gets a single perspective. To broader the perspective, we broaden the attention head.

How this works:
- We have embedding dimension (d_model) = 512
- We choose to use 4 attention heads (h=8)
- Each head gets a smaller slice of the embedding, e.g., $$\mathbf{d}_k$$ = `d_model / h = 64.`
This means for each of the 8 heads, we have:
- `Q_h, K_h, V_h` -> all of shape `(seq_len * d_k)`

Each head then computes attention independently on its slice of the data, but simultaneously. The output of each attention is then concatenated, result of this concatenated is multiplied with $$\mathbf{W}_o$$. $$\mathbf{W}_o$$ is a learned linear transformation to combine the heads into the original d_model size.

Output of concatenation is `(seq_len, d_model)`.  
$$\mathbf{W}_o$$ = (d_model, d_model).  
Output of the matrix multiplication = (seq_len, d_model) -> same as original embedding size. This multiplication is done along the feature dimension ( this means the columns is the part multiplied and transformed).

- Shape of `Q,K,V` -> `(batch_size, seq_len, d_k)` -> $$\mathbf{d}_k$$ is the embedding dimension (per head) -> dimension/number of heads.
- Scores -> (batch_size, seq_len, seq_len) -> each row is query token, each column is key token, score[I,j] is how much token I should attend to token j.
- A -> `(batch_size, seq_len, seq_len)` -> each row sums to 1 -> distribution over tokens for each query.
- Weighted sum (0) -> `A * V` -> `(batch, seq_len, d_v)` -> d_v is dimension of V, it is usually same as d_k (dimension of Q & K).

### The Feed-Forward Network (Processing):

After the attention mechanism gathers all the context ( 'it' means 'animal', and the tone is sad), this information ($$O$$ with residual connection + normalization) is passed to a standard Feed-Forward Neural Network (like in Module 3). This layer digests the context and transforms it into a higher-level representation. FNN is applied independently to each token. Here shape stays `(seq_len, d_model)`.

### Residual Connections & Normalization:

These are stability tools. Deep networks are hard to train. Transformers use two tricks to keep things stable:
- **Residual (Skip) Connections:** Imagine a highway detour. The data goes through the processing layer, but a copy of the original data also skips the layer and is added back in at the end. This prevents the model from "forgetting" the original input and helps gradients flow during backpropagation.
- **Layer Normalization:** This keeps the numbers (math values) within a reasonable range (e.g., preventing them from exploding to infinity), ensuring the training remains stable

Usually, result of the attention layer passes through these two steps before being passed through the Feed forward network. The output of the FFN do get added to the attention output and also layer normalization is carried out to get the final output of the transformer block.

### Encoder And Decoder
The original Transformer had two components: Encoder and Decoder.

- **The Encoder (The Reader):** Takes the input (English) and compresses it into a deep understanding (vectors). It uses bi-directional attention (it looks at future and past words simultaneously). BERT (Google) uses only the Encoder. It is great at understanding text (search engines, classification).

- **The Decoder (The Writer):** Takes the Encoder's understanding and generates the output (French) one word at a time. It uses masked attention (it can only look at past words, not future words, because it hasn't written them yet). GPT (OpenAI) uses only the Decoder. It is great at generating text (chatbots, writing code).

Now that we have talked about the encoder and decoder. We can discuss how computation works with cross-attention.

- Decoder input tokens -> embed -> add positional encoding -> output (call it `X_dec`)
- Encoder output, call it `X_enc`
- Cross-Attention Head:
    - Get Q from `X_dec`
    - Get K and V from `X_enc`
    - Perform the steps described earlier about attention scores
- Concatenate the heads (if multihead) 
- Multiply by the learnable parameter $$W_o$$
- Apply residual and layer normalization
- Pass result of previous step to FFN

**Example:** 

Let's take an example to show computation from input token to final $$O$$:

To keep it simple, we use a sentence made up of two words. So two tokens. $ embedding dimensions. Simple Q,k,V values. Your focus should be on the process not the actual values themselves.

- Tokens = [x0, x1]
- Embedding dimension = 4
2 heads -> Each head gets 2 embedding dimension (remember dim/no. of heads?)

- Input
$$
E =
\begin{bmatrix}
1 & 0 & 0 & 1 \\
1 & 0 & 0 & 1
\end{bmatrix}
\quad (2 \times 4)
$$

- Split embeddings for the two heads (again remember the formula)
$$
\text{Head}_1^{\text{input}} =
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
\qquad
\text{Head}_2^{\text{input}} =
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

- The Q,K,V  
```Q1​=K1​=V1​ = Head1_input, Q2​=K2​=V2 ​= Head2_input```
- Attention calculation
$$
\text{Attention}(Q,K,V)
=
\text{softmax}(QK^{\top})V
$$

Head 1:
$$
Q_1K_1^{\top}
=
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}^{\top}
=
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

Row-wise softmax:
$$
\text{softmax}
\left(
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
\right)
\approx
\begin{bmatrix}
0.73 & 0.27 \\
0.27 & 0.73
\end{bmatrix}
$$

Multiply by our V to get $$O$$
$$
O_1 =
\begin{bmatrix}
0.73 & 0.27 \\
0.27 & 0.73
\end{bmatrix}
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
=
\begin{bmatrix}
0.73 & 0.27 \\
0.27 & 0.73
\end{bmatrix}
$$

Repeat what we did for Head 1 to get Head 2:
$$
O_2 =
\begin{bmatrix}
0.73 & 0.27 \\
0.27 & 0.73
\end{bmatrix}
$$

- Concatenate the heads
$$
O_{\text{concat}}
=
[\,O_1 \parallel O_2\,]
=
\begin{bmatrix}
0.73 & 0.27 & 0.73 & 0.27 \\
0.27 & 0.73 & 0.27 & 0.73
\end{bmatrix}
\quad (2 \times 4)
$$

- Multiply by $$W_O$$ (remember this is a learnable parameter)
$$
O_{\text{multihead}}
=
O_{\text{concat}} W_O
=
O_{\text{concat}}
$$

Shape of $$W_o$$ is $$ \text{d}_\text{model}$$ x $$ \text{d}_\text{model}$$. It is what maps the size we get from the concatenation block ($$\text{seq}_\text{len}$$  x $$ \text{d}_\text{model}$$) back to model dimension.

What we have basically is:

`Tokens → Split heads → Attention → Concat → Projection`

There is something that I've left out so far, and now is the time to discuss it. Why do we multiply the stacked (concatenated) heads with $$W_o$$?

The entire idea for using multiheads is to broaden perspective. We can't just pass $$O$$ because we would have the heads separated and model can't really utilize the knowledge each heads hold (remember FFN acts on each token independently, so it would act on each head independently). Multiplication with $$W_o$$ allows for combination of attention features and as such information flow across heads. It also preserve the needed shape (I mentioned this earlier).

**Example:**
```
We use one token with 4 dimension

Head1 output -> [a1 a2]
Head2 output -> [b1 b2]

Concatenate:
[a1 a2 | b1 b2]
```

$$
W_o
=
\begin{bmatrix}
0.5 & 0.3 & 0.1 & 0.2 \\
0.1 & 0.6 & 0.2 & 0.1 \\
0.5 & 0.3 & 0.1 & 0.2 \\
0.1 & 0.6 & 0.2 & 0.1
\end{bmatrix}
$$

Concatenated Vector:
$$
\begin{bmatrix}
a1 & a2 & b1 & b2 \\
\end{bmatrix}
$$

Output of Concatenated Vector * $$W_o$$:

$$
\begin{bmatrix}
0.5a1 + 0.3a2 + 0.1b1, 0.2b2
\end{bmatrix}
$$

This is what makes up a transformer. 

We will build on this in the next module. See you there.