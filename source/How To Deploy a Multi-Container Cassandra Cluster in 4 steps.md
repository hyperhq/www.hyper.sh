title: "How To Deploy a Multi-Container Cassandra Cluster in 4 steps"
date: 2016-05-26 11:00:00 +0800
author: hyper
preview: |
In this tutorial, we will show how in 4 steps you can bring up:

- A five-node  [Cassandra](http://cassandra.apache.org/) cluster (DataStax OpsCenter 5.0.0)
- All the necessary wiring
- Each node runs in its own container with the Cassandra process + DataStax Agent while OpsCenter runs in its own container separate from the cluster.

---

### Intro

Cassandra is a distributed NoSQL database system designed to handle large amounts of data across many commodity servers, providing high availability with no single point of failure. Cassandra offers robust support for clusters spanning multiple nodes, with asynchronous masterless replication allowing low latency operations for all clients.

In this tutorial, we will show how in 4 steps you can bring up:

- A five-node  [Cassandra](http://cassandra.apache.org/) cluster in Hyper_ DataStax OpsCenter 5.0.0
- All the necessary wiring
- Each node runs in its own container with the Cassandra process + DataStax Agent while OpsCenter runs in its own container separate from the cluster.

### Prerequisites
Before beginning this tutorial please make sure you complete the following steps:

- [Open a Hyper_ account](https://console.hyper.sh/register)
- [Generate API credential](https://docs.hyper.sh/GettingStarted/generate_api_credential.html)
- [Setup `hyper` CLI on your local computer](https://docs.hyper.sh/GettingStarted/install.html)

### Step 1. Pull the Cassandra image to your Hyper_ account

``` bash
[root@localhost]$ hyper pull abh1nav/cassandra
Using default tag: latest
latest: Pulling from abh1nav/cassandra
a3ed95caeb02: Pull complete
25ba68b6bd1f: Pull complete
d2ff49536f4d: Pull complete
bd46d7d79df0: Pull complete
f94adccdbb9c: Pull complete
c35e39213992: Pull complete
e2e46e3d91f7: Pull complete
a205dfad608b: Pull complete
fae9a8ba0177: Pull complete
dff3ac236173: Pull complete
9d8be4ab0107: Pull complete
9ef8fe02c033: Pull complete
281ca3084805: Pull complete
f7e6b7a91cc1: Pull complete
b6cb6c8801d6: Pull complete
91e1f36ba8fc: Pull complete
Digest: sha256:37c1fb841ef456ec0d17a34f031f86420080bd2cc64f875416e62dc674e2f985
Status: Image is up to date for abh1nav/cassandra:latest
```

### (Optional) Step 2. Create persistent volumes
For each container, we will create two separate volumes for data and commit logs.

``` bash
[root@localhost]$ for id in {1..5}; do
>   echo "Creating data volume data$id"
>   hyper volume create --size 50 --name data$id
>   sleep 1
>   echo "Creating commitlog volume log$id"
>   hyper volume create --size 50 --name log$id
>   sleep 1
> done
Creating data volume data1
data1
Creating commitlog volume log1
log1
Creating data volume data2
data2
Creating commitlog volume log2
log2
Creating data volume data3
data3
Creating commitlog volume log3
log3
Creating data volume data4
data4
Creating commitlog volume log4
log4
Creating data volume data5
data5
Creating commitlog volume log5
log5
```

### Step 3. Launch the seed container

``` bash
[root@localhost]$ hyper run -d --name node1 --size=s -v data1:/opt/cassandra/data -v log1:/opt/cassandra/commitlog/ abh1nav/cassandra
a558f0a06aaea2409306efd660a40744406545429ead771ffbf0a9322699652f
[root@localhost]$ SEED=$(hyper inspect -f '{{ .NetworkSettings.IPAddress }}' node1); echo $SEED
172.16.0.176
```
> **NOTE**:
> - Use the small container size (1GB Mem), `--size=s`. If less than that, Cassandra will quit due to OOM
> - Mount two volumes `data1` and `log1` under `/opt/cassandra/data` and `/opt/cassandra/commitlog`
> - Grab the seed container's IP address `$SEED`

After logging into the container, you should be able to see the mounted volumes:

``` bash
[root@localhost]$ hyper exec -it node1 /bin/bash
root@d0613d11690c:/# df
Filesystem     1K-blocks   Used Available Use% Mounted on
/dev/sda        10190100 910812   8738616  10% /
devtmpfs          252088      0    252088   0% /dev
tmpfs             515704      0    515704   0% /dev/shm
rootfs            252088   5416    246672   3% /lib/modules/4.4.7-hyper
/dev/sdb        10190100  37224   9612204   1% /opt/cassandra/data
/dev/sdc        51474912  53984  48783104   1% /opt/cassandra/commitlog
share_dir           1024      4      1020   1% /etc/hosts
rootfs            252088   5416    246672   3% /etc/resolv.conf
```

### Step 4. Add more containers to the cluster

``` bash
[root@locahost]$ for id in {2..5}; do
>   echo "Starting node$id"
>   hyper run -d --name node$id --size=s -e SEED=$SEED -v data$id:/opt/cassandra/data  -v log$id:/opt/cassandra/commitlog abh1nav/cassandra
>   sleep 1
> done
Starting node2
02ec53de7f437e5577e2e347376f9c5d36c006b1a9f4a30ad7902c7b0eba5250
Starting node3
af6cd8e2e00f52783aaaa8ab2f9c5f5915897c822bc8785d0aced28a98fe6b05
Starting node4
3c699d7fd3c7550f1daffbbf9ce7fa122c3f8fa3d8d6ed160339f93a46197b5a
Starting node5
9771e643aae65b7184cb45fa1ea1e43c9b75ea1c78af382062b53bc36b8c7754
```

> **NOTE:**
> - Pass the seed container IP address to other containers in order to join the cluster

### Done!
Now, let's login to one of the containers to check the cluster status.

``` bash
[root@localhost]$ hyper exec -it node1 /bin/bash
root@d0613d11690c:/# /opt/cassandra/bin/nodetool status
Datacenter: datacenter1
=======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address       Load       Tokens  Owns (effective)  Host ID                               Rack
UN  172.16.0.178  52.08 KB   256     40.7%             bd80e8a5-ff7b-4cf4-a490-1f52895cbb39  rack1
UN  172.16.0.179  66.44 KB   256     38.2%             292288c7-22e5-4565-a702-6d82974fe6b5  rack1
UN  172.16.0.180  119.03 KB  256     39.6%             96377d3e-2b6e-41fa-a1ea-62f1db5deb42  rack1
UN  172.16.0.181  126.48 KB  256     41.6%             8b35f98f-d57e-4a74-84d7-fa164f945260  rack1
UN  172.16.0.182  83.08 KB   256     39.8%             97210969-d24b-4398-9b85-efad5670bb25  rack1

root@d0613d11690c:/# exit
exit
```

Questions? [contact@hyper.sh](mailto:contact@hyper.sh)
