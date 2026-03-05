---
cover: /img/attention.png
date: '2026-03-02'
domain: jimmywritessometimes.vercel.app
slug: module-6-attention
tags: ['Attention', 'Query', 'Key', 'Value', 'Cross-Attention', 'Self-Attention']
title: 'Module 6: Attention'
weight: 6
---


# MODULE 6: IT PAYS TO PAY ATTENTION

![module 6](/img/attention.png)

The RNNs and LTSMs we’ve been discussing are all sequential with reading the data, one time step after the other, the longer the sequence the more the network relies on a ‘hidden state’ to retain knowledge of earlier steps in the sequence. Just to refresh our memory, consider the situation below:

Imagine I ask you to translate a 50 page book into French. If you were an RNN, you would read Page 1, summarize it in your head, then read Page 2, update your summary... and by the time you reach Page 50, you are forced to hold the entire meaning of the book in a single mental summary (a fixed-size vector).

This is the Information Bottleneck. You cannot cram the nuance of a whole book into one small vector. The beginning of the sentence gets "diluted" by the time you reach the end – later words then hold more influence than reference words or sentences.

We needed a way to address this issue, and in 2014, researchers did. ATTENTION. It turns out my grandmother was right when she told me ‘It pays to pay attention’.

The mechanics of Attention revolves around three key things: Query, Key and Value. These are the most critical concepts in modern AI. Every transformer models like GPT, BEERT, Llama, etc uses these. As such, I will do the best I can to explain them to best I can. Now, let’s imagine once again:

Imagine you are in a library searching for information on “Nutrition”.  
- The Query (Q) would be your intent. You are holding a sticky note that says “Nutrition”. It is what you seek.
- The Key (K) would be the labels of the books on the shelf (e.g., History, Biology, Food Science)
- The Value(V) would be the actual content inside the books.

### HOW THE PROCESS WORKS:

1. You compare your Query (“Nutrition”) against every Key on the shelf. Call this the comparison step
“History” ? No match (Low score).
“Biology” ? Partial (Medium score)
“Food Science” ? Perfect (High score)
2. You don’t just pick one book. You pay more attention to the books with high scores. Call this the weighting step
3. You pull the information (Values) from the books, weighted by how well they match. This means you will get a lot of info from the Food Science book and little from the Biology book.

Bringing this back to Neural Network terms, every word in a sentence becomes a vector (remember tokenization and vectorization and embedding size?). This vector is divided into three distinct roles: Q, K, and V.

- Q-> Query -> what am I looking for? -> in our imagine scenario this was Nutrition.
- K -> Key -> what do I contain.
- V -> Value -> if you pick me, here is my information.

So far, I’ve been using Attention as an umbrella for discussing the mechanics, but there are two forms of Attention or Attention type if you want to think of it as such: Cross-Attenion and Self-Attention.

## ATTENTION (OR CROSS-ATTENTION)

Cross-Attention is to compare different sequences. The Query comes from one sentence (the sequence being compared with), Key comes from the other sentence (the sentence being compared, e.g. English) and Value is from same sentence as the key (e.g., English).

Take the sentence (English): “The cat is sleeping.”  
Another: “Le chat dort.”

We are translating from English to French. When generating “chat”, the network needs to look at the English input. So “chat” casts a query into the English sentence:

“chat” -> Q -> looks at English words: “chat”, “sleeping”, “the”, 

“is” -> high match for “cat” and low match for “sleeping”. 

Attention is used to focus on the relevant part of the other sequence. 

### SELF ATTENTION

There is also self-Attention. Don’t get it confused with Attention. Attention is used to relate two different sequences (like English to French). Self-Attention is when a sequence looks at itself to understand context.

Take the sentence: "The animal didn't cross the street because it was too tired."

When the model processes the word "it", how does it know what "it" refers to? Is "it" the animal? Or is "it" the street?

1. The word "it" casts a Query.
2. Every other word ("animal", "street", "tired") offers a Key
3. The model calculates the match.
“if” vs “street” -> low match (streets don’t get tired).
“It” vs “animal” -> high match (animals get tired).
4. The model concludes “it” = “animal”.

This happens for every single word simultaneously. Every word is constantly "talking" to every other word to define its meaning in that specific context.

To make this easier to understand. In self-attention, this is what happens:
- “The” looks at: animal, didn’t, cross, street, because, it, tired
- “animal” looks at: The, didn’t, cross, street, because, it, tired
- “street” looks at: The, animal, didn’t, cross, because, it, tired
- “it” looks at: The, animal, didn’t, street, because, tired
- “tired” looks at: The, animal, didn’t, street, because, it
Literally every word checks how related it is to every other word, and it all happens simultaneously.

Self-attention is a matrix of weights (scores) where the rows are the queries and columns are the keys. A single self-attention layer builds a table like this.

```
            The animal  didn’t 
The          *    *        *
animal       *    *        *               
didn’t       *    *        *

```
You know the way correlation matrix table looks? It’s exactly like that. Each * is a score that show the usefulness of the keys(query) to the query (row). Self-Attention has same source, same target, and is used for internal context building. Self-Attention is used in BERT, GPT, Transformer Encoder.

I've intentionally left out the computation part of attention out. Check the article on Transformers for full computation and flow.

