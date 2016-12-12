title: "How To Load Balancing Between Containers"
date: 2016-05-05 17:00:00 +0100
author: hyper
preview: This guides shows how to load balancing between two containers.

---

Load balancing is the most common use cases of container. This guides shows how to load balancing between two containers.


![](https://trello-attachments.s3.amazonaws.com/57722f6db6fad32f2b9329f8/329x158/9019c2e1961ee81ca6ef778b2f2aba4b/upload_6_28_2016_at_4_27_51_PM.png)

#### How do I do it?
Simple enough; deploy two web containers, and a HAProxy container pointing to the two web containers with its port 80 exposed, attach a floating IP on the proxy container and done!

``` bash
$ hyper run -d --name web-1 hyperhq/webapp:host python app.py
$ hyper run -d --name web-2 hyperhq/webapp:host python app.py
$ hyper run -d --name lb --link web-1 --link web-2 -P dockercloud/haproxy
$ FIP=$(hyper fip allocate 1)
$ hyper fip attach $FIP lb
$ curl $FIP:80
> Hello my host name is: de380811142a
$ curl $FIP:80
> Hello my host name is: 32d28908d30a
```

Questions? Drop us a mail at [contact@hyper.sh](mailto:contact@hyper.sh).
