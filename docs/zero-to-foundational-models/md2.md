---
cover: /img/md2.png
date: '2025-12-25T09:53:51.005Z'
domain: jimmywritessometimes.vercel.app
slug: module-2-the-decision-process
tags: ['Gradient descent', 'loss function', 'backpropagation', 'local minimum', 'optimizer', 'forward pass']
title: 'Module 2: The Decision Process'
weight: 2
---

# MODULE 2: THE DECISION PROCESS

![module 1](/img/md2.png)

We have established that **W** is a measure of how important **X** is to our final decision. In the scenario we ran in module 1, I manually assigned the weights since we were only dealing with 2 inputs. Imagine we were dealing with hundreds of thousands of inputs. Millions of input. Manual assignment doesn’t look ideal.

Luckily, this is where deep learning thrives. Deep Learning networks figure out the correct weights to make accurate prediction. This process of figuring out the right weights is called the learning process.

There are 5 components involved in the learning process:

**1. The Activation Function (Decision Maker):**
------------------------------------------------

We discuss Z in the first module, where we calculated the weighted sum. The activation function is what squeezes the raw score (z) into a useful output. We will denote this useful output as (**a**).

There are different activation functions, but before discussing them let me address a question you are already asking yourself; how is z able to capture complex relationships? How does it capture non-linearity?  
The answer is simple; This is the work of the activation functions (partially, as activation functions alone don’t capture complex relationship). Z is just the output of the input, weight and bias computation.

I mentioned activation functions doesn’t capture the complex relation alone, this is because without stacking multiple neurons, activation functions will capture only linear relationship. If the activation function is removed entirely, every layer of neural network becomes a linear transformation. Multiple linear transformation still collapse into a single linear transformation.

This means:  
No matter how deep the network is, without activation functions, it can only model linear relationships. Activation functions introduce non-linearity, which allows neural networks to model complex patterns such as curves, hierarchies, and boundaries, by stacking layers of neurons.

The activation function answers the question: ‘*Given that we know Z, how strongly should this neuron respond?*’

#### 1.1 Sigmoid

Sigmoid squeezes **Z** into a value between 0 and 1:

$$
f(z) = (0,1)
$$

This makes it naturally interpretable as a probability.  
At the smallest unit:

* Large negative Z → output close to 0
* Large positive Z → output close to 1

This makes sigmoid suitable for binary decisions, where the question is *‘how confident are we?’*

#### 1.2 Tanh

Tanh squeezes values between −1 and 1:

$$
f(z)=(−1,1)
$$

Compared to sigmoid, tanh is zero-centered. This means positive and negative activations are balanced around zero.  
Zero-centered activations reduce bias in gradient updates, helping optimization converge more smoothly in hidden layers.

#### 1.3 ReLU (Rectified Linear Unit)

ReLU is defined as:

$$
f(z)=max(0,z)
$$

All negative values are set to zero. Positive values pass through unchanged.

Why this works so well:  
ReLU does two important things simultaneously:

1. It introduces non-linearity
2. It preserves gradient strength for positive values

Unlike sigmoid or tanh, ReLU does not squash large positive values into small ranges. This prevents gradients from shrinking too much as they pass backward through deep networks.

This is why ReLU enables deeper networks to learn efficiently.

How does ReLU help deep networks learn faster?  
All ReLU does is max(0, z). There isn’t much calculation being done here. Think of it as simply, if the value is negative swap it with 0 and if positive just leave it like that. Other functions have to deal with things like exponentials, and divisions as seen in their formula.

#### 1.4 Softmax

Softmax operates on a vector of Z values, not a single one. It converts raw scores into probabilities that sum to 1.  
Softmax answers the question: ‘Given all possible classes (choices), how should belief be distributed across them?’

For example, if there is 3 classes, each class outputs a z.

$$
Z = [z1, z2, z3]
$$

Softmax converts these logits into probability distribution through the formula:


$$
\mathrm{softmax}(z_i)=\frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}} 
$$


K is the number of classes (3 in our example)  
zi is the logit for class i (z1 = logit for class 1)  
Softmax guarantees three things:

* All outputs are position - this is ensured by the exponentials e^zi
* They sum to 1 - this is due to division by the sum of exponential of all classes.
* Relative ordering is preserved - $softmax(z_{i}) > softmax(z_{j})$ 

It becomes clear that softmax captures mutual exclusivity, which is exactly what we need for a multiclass scenarios; if the network is confident about one class, it must reduce confidence in the others. After all, distribution must sum to 1, so network cannot assign high probability to multiple classes indiscriminately.

This makes softmax ideal for multi-class classification (more on this later).

**1.5** There are other advanced activation functions like GELU, ELU, etc.

***Hidden Layers***  
When we discuss perceptron, the calculation was simple. A single input, processed by single neuron, output a single answer. In deep neural network, the calculation goes deeper than that, hence the ‘deep’ in the name. In deep networks, we have multiple layers of ‘input in, process input, output an answer’. The layers in-between the final deep network output layer and input layer are called hidden layers. It is where the real computation (learning) takes place.

***Multi-class output layer***  
Above I mentioned input layer (layer that the data is fed into) and output layer (where answer comes out from). The multi-class output layer in a neural network is the final layer designed for classifying inputs into more than two categories, featuring one neuron per class and typically using softmax activation to produce a probability distribution summing to 1. In module 1 scenario, our problem was ‘should we buy a house or not’ – two outcome – binary output. What if our problem changed from ‘should we buy this house or not’ to ‘should we buy a gray-painted, blue-painted or white-painted house’? we now have three outcome – multi-class output.

Remember, in the perceptron we had one neuron to decide the outcome but in multi-class, we have more than 2 categories which means we need one neuron for each category to represent that category. Each of these neurons hold a value (logit or raw score) that represents that category, we use softmax activation function to turn these values into a probability distribution. The neuron with the highest probability in the distribution wins and is taken as the predicted class (output) of the network.

---

At this point you are probably like ‘wait a minute’, why does the binary class output layer get one neuron but multi-class gets a neuron for each class? That doesn’t seem fair.

You are absolutely right to ask this. If you didn’t think of this while reading my explanation on the multi-class output layer, I love you and wished the other guys/ladies were like you.

The thing with Binary class is that using one neuron for each class is redundant. What does a single neuron do? It outputs a logit right? This logit is passed through an activation function (sigmoid) which converts it into a probability between 0 and 1. If prob < 0.5 then 0 else 1. This directly handles two outcomes.

To be clear, you can use two neurons for the two outcomes but would have to switch from using sigmoid activation function to softmax activation function. There is another switch that needs to be made if you still want to use two neurons. I will mention this later.

Concretely, using two neuron is possible but single neuron is preferrable for fewer parameters (literally half of what the output layer size will be if using two neurons), avoiding redundancy since class probabilities sum to 1 and it is the standard for libraries like keras and pytorch.

---

**2. The Forward Pass:**
------------------------

The process of data entering the neuron, weight sum and bias addition, activation function action and prediction (output) from the network is termed as the forward pass. Everything we have discussed so far makes up the forward pass process.

**3. The Loss Function:**
-------------------------

Take your mind back to the beginning of this module. I stated that we don’t have to manually assign weights, and that the network finds the right weights on its own. It begs the question; ‘*how does the network know that it has chosen the correct weights?*’

The network figures out it has gotten the right weights through comparison with a ground truth (actual answer). It checks the gap between its current answer and the actual answer. This gap is called the Loss (or cost).

$$
L(y, \hat{y}) = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}\_i)^2
$$

If the Loss is 0, the network is perfect.  
If the loss is high, the weights are wrong

The formula above is a Loss Function called Mean Squared Error. There are a lot of loss functions, and the right one depends on the task you are working. Example, the one below is called Binary Cross-Entropy, and it is best for classification tasks. Binary classification tasks.

$$
L(y, \hat{y}) = - \frac{1}{N} \sum_{i=1}^{N} \left[ y_i \log(\hat{y}_i) + (1 - y_i)\log(1 - \hat{y}_i) \right]
$$

It becomes clear that Loss is just not an error number. It is a signal that tells the network whether it is wrong and how wrong it is. Different tasks require different loss functions, but all loss functions serve one purpose: guiding weight updates.

The Loss function is then the focal point of the network computation. The network sole purpose then becomes how to minimize (reduce) the Loss (or cost). If the network figures out the weights are wrong, it needs a way to adjust them since that is the only way to reduce the loss. This is where Optimization comes in, but before discussing optimization, Backpropagation.

**4. Backpropagation**
----------------------

This is the most critical aspect in deep neural networks. Once we have the Loss at the end of the network, the algorithm calculates the derivative of the Loss to the weight of each layer, propagating the error signals (the derivative or gradient). The result is passed to the optimizer for optimization. The bias too goes through this too.

The derivative formula for the Loss to the weight:

$$
\begin{aligned}
\frac{\partial L}{\partial w} &= \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w} \\\\\\\\
\frac{\partial L}{\partial a} &= \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial a} \\\\\\\\
\frac{\partial z}{\partial a} &= 1
\end{aligned}
$$



The $d(z)/d(a) = 1$ is always true, it simplifies the formula of $d(L)/d(a)$ down to two instead of three chains. This means that the Bias receives the same error signal as the neuron itself, independent of the input.

$$
a = \sigma(z) 
$$

a is the activation function (or output of applying the activation function to Z).

**5. The Optimization (Gradient Descent):**
-------------------------------------------

We want to lower the Loss to 0 (or as low as possible). To do this, we must change the weights. But do we increase or decrease the weights? Gradient Descent helps us to figure this out.

There is a popular mountain analogy that is usually used to explain the concept of gradient descent, we will use the same analogy but with modifications that I think better capture how gradient descent works.

Imagine you are standing on top of a foggy mountain (High Loss). Foggy here is very important because it implies the difficult in seeing where you are going, and need to be careful. You want to get to the bottom of the mountain (Zero Loss), you can’t see the bottom, so you have to depend on the slope (or contours) of the ground under your feet. The slope tells you the direction that leads downward, and how big or small your next step should be.

The slope of the hill is the Gradient, and the steps you take is the Descent. The weight is the position of your body. Gradient descent (GD) moves the position of the body.

Mathematically, this involves calculating the gradient(derivative) of the Loss with respect to the weights. This gradient tells us how the loss changes when we *increase* the weight, similar to how the slope under your feet tells you whether moving forward will take you uphill or downhill. This is the work of the Backpropagation mentioned early, to compute this gradient.

* **If the gradient is positive (the slope points upward):**  
   Increasing the weight is like stepping uphill -> it makes the loss larger and takes you farther from the bottom of the mountain.  
   So we move in the opposite direction of the slope: we decrease the weight.
* **If the gradient is negative (the slope points downward):**  
   Increasing the weight is like stepping downhill -> the loss gets smaller.  
   So we follow the slope and increase the weight (move our position)

Note, GD always subtracts the gradient from the weight. Whether this increases or decreases the weight depends on the sign of the gradient returned by backprop (i.e. is gradient positive or negative?)

One-step of gradient descent:

$$
w_{t+1} = w_t - \eta \frac{\partial L}{\partial w_t}
$$

Full optimization is the repetition of that one-step formula until convergence.

The optimizer updates the weights using the gradients computed by backpropagation.

Gradient Descent is just one of many optimization techniques, with Adam being the most popular. All other optimizers are just Gradient Descent + some tweaks. Depending on your intention, you should also research on which optimizer would be perfect for your problem.

For example, Adam and other optimizers extend this idea by:

* Adapting step sizes
* Stabilizing updates
* Accelerating convergence

The full learning loop therefore goes:

* Forward pass makes a prediction
* Loss measures error
* Backpropagation assigns blame (gradient)
* Optimizer updates weights
* Rinse and Repeat

---

I mentioned ‘Convergence’ earlier, let’s clarify what it means. In neural network, converging means that the network learning loop is approaching a stable solution. If the learning is working, something very specific should always happen: The loss should decrease, weight updates should get smaller and the predictions should stop changing drastically. When these three things begin to stabilize, the model is said to be converging.

Note, convergence does not mean perfect learning, that is, loss being zero, and perfect prediction. Think of it as the network telling you ‘hola jefe, estoy cansado, yo cannot meaningfully improve anymore’. Pardon my attempt at Spanish, working on it.  
The optimizer reaches a region where, moving left increases loss and moving right increases loss. It is best to stay put. This region is called a minimum (often a local minimum and not necessarily the global one).

---

### ***Uumm, minimum? local minimum? global min…. what is going on here?***

A minimum is simply a point where the loss is lowest compared to nearby points. In terms of movement, if you move slightly left, loss goes up and moving slightly to the right still increases the loss. Take your mind back to the mountain analogy. Imagine you got yourself into a region where to the right there is a high wall and to your left there is a high wall. Any step you take requires moving up (loss increasing). This means you are at a minimum.

This analogy makes something clear: that minimum is defined relative to its surrounding, not the entire landscape.

That distinction is what defines a minimum as being local or global. A Global minimum is the lowest possible region anywhere on the mountain. You are at the very bottom of the mountain and just can’t go down anymore (except you start digging, and I don’t know why anyone would do that). In theory, getting to the global minimum means network has achieved the best possible weights. It requires seeing the entire landscape and comparing every possible configuration. Do you think it is possible for neural networks to run every possible configuration of weights?

A local minimum is a point that is lower than everything immediately around it, but not necessarily the lowest overall. Here, moving in any small direction increases the loss, even though somewhere farther away there may exist a lower point. Notice how I keep using the term *“small movement”*?

### ***Why is minimum even a thing?***

Well for simple models, the loss function is convex. The loss surface is smooth, like a bowl. This leads to one minimum and easy convergence.

The case is different for neural networks. The loss surface is high-dimensional, non-convex and full of valleys, ridges and flat regions. The result is presence of many local minima, wide flat regions and saddle points. So the optimizer is touring a landscape it cannot fully see.

The good news though is that in deep learning, many of the local minima are good enough. Getting the global minimum is neither necessary nor always desirable. As a result, modern training usually focus on gaining stability, generalization and convergence speed. Not perfection.

***Back to ‘Notice how I keep using the term “small movement” ? ‘***

Back to the mountain analogy. You have a wall around you, any small step takes you up (increases loss), but if you took a very big step (say you jumped), your position would go higher (higher loss) but also increases the chance of ending up in a place where you are closer to the bottom of the mountain (it could be another local minimum or global minimum). The part to pay attention to here is that taking a big step takes you out of the local minimum.

In deep learning optimization, the large step means increasing the learning rate. Large learning rate gets you out of the local minimum and small keeps you stuck. In deep learning, ‘stuck’ is not really what happens. small learning rates can slow progress and make it hard to escape flat regions or shallow minima. The choice of optimizers also affects how easily you can escape minima, mini-batches (which introduces noise) can also help jump out of bad local minima.

It goes without saying that if a large step takes you out of a valley, there is also a chance that it lands you in a region that is even higher than where you started (that is, farther from the bottom of the mountain).

Finding the right learning rate for a given task usually requires experimenting with different learning rate values.

---

Few more things to address
--------------------------

Earlier, I mentioned that mini-batches introduce noise into the optimization process. This is not an abstract idea; it comes directly from how gradients are calculated.

In theory, the ‘true’ gradient of the loss is defined with respect to the entire dataset. If we could compute the loss over every single data point at every step, the gradient would point in the exact direction of steepest descent. This would be a perfectly smooth and deterministic process. Every step would be consistent, predictable, and free of randomness.

In practice however, this world of vanilla ice cream rarely exists. Instead, we compute gradients using mini-batches, which are small random subsets of the dataset. Each mini-batch contains a slightly different sample of data, and therefore produces a slightly different estimate of the gradient. As a result, consecutive updates do not point in exactly the same direction, even when the parameters have barely changed. This variability between gradient estimates is what we refer to as noise.

You can think of it this way: the optimizer is trying to walk downhill, but each step is guided by an imperfect, slightly distorted view of the slope. Sometimes the step is perfectly aligned with the true downhill direction, and sometimes it is a little off. Over time, these errors average out, but step by step, the path is not smooth. This noise is not a flaw. It plays a critical role in how neural networks learn.

---

I kept talking about local minima and It is tempting to think that training fails because the optimizer gets stuck in bad local minima. While this is a valid concern in low dimensional problems, it turns out to be much less important in modern deep networks. It is why I have taken out time to make further distinctions.

In explaining ‘why is minimum even a thing?’, I mentioned alongside local minima, saddle points and wide flat regions but never actually discussed what they are. I focused on local minima.

We’ve established that a local minimum is a point where the loss is lower than all nearby points. Small movements in any direction increase the loss. You are, in a strict sense, stuck unless you take a sufficiently large step.

A saddle point is more subtle. At a saddle point, the gradient is zero or close to zero, just like at a minimum. However, it is not a minimum. In some directions, the loss increases, while in others, it decreases. The surface curves upward in one direction and downward in another. Going back to our favourite mountain analogy, a saddle point is like standing on a mountain pass. If you move forward or backward, you go uphill. If you move left or right, you go downhill. Locally, everything feels flat or confusing, and the gradient provides little useful signal, even though you are not at the bottom.

A flat plateau is different too. Here, the surface is almost flat over a wide region. The loss changes very slowly, and gradients are extremely small. You are not trapped by walls; instead, progress is slow because there is no clear slope to follow. Imagine you got to a point on the mountain where everything around you is a wide flat environment. No contours, hills, just plain. You can imagine that loss would appear almost stationary.

In high dimensional spaces, such as those created by neural networks with millions of parameters, saddle points and flat plateaus are far more common than true bad local minima. Most situations where training appears “stuck” are actually cases where the optimizer is lingering near a saddle point or drifting slowly across a flat region.

We can see how mini-batch noise becomes useful here. Because each gradient estimate is slightly different, the optimizer does not follow a perfectly smooth path. Instead, it wiggles. These small random fluctuations help push the parameters away from saddle points, where a perfectly computed gradient might remain near zero indefinitely. They also help the optimizer drift across flat plateaus instead of slowing to a crawl. Noise introduces exploration. It allows the optimizer to try directions that a purely deterministic method would never consider.

---

I also did mention that local minima are often good enough that pursuing global minima might not be a necessity, and is not always the goal. I should mention that not all minima are equally desirable.

A sharp minimum is one where the loss increases very quickly if you move slightly away from the minimum. The region is narrow, steep, and sensitive. A small change in parameters can lead to a large increase in loss.

A flat minimum, on the other hand, is surrounded by a wide region of low loss. Small parameter changes do not significantly affect performance. The model behaves consistently even when slightly perturbed.

Empirically, flat minima tend to generalize better. Models that settle into flat regions perform more robustly on unseen data, while models that converge to sharp minima often perform well on the training data but poorly on new examples.

***Wait a minute, if Global Minimum represents the lowest possible loss why then would that ever not be a good thing?***

The global minimum represents the absolute lowest loss on the training data. In highly overparameterized models, this often means fitting the training data extremely precisely, including noise that do not generalize. Such solutions are frequently sharp. They depend on very specific parameter configurations, and small deviations can significantly degrade performance. From a learning perspective, this is fragile behavior.

It ties back to overfitting. The model concentrates so much on getting it right with the training data that there is no room for flexibility. Once the model has to deal with a data that has slight deviation from the boundary of the training data, it performance drops significantly.

Instead of tuning configurations so tightly to have perfect performance on training data, stopping in a slightly higher but flatter minimum often yields better generalization. The model may not achieve the lowest possible training loss, but it captures patterns that are stable and transferable. It is why modern training practices prioritize stability, generalization, and convergence behavior over absolute perfection. The optimizer is not searching for perfection; it is searching for a region of the loss landscape that is good, wide, and forgiving.

---

Mini-batch noise, learning rate choices, and optimizer dynamics all shape how a neural network navigates its loss landscape. The idea is not to eliminate randomness or force convergence to the deepest possible point. Instead, the goal is to guide the model toward regions that balance low loss with robustness.

In the next module, we will be discussing Deep Neural Networks (DNNs). See you there.