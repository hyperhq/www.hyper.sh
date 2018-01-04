title: "Automate your DevOps environment with Hyper.sh and a Yubikey"
date: 2018-01-04 11:28:00 +0800
author: Hilton De Meillontags:
    - Containers
    - Security
    - DevOps
    - Save Money
    - Osquery
preview: In this guest article, Hilton shows us his Python script  that uses osquery to automate his DevOps workstation when he plugs in his yubikey.

---
[Hyper.sh](hyper.sh) containers make a great devops workstation for a number of reasons:

1. You can shut them down when not in use which saves money and also reduces the attack surface.
2. Hyper.sh containers have a private Layer 2 segment which can be fire-walled using [security groups](https://docs.hyper.sh/Feature/network/sg.html) and which are not shared with other customers.
3. Hyper containers have better isolation than Docker containers (hardware isolation, just like a VM)

However starting your devops workstation every time you start the day is painful, that is why I created a little python script that uses osquery to start up my workstation when I plug in my yubikey.

## Requirements
1. Osquery (not sure if you just need the python module or the binary as I have both)
2. Python (tested on 2.7)
3. A Yubikey, however you can change the script to use any USB device

## Getting started
Install dependencies (OSX)
``` bash
sudo pip install osquery --ignore-installed six
```

Download hyper_saver from [Github](https://github.com/hilt86/hyper_saver)
``` bash
git clone https://github.com/hilt86/hyper_saver.git
```

hyper_saver takes two arguments :
``` bash
> hyper_saver.py containerName fipName
```
*Where containerName is the name you have given your Hyper.sh container and the fipName is the name given to your floating IP!*

As long as hyper_saver is running and your Yubikey is inserted to your computer’s USB port your container will run, and not run when you are not at your computer!

```
Container : running ||| Yubikey : inserted
```
