---
cover: /img/md1.png
date: '2025-12-25T08:59:52.021Z'
domain: jimmywritessometimes.vercel.app
lastmod: '2025-12-25T10:11:38.222Z'
slug: module-1-the-atom-of-intelligence
tags: ['Perceptron', 'Atom', 'Bias', 'Activation Function', 'Logits','Data', 'Weight', 'Neuron']
title: From Zero to Foundation Models
weight: 1
---

# ZERO TO FOUNDATIONAL SERIES

![module 1](/img/md1.png)

From Zero to Foundation Models series is not necessarily aimed at absolute beginners. It is meant for people with some prior knowledge of AI, no matter how little it might be.  
The series is intended to act as a companion to readers:

* You have an interview coming up? well glance through foundation model series to refresh your memory.
* You are bored at home? take a stroll through the series.
* You are preparing for a presentation? pop in here and out.

Throughout the series, I make a great effort to explain concepts in the simplest possible units as much as I can. Even an absolute beginner would still greatly benefit from it.

So far, the series will comprise of 8 modules and I recommend following them in order, as I will often reference examples in previous modules:

* Module 1: The Atom of Intelligence.
* Module 2: The Learning Process.
* Module 3: Deep Neural Networks.
* Module 4: Handling Spatial Data.
* Module 5: Handling Sequential Data.
* Module 6: The Attention Revolution.
* Module 7: The Transformation Architecture.
* Module 8: Pre-training & Foundational Models.

---

I hope all the readers find this useful.

---

MODULE 1: The Atom of Intelligence.
===================================

Everything about AI starts with the Perceptron, commonly referred to as the unit of Artificial Neuron. Deep learning is “loosely” inspired by the human brain. Emphasis on ‘loosely’. Our brain consists of billions of neurons connected by synapses. When a neuron receives enough electrical signals from its neighbours, it fires (activates) and sends a signal down the line.

In AI, this interconnection is mimicked using mathematics. Imagine a neuron as a tiny machine that makes a decision. To make this decision, it takes information in, processes it, and spits out an answer. At this level, it is important that I make it very clear: the neuron is not “intelligent” yet. It is simply executing a fixed mathematical rule.

In this small decision-making process, there are four main components

1. Inputs(x) – this is the information coming in  
2. Weights(w) – a measure of how important the input is.  
3. Bias(b) – an internal threshold that describes how likely the neuron is to fire regardless of inputs.  
4. Activation Function – a rule that decides the final answer(output)

MATHEMATICAL NOTATIONS
----------------------

Before going further, I want to establish that the notation above assumes we are dealing with a single input x. In reality, we deal with hundreds, thousands, or even millions of inputs. In this case, we represent the inputs as **X** and the weights as **W**.

Conceptually, X represents what the world is telling the neuron (input data), and W represent what the neuron cares about (importance neuron attaches to X). The interaction between the two determines the neuron’s response.

Consider X and W as vectors (or matrices when we stack many neurons together).

X = inputs.  
I could write something like:

$$
X=[x1,x2,x3]
$$

This means that X contains three pieces of information:  
x1​ –> data 1; x2​ –> data 2; x3​ –> data 3.

The same idea applies to W:

$$
W = [w1, w2, w3]
$$

where w1 is the weight for x1​, and so on. Each weight indicates how much should an input influence the neuron decision.

When a neuron processes data, it performs a **weighted sum**. The formula is:

$$ 
Z = WX + b 
$$

The operation of WX is a Dot Product

Expanded:

$$
Z = (x1⋅w1) + (x2⋅w2) + (x3⋅w3) + b
$$

The weighted sum measures alignment. Each multiplication asks ‘does this input support the decision the neuron is leaning towards?’

* If an input is important and present, it contributes strongly.
* If it is unimportant or absent, it contributes little or nothing.

The sum aggregates all these signals into a single score **Z**.

It is important to understand that **Z** is not a decision. Z is a score. Think of it as how strongly the neuron is leaning, not whether it has committed yet.

### *Example*

We want to build a neuron to decide whether we should buy a house or not. We feed it the following inputs:

* x1​ = price (1 for low, 0 for high)
* x2​ = location (1 for good, 0 for bad)

Now we assign weights, which measure how important each input is to our final decision:

* w1 = 2 (lower because we don’t care as much about price)
* w2=5 (higher because location matters more)

Now let’s run the decision-making process without **bias** for clarity:  
Decision process 1 – cheap house (1) and bad location (0)


$$
z_1 = (1 \times 2) + (0 \times 5) = 2;  Z = (x_1w_1) + (x_2w_2)
$$
<!-- $$
% \begin{aligned}
z_1 &= (1 \times 2) + (0 \times 5) = 2 \\
Z &= (x_1w_1) + (x_2w_2)
% \end{aligned}
$$ -->

Decision process 2 – cheap house (1) and good location (1)

$$
z2 = (12) + (15) = 7
$$

Decision process 3 – expensive house (0) and bad location (0)

$$
z3 = (02) + (05) = 0
$$

Decision process 4 – expensive house (0) and good location (1)

$$
z4 = (02) + (15) = 5
$$

We have:

$$
z2 > z4 > z1 > z3
$$

The neuron has not decided anything yet. It has only produced scores. For a decision to occur, there must be a rule that says *“this score is enough”*. That rule is handled by the activation function, which we will explore in the next module.

### ***But where is the bias? Where is our b?***

Recall how I described bias: an internal threshold that describes how likely the neuron is to fire regardless of inputs. You can think of it as a baseline tendency. In our example, let’s consider we are desperate to just buy any house. That desperation would be the bias. The one constant that affects every permutation of decision process. It doesn’t matter what the inputs are.

Say we set Bias = 15. This would increase the score for all decision process, right? Bias does not just “increase scores.” What it really does is shift the decision boundary.

To make what I mean by ‘shift the decision boundary’ easy to understand, think of neuron as always asking the question '*How much evidence do I need before I say yes?* ‘

This means that there is a threshold that must be exceeded for the ‘evidence’ to be enough for the neuron to say yes. Let’s consider the Z formula again:

$$
Z = WX + b
$$

Do you remember those math classes or physics (even chemistry) labs, where you plotted points on a graph, and then had to through a plane (line) that passes through those points but capture as much points as possible? The threshold was for the points along the line must be more than the ones outside the line. So, you tried as much as possible to attend this threshold but the problem was that the line had to passed through the origin(0,0). Imagine just how much easier it would have been if you could draw the line from any place (without the constraint of passing through the origin), how much better you could capture the data points and just how much better the slope would get.

This is exactly what bias offers. By adjusting b, the plane can capture more data points and be more accurate. There is also more space for learning to occur by neural networks. Now, I mentioned earlier that Activation function is the one that answers ‘*is this score enough?*’ It is the activation function that decides if the neuron should say yes.

We are yet to discuss activation functions, this is what module 2 addresses, but for the purpose of solidifying our knowledge of bias, I will explain how bias works with activation functions too. If you don’t understand this now, you will do so fully in module 2, so don’t stress it.

Let’s use sigmoid activation function as an example. The sigmoid curve is smooth and continuous, and its midpoint is usually 0.5 when the input is 0. With b, this curve is shifted either to the left or right along the x-axis, changing which inputs are enough to cross the 0.5 threshold.

* **If bias is increased:** The curve shifts to the left. This means even a very small (or even negative) input x can result in the neuron say yes.

In the earlier house example, if we set **bias = 15** (we just want to get a house desperately), then:

$$
z3 = 0 + 15 = 15
$$

Even the worst option (high price, bad location) now produces a high score. The neuron has effectively been told: *“lean toward saying yes.”* The model is more biased towards accepting anything.

* **If bias is decreased:** The curve shifts to the right, this means that bigger values of X will be required to get the same neuron to say yes, as we saw in the example.

This is why bias is critical, it gives the model flexibility to shift decisions without relying entirely on input features. It gives the neuron permission to output something other than the default when the input value is zero or week.

For example, in process decision 3, z = 0. sigmoid(0) = 0.5 always. With bias, the neuron can output something different from 0.5, which allows for a better learning chance.

<!-- ![By Qef (talk) - Created from scratch with gnuplot, Public Domain, https://commons.wikimedia.org/w/index.php?curid=4310325](https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Logistic-curve.svg/960px-Logistic-curve.svg.png)

*By Qef (talk) - Created from scratch with gnuplot, Public Domain,* [*https://commons.wikimedia.org/w/index.php?curid=4310325*](https://commons.wikimedia.org/w/index.php?curid=4310325) -->

**What can Our Neuron do and not do?**
--------------------------------------

At this stage, everything we have discussed is just pure computation. There is no learning yet. The weights and bias are fixed. The neuron does exactly what it is told.

There is also an important limitation of our neuron I should mention. It can only draw linear decision boundaries. A single perceptron can only draw a linear decision boundaries no matter how you tune the weights and bias. It can only separate inputs in straight lines.

This limitation is not really a flaw but a clue. If a problem cannot be separated linearly, one neuron will never be enough. This is why deeper architectures exist. Depth is not added for elegance but out of necessity.

This simple structure, inputs, weights, bias, activation, is the foundational architecture everything else is built on. Bigger systems are simply scaled versions of this decision process.

### **To summarize our example:**

* X and W are vectors
* WX → a dot product of two vectors
* Our neuron can only perform linear separation
* Z is a score (or logits), activation function turns the score to decision which the neuron fires.

Let’s now discuss the decision process in more depth in the next module.