title: "How To Deploy a Chat Server with Rocket.chat"
date: 2016-06-28 11:00:00 +0800
author: hyper
preview: Rocket.Chat is a web chat application for communities and companies wanting to privately host their own chat service or for developers looking forward to build and evolve their own chat platforms. In this guide, we will demonstrate how to deploy a Rocket.chat container connected with a MongoDB container.

---

Rocket.Chat is a web chat application for communities and companies wanting to privately host their own chat service or for developers looking forward to build and evolve their own chat platforms. In this guide, we will demonstrate how to deploy a Rocket.chat container connected with a MongoDB container.

### 1. Pull the images

``` bash
[root@localhost]$ hyper pull rocket.chat
Using default tag: latest
latest: Pulling from library/rocket.chat
5c90d4a2d1a8: Pull complete
ab30c63719b1: Pull complete
29d0bc1e8c52: Pull complete
114d740b928a: Pull complete
8821e508459c: Pull complete
8821e508459c: Pull complete
11b1f97682ee: Pull complete
ba16283d7d1a: Pull complete
Digest: sha256:672e47af400f3ccdfb92a887ff02d96f1c5bf17ccc44bc24d755619f4e51d5a0
Status: Downloaded newer image for rocket.chat:latest

[root@localhost]$ hyper pull mongo
Using default tag: latest
latest: Pulling from library/mongo
8ceedfe606fc: Pull complete
de56a622d4ac: Pull complete
6f6965220a2d: Pull complete
290580b9cb91: Pull complete
74518025c1d4: Pull complete
3be42c3d566b: Pull complete
1f3f56933a51: Pull complete
9a2e0c784afa: Pull complete
a600166aa315: Pull complete
Digest: sha256:5b9a35332e2e538d721e83dab78041fe251b89d97b16990a45489189ea423967
Status: Downloaded newer image for mongo:latest
```

### 2. Launch MongoDB container

``` bash
[root@localhost]$ hyper run -d --name db mongo
d578eb3dc4ee3c2fb8127b2dee1900035f1e2a954eace2182b0471d0254a5802
```

### 3. Launch Rocket.chat container, linked with MongoDB container

``` bash
[root@localhost]$ hyper run -d --name app --link db:db rocket.chat
fa18660c1a9ef63da929b62f66417b5d82b3c5c877556417c11f31de4996ba01
```
	
### 4. Assign floating IP to Rocket.chat container

``` bash
[root@localhost]$ hyper fip allocate 1
23.236.114.34
[root@localhost]$ hyper fip associate 23.236.114.34 app
```

### Done

Try http://23.236.114.34:3000 in browser!
