title: "How To Deploy a Shadowsocks Container"
date: 2016-05-30 11:00:00 +0800
author: hyper
preview: Shadowsocks is an open source socks5 proxy which, according to their official site, is designed to protect your internet traffic. In plain English, it allows you to browse the Internet with more privacy.

---

### Introduction

[Shadowsocks](http://shadowsocks.org) is an open source socks5 proxy which, according to their official site, is designed to protect your internet traffic. In plain English, it allows you to browse the Internet with more privacy:

- Encypt the traffic between you and the servers;
- Prevent cookies, or malicious applications;
- Mask your computer's IP;
- Prevent your ISP from logging DNS history;

In this tutorial we will explain in detail how to deploy a private shadowsocks container in 3 steps.

# Prerequisites
Please make sure you complete the following prerequisites:

- [Open a Hyper_ account](https://console.hyper.sh/register)
- [Generate API credential](https://docs.hyper.sh/GettingStarted/generate_api_credential.html)
- [Setup `hyper` CLI on your local computer](https://docs.hyper.sh/GettingStarted/install.html)

### Step 1. Pull the shadowsocks image to your Hyper_ account

Open the terminal on your local computer:

``` bash
$ hyper pull oddrationale/docker-shadowsocks
Using default tag: latest
latest: Pulling from oddrationale/docker-shadowsocks
012a7829fd3f: Pull complete
41158247dd50: Pull complete
916b974d99af: Pull complete
a3ed95caeb02: Pull complete
95b198eff4ae: Pull complete
001c5b5b7517: Pull complete
Digest: sha256:221070b8688f049fa791528e1e9c5fc0c027f12a858d22b540170c2cca1dec69
Status: Image is up to date for oddrationale/docker-shadowsocks:latest
```

### Step 2. Launch the container

``` bash
$ hyper run -d --name shadowsocks -p 1989 oddrationale/docker-shadowsocks -s 0.0.0.0 -p 1989 -k MyPassWord -m aes-256-cfb
b6cae93b056ddb123dcb754e785c557bee9b080e4a3a4731f3e1cd97798fe058
```

The container should be running:

``` bash
$ hyper ps
CONTAINER ID        IMAGE                             COMMAND                  CREATED             STATUS              PORTS               NAMES               PUBLIC IP
b6cae93b056d        oddrationale/docker-shadowsocks   "/usr/local/bin/ssser"   23 seconds ago      Up 18 seconds                           shadowsocks         

```

### Step 3. Attach Floating IP

``` bash
$ hyper fip allocate 1
162.221.195.201
$ hyper fip attach 162.221.195.201 shadowsocks
$
```

### Done!

Now, setup your browser and you are ready to go!

Shadowsocks Cient
![](https://trello-attachments.s3.amazonaws.com/5727e1398e6615bcb65e23c4/528x335/8275b47b8cdd1f9c54676cf96c5dfbc4/Screen_Shot_2016-05-02_at_4.21.05_PM.png)

SwitchySharp
![](https://trello-attachments.s3.amazonaws.com/5727e1398e6615bcb65e23c4/917x661/3ebbe51970bc1cdd65b5c4ff365642e3/Screen_Shot_2016-05-02_at_4.21.29_PM.png)

Try it:
![](https://trello-attachments.s3.amazonaws.com/5727e1398e6615bcb65e23c4/1256x814/9fab9f7e3dd73dc29fc85dbd03e0ee12/Screen_Shot_2016-05-02_at_4.25.23_PM.png)
