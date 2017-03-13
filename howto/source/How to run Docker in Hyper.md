title: "How To Run Docker in Hyper.sh"
date: 2017-03-13 18:00:00 +0800
author: hyper
preview: |
  This tutorial is a walk-through to setup Docker daemon, and launch Docker containers inside of a Hyper container.
  
---

# How to run Docker in Hyper.sh

Lately we received a lot of requests of **How to run Docker in Hyper.sh**. This tutorial is a walk-through to setup Docker daemon, and launch Docker containers inside of a Hyper container.

---

### Ubuntu 16.04
``` bash
$ ID=`hyper run -d ubuntu:16.04`                    # launch a Ubuntu container
$ hyper exec -it ${ID} /bin/bash                    # get the shell access
# apt-get update                                    
# apt-get install docker.io cgroup-lite screen -y   # install deps
# cgroups-mount                                     # mount cgroup
# screen -dmS docker_daemon dockerd -D              # Do NOT use `service docker start`
# docker info                                       # if this works, you are all set
```

### CentOS 7.0
``` bash
$ ID=`hyper run -d centos:7`
$ hyper exec -it ${ID} /bin/bash
# yum install libcgroup e2fsprogs iptables screen docker -y
# mkdir -p /cgroup/memory && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,memory cgroup /cgroup/memory
# mkdir -p /cgroup/cpuset && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,cpuset cgroup /cgroup/cpuset
# mkdir -p /cgroup/cpu,cpuacct && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,cpu,cpuacct cgroup /cgroup/cpu,cpuacct
# mkdir -p /cgroup/net_cls,net_prio && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,net_cls,net_prio cgroup /cgroup/net_cls,net_prio
# mkdir -p /cgroup/blkio && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,blkio cgroup /cgroup/blkio
# mkdir -p /cgroup/freezer && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,freezer cgroup /cgroup/freezer
# mkdir -p /cgroup/perf_event && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,perf_event cgroup /cgroup/perf_event
# mkdir -p /cgroup/devices && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,devices cgroup /cgroup/devices
# mkdir -p /cgroup/pids && mount -t cgroup -o rw,nosuid,nodev,noexec,relatime,pids cgroup /cgroup/pids
# screen -dmS docker_daemon /usr/bin/dockerd-current \
          --add-runtime docker-runc=/usr/libexec/docker/docker-runc-current \
          --default-runtime=docker-runc \
          --userland-proxy-path=/usr/libexec/docker/docker-proxy-current
# docker info
```

### Prebaked Docker Images!
 
Check out our repository on Docker hub: https://hub.docker.com/r/hyperhq/docker-in-hyper/ for the prebaked images. Use the following tags:
- hyperhq/docker-in-hyper:ubuntu-16.04
- hyperhq/docker-in-hyper:centos7 (`latest`)

#### Usage
``` bash
$ hyper run -d -P hyperhq/docker-in-hyper
8dcb2ab017eb4603ae1d9a92ffc68e5cf0edec63e780f9180228eabfce47e028
$ hyper ps
CONTAINER ID        IMAGE                          COMMAND                  CREATED             STATUS              PORTS                                      NAMES                   PUBLIC IP
8dcb2ab017eb        hyperhq/docker-in-hyper   "/entrypoint.sh /bin/"   1 minutes ago       Up 1 minutes        0.0.0.0:2375->2375/tcp                     clever-shirley
$ hyper exec -it 8dcb2ab01 /bin/bash
[root@8dcb2ab017eb /]# docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
```

Questions? [contact@hyper.sh](mailto:contact@hyper.sh)
