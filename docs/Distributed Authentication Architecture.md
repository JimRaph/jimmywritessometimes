---
cover: /img/Distributed-Auth.png
date: '2026-03-01T16:53:51.005Z'
domain: jimmywritessometimes.vercel.app
slug: Distributed Authentication Architecture
tags: ['Authentication', 'Distributed', 'System', 'JWT', 'Redis', 'Microservices']
title: 'Distributed Authentication Architecture'
weight: 3
---


# Distributed Authentication Architecture 

![module 1](/img/Distributed-Auth.png)

I started learning full-stack development by building CRUD systems. My understanding of authentication was all about logging in, but authentication isn’t just logging in; it’s about how identity propagates without hitting a central database 10,000 times a second.

In this article, we will discuss authentication using cookies as the form of storage and how to build a robust authentication system that is not vulnerable to attacks like CSRF, XSS, Replay Attacks, etc. Also, we discuss from the lens of a distributed system.

Think about it. For a system that is monolithic and would serve few hundreds, the standard authentication flow I learnt when I started is enough: user clicks a log in button, we check for user existence in the database, verify auth token, then let user in.

Here the default token (or at least what I learnt when I started last year) is JWTs, a stateless mechanism, to authenticate users. JWTs work great until we need to log out a user immediately and the token validity period has not exhausted. 
Remember, JWT works by signing a three parts object in the backend. The Three parts are: 
1.	**The Header** – this is where the algorithm being used is specified and the type of token (almost always JWT)
2.	**The Payload** – contains whatever data we want to place in the token, like user data. This is also where the expiration information is contained. JWT is a JSON object, and as I said it contains whatever data we want to place in there. However, in practice we use three-letters keys known as Registered Claims since every library understands them. They are:

* ***sub (subject)*** – usually we place the user id here. A unique identity  
* ***iat (Issued At)*** – a timestamp of when the token was created  
* ***exp (Expiration)*** – when token will expire  
* ***jti (JWT ID)*** – unique identifier for the specific token (more on this later)  
3.	**The Signature** – This contains the information that tells us know the token hasn’t been tampered with. The chief security. The Seal. We create this by taking the Header (encode it), encoded Payload, and a secret key (only our server should know this), and run them through the algorithm we specified in the Header. This ensures that if any information in the object (Payload or Header) is changed (say by an attacker), our server will calculate a new signature based on the new data. When this is compared to the original signature on the token, it doesn’t match and the request is rejected.

If you are wondering how it is that an attacker can change the data in our JWT, it is simply because the object is merely Base64 encoded and as such can be read by anyone. The signature just informs us the data hasn’t been tempered with.

After signing this object, we send it to the frontend, for the frontend needs to attach it to every request that comes into our server. If a malicious actor somehow got the JWT from the frontend, the actor can keep using that token even after the right user had logged out of the system. The reason for this is that the validity information will show that token hasn’t expire. Even if as a dev you somehow found out that the token was stolen, you can’t really revoke access via the token directly (there are indirect ways to deal with this, for example, you could keep the token in-memory and compare every incoming token to it and return error on requests that matches, but this would require you as the dev to extract the JWT).
 
I mentioned we will discuss more on `jti`. The `jti` is probably the most important claim for security in a distributed system. One of the first things I was confused about whenever `jti` was mentioned was why we needed `jti`. The user id is unique after all why do we need another unique id? The user id is unique but consider that we issue 10 different JWTs to the same user (it is a common behaviour to have a user logged into our system on phone, laptop, tablet, etc), all these JWTs will have the same identity (remember ‘sub’ one of the three-letter keys). This means that we can only revoke access for the user (which removes them from all the devices) but with `jti` we can revoke acesss on a specific device. The `jti` will become very useful as we discuss further.

To deal with the problem of token revocation, we can try the following:
1.	**Short-lived Access Token (stateless) + Long-lived Refresh Token (stateful) combo** – What we do is that instead of sending a single token back to the user on successful login, we create two tokens. One token (JWT) has a very short validity period (e.g., 15 mins) and the other token (random string) has a longer validity period (e.g., 7 days). We save the Refresh token (token with 7 days validity period) in a database table and link it to the user id. Both are then sent to the user.

2.	**A Deny List** - When a user logs out, we store the `jti` (JWT ID) in a high-speed Redis cache with an Expiry (TTL) equal to the token’s remaining life. We use an API Gateway to check this cache on every request. Using a deny list introduces a form of state as we now have to make use of an in-memory database like Redis. However, it is better than using traditional database since it is faster and allows for sub-millisecond checks. Using the API Gateway is pivotal especially in a microservices architecture since we don’t want our services to have to connect to Redis and check for revoked tokens.

3.	**Refresh Token Rotation** – Here we just ensure that every time a refresh token is used, we invalidate it and issue a new one. The idea is that if an old refresh token is reused, we can assume it to be some form of a breach and invalidate all active session for that user immediately.

Stateless here means that the server doesn’t store or track them on its end to validate them. The server doesn’t need to look up a database to verify them. All the information needed for validation is contained in the token itself. This means that by using JWT we are reducing server load as validation is local and self-contained. Scaling across distributed systems is easy because there is no shared session store required. The result here is easy horizontal scaling, high availability (no source of failure unlike using session store) and better performance (reduced round-trip times and better support of concurrency).

A common workflow for the Deny list using Redis would look like this:
1.	User logs out by hitting /logout endpoint 
2.	We decode the JWT sent along with the request, grab the `jti` and the exp keys (we don’t want the key to live on Redis forever)
3.	Store the keys in Redis
4.	When next request comes in, the API Gateway checks if signature is valid by checking if that `jti` exists in the Redis
We could have stored the full JWT object instead of just the `jti`, however it is more memory efficient to store just the `jti` (thing size). Also, if the Redis were ever to be compromised, the attacker would only find lists of `jti` (random id). Information like roles, email, permissions or any other information we included in the payload can’t be found.

### **STORING TOKEN**

A big component of authentication is the token that comes with a request, as such it should be treated with utmost protection. How we store a token is a very important security consideration. One common place to store tokens is in the cookie which lives in the browser, and as a result exposed to potential security vulnerability like CSRF. 

To protect against these vulnerabilities, we often enable the following config in the cookie:
1.	**HttpOnly** – This is what prevents JavaScript (XSS attacks) from reading the token. XSS is an attack to steal your identity (cookie).
2.	**Secure** – This ensures that the cookie is sent only over HTTPS.
3.	**SameSite=Strict** – This is quite crucial for preventing CRSF I mentioned earlier. Strict means the cookie is only sent if the request originates from our domain.
4.	**Domain** – Here is where we limit the scope of where the cookie is sent without our architecture.

Before going ahead, CSRF stands for Cross-Site Request Forgery and it is when a dangerous site tricks a user’s browser into sending a request to a server using the user’s saved cookies. You can read up more on this if it interests you.

Beside the aforementioned options, we can deal specifically with CSRF using the following:
1.	**Synchronizer Token Pattern (STP)** – we generate a one-time token on the server, embed it in a hidden field in the frontend. The server validates this token on requests done with action methods like POST, PUT, etc. This is useful when we are rendering html from the sender with things like template engines (e.g., ejs)  

2.	**Double Submit Cookie (DSC)** – This is the one you will most likely use. The idea capitalizes on the fact that you can only read a cookie from your domain. A malicious site can’t read it. We generate token on the backend and send to the frontend via cookie. The frontend reads the cookie and attaches it as a custom header for every request. On the backend, we compare the cookie (req.cookies[‘XSRF-TOKEN’]) and the cookie attached as the custom header (req.headers[‘X-XSRF-TOKEN’]). 

One more thing concerning **DSC** is that the `HttpOnly` option must not be enabled in the cookie config, else we won’t be able to read the cookie on the frontend. Additionally, use SameSite=Lax and not “Strict”.

Using “Lax” stops common CSRF attack (the cross-site POST). “Strict” is much more secured. The tradeoff on the one to use depends on good UX vs Security. Consider the scenario below:

Imagine being on **X** (x.com). You click on a button and you are redirected to `mysite.com/buy`; your browser automatically attaches the cookie if you used `SameSite = Lax`. The result is that arriving on `mysite.com/buy` you are already logged in. You don’t have to enter password or email. You have probably witnessed this before.  

If you used SameSite=Strict, on landing on `mysite.com/buy` you will be forced to log in because the browser doesn’t automatically attach cookie because the request originated outside `mysite.com`.

The danger here is that if the developer who built `mysite.com` allowed non-action methods like **GET** to perform action using `Lax` would be dangerous as that action would be allowed. `Strict` kills it immediately. If you use `Strict` there is no need for the Double Submit Cookie mechanism and you would lose the UX too. If you want the good UX, use DSC.

What happens if we set `HttpOnly=False` but `SameSite=Strict`? Same logic applies. All requests not originated from our domain would be blocked as browser wouldn't attach session cookie. This means landing on the log in page. Always remember that using DSC is for CSRF protection, and to not lose the UX you have to skip comparing header token and cookie token for requests with `GET`, `HEAD`, and `OPTIONS` methods.

By combining these mechanisms, we can build an even more robust authentication system that is resistant to vulnerabilities but support good user experience. Imagine combining the Short-lived Token, Long-lived Refresh Token, Deny list, Refresh Token Revocation and Double Submit Cookie mechanism.

Here is what the workflow could look like:

1.	User Login: User submits credentials via POST.
2.	Verification: Backend validates credentials against the SQL Database.
3.	Token Generation:
* Access Token (AT): Short-lived (e.g., 15 mins). Includes a unique `jti` (JWT ID).
* Refresh Token (RT): Long-lived (e.g., 7 days). Random string hashed in the DB.
* CSRF Token: Random string for Double Submit Cookie.
4.	The Response: Tokens are sent to the frontend via cookies:
* `session_at` & `session_rt`: HttpOnly, Secure, SameSite=Lax (or SameSite=Strict but this must apply to `XSRF-TOKEN` too)
* `XSRF-TOKEN`: Secure, SameSite=Lax (No HttpOnly so we can read it on the frontend).
5.	Resource Request: User navigates to /dashboard. Browser automatically attaches all cookies.
6.	CSRF Check (Unsafe Methods Only): If the request is `POST/PUT/DELETE`, the backend compares the `XSRF-TOKEN` cookie with the `X-XSRF-TOKEN` header sent by the frontend.
7.	The Gateway Check: The API Gateway intercepts the request to verify the Access Token:
* Check A (Signature): Is the JWT cryptographically valid?
* Check B (Deny-list): Does the `jti` exist in the Redis Deny-list?
8.	Decision:  If valid and not in Redis: Return the resource (Dashboard data).
* If expired: Return 401 Unauthorized.
* If in Redis: Return 401 Unauthorized (Token Revoked).
9.	401 Interception: Frontend intercepts the 401, pauses pending requests, and calls /refresh.
10.	The Stateful Check: The Backend receives the Refresh Token from the cookie:
* Check if the RT exists in the SQL Database.
* Check if expires_at > currentTime.
* Check if the user is banned or the token is revoked.
11.	Rotation & Cleanup:
* If valid: Delete the old RT, generate a brand new RT and AT.
* Theft Detection: If the RT was already used (Replay), the server assumes a breach and revokes the entire token family.
12.	Retry: Frontend receives new tokens and retries the /dashboard request (returning to Step 7).
13.	Manual Logout: User clicks "Logout."
14.	Backend Cleanup:
* Delete the Refresh Token from the SQL database.
* Take the Access Token `jti` and add it to Redis with a TTL equal to its remaining life (e.g., `SETEX blacklist:abc123 600 true`).
15.	Immediate Effect: Even if an attacker has that Access Token, Step 7B will now fail instantly.

In step 10, I mentioned checking if user is banned or token is revoked. There are two things here. Checking is user is banned is done at the account level. For example, you should have a ‘account_status’ field in the ‘users’ table in the database. This field is how you track if a user is suspended, active, banned or any other possible status a user of your system can be in. Note this isn’t compulsory and depends on the system. A community chat system could do with a ‘account_status’ but an ecommerce system might not need it.

For checking if a token is revoked, this can be done through the ‘refresh_tokens’ table. There should be a field where you track if a Refresh Token is active, has already been used to create a new Refresh Token, or revoked. Again, this depends on the architectural design choice of the system you want to build. Using a tracking field for a Refresh Token can greatly help with Replay Attacks. If a request comes in with already consumed Refresh Token you can assume that it is a breach and revoke every single active Refresh Token associated with the user id.

In step 4, you notice we use either `Lax` or `Strict` for all tokens. The reason for this is how Browser handles cookie. Remember, the essence of **DSC** is to protect against **CSRF**, and using `Lax` is to enjoy the UX benefit. If we are navigating from another site to our site (say we land on dashboard page), browser hides all cookies marked `Strict` from that specific document instance (dashboard). Every request will have `document.cookie` as empty for the current page. If we naviagate to another page (say profile page) from the dashboard page, the `document.cookie` will no longer be empty or missing.

Chances are that when a user is navigated to our site from another site, they are likely to make some action requests (POST for example) on the page her/she landed on, this would return an error. By using `Lax` for all cookies we avoid this problem.

Our discussion here ensures that even in a distributed system, we have a way to immediately revoke access for security reason without sacrificing the speed and scalability that we choose JWTs for in the first place.
