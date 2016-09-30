title: "How To Network Containers"
date: 2016-05-11 21:00:00 +0800
author: hyper
tags:
    - Container
    - Hyper
    - Network
preview: This guide we will teach you how to network your containers on Hyper.sh to set up your microservices.

---

# Container Networking on Hyper.sh cloud

You just previously succeeded in building and running a simple web application in the last blog of this series, but that's not enough for real web service on the Internet. So, in this section we will teach you how to network your containers on Hyper.sh to set up your microservices.

## Name your container

You've already seen that each container you create has an automatically generated name. Actually, you can also name containers yourself. This naming provides two useful functions:

*  That makes it easier for you to remember them, for example naming a  container running a web application `web`.

*  Naming of containers makes it easier for referencing of containers. There are several commands (like `--link`) that support this and you'll use one in an exercise later.

You name your container by using the `--name` flag, for example launch a new container called web:

    $ hyper run -d --name web training/webapp python app.py

Use the `hyper ps` command to check the name:

```shell
$ hyper ps -l
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                    NAMES               PUBLIC IP
d54e6f546795        training/webapp     "python app.py"     11 seconds ago      Up 5 seconds        0.0.0.0:5000->5000/tcp   web   
```

Container names must be unique. That means you can only call one container `web`. If you want to re-use a container name you must delete the old container.

Note that container name is not its hostname, Hyper.sh container uses container ID as default hostname, and you can also configure your own by using `hyper run --hostname`:

```
-h, --hostname                  Container host name
```


## Manage the public network of your container

You may have noticed that containers in Hyper.sh have their own private IP as long as they are created. Hyper.sh cloud makes the networking transparent for the end user, by using mature SDN component to build VLAN based tenants.

Hyper.sh also provides a public network solution, named floating IP, for you to connect containers from outside world., in which the basic usage of  `hyper fip allocate` was showcased in the ["Run web application"](https://blog.hyper.sh/learn-Hyper.sh-by-examples-run-your-application.html) blog.

```
$ hyper fip --help

Usage:  hyper fip [OPTIONS] COMMAND [OPTIONS]

Commands:
  allocate             	Allocate a or some IPs
  attach    			Attach floating IP to container
  detach	            Detach floating IP from conainer
  ls                    List all floating IPs
  release               Release a floating IP
```

In Hyper.sh, floating IP is a top level resource, that means you can manage it independently from the containers and other resources.

Let's create and list them:
```
$ hyper fip allocate 2
$ hyper fip ls
Floating IP         Container
162.221.195.205
162.221.195.206      
```

* `2` is the number of floating IPs you want to create, we created two IP addresses in this example

Then you can attach the IP address with a container.

```
$ hyper fip attach 162.221.195.205 web
```
Done! Now you can reach you app through `162.221.195.205:5000`.
```
$ hyper fip ls
Floating IP         Container
162.221.195.205     d54e6f5467954e510026d7d2a0c0d602c0de1f0fd4443c6d7c3adea2bd064120
```

You can disconnect a container by detaching the floating IP. To do this, you just need to supply the container name or container id.

    $ hyper fip detach web
    162.221.195.205

As you can disconnect a container from a public network, you can also delete the  floating IP to free this network resource.

```
$ hyper fip release 162.221.195.205
```

## Link containers in Hyper.sh cloud
The Docker style link in Hyper.sh allow containers to discover each other and securely transfer information about one container to another container. When containers are linked, information about a source container can be sent to a recipient container. This allows the recipient to see selected data describing aspects of the source container.

To establish links, Hyper.sh relies on the names of your containers. We have emphasized the importance of naming in previous article, and we'll soon see the reason.

To create a link, we use the `--link` flag. First, let's create a new container, this time one containing a database.
```
$ hyper run -d --name db training/postgres
e6f54bab6efe2308717fafbbcd42fb3f313a1169dd098c23b1723fd906b60c69
```

This creates a new container called `db` from the `training/postgres` image, which contains a PostgreSQL database.

Now, you need to delete the web container you created previously, so you can replace it with a linked one:

```
$ hyper rm -f web
```
Now, create a new web container and link it with your db container.
```
$ hyper run -d --name web --link db:db training/webapp python app.py
652ee84d7f8854212c064a4af4d59927ab945f9128b17a2fee70047f8f3f263b
```

This will link the new web container with the db container you created earlier. The `--link` flag syntax is:
```
--link <name or id>:alias
```
Where name is the name of the container we’re linking to and alias is an alias for the link name. You’ll see how that alias gets used shortly. The `--link` flag can also use the syntax:
```
--link <name or id>
```

In which case the alias will match the name. You could have written the previous example as:
```
$ hyper run -d --name web --link db training/webapp python app.py
```

Next, inspect your linked containers with `hyper inspect`:
```
$ hyper inspect -f "{{ .HostConfig.Links }}" web
[db:db]
```

You can see that the web container is now linked to the db container `db`. Which allows it to access information about the `db` container.

Then how to consume the `link`? Hyper.sh exposes connectivity information for the source container to the recipient container in two ways:

* Environment variables,
* Names in the `/etc/hosts` file.

### Environment variables
Containers in Hyper.sh creates several environment variables when you link containers. These environment variables in the target container (`web` container) are created based on the `--link` parameters. It will also expose all environment variables originating from the source container (`db` container) including:

* the `ENV` commands in the source container’s Dockerfile
* the `-e` or `--env` options on the `hyper run` command when the source container is started

These environment variables enable programmatic discovery from within the target container of information related to the source container.

> **WARNING:**
> Don't abuse environments! All environment variables originating from Hyper.sh within a container are made available to any container that links to it. This could have serious security implications if sensitive data is stored in them.

Hyper.sh sets an `<alias>_NAME` environment variable for each target container listed in the `--link` parameter. This is a Docker compatible environment system. For example, if a new container called `web` is linked to a database container called `db` via `--link db:webdb`, then Hyper.sh creates a `WEBDB_NAME=webdb` variable in the `web` container.

Hyper.sh also defines a set of environment variables for each port exposed by the source container. Each variable has a unique prefix in the form:

`<name>_PORT_<port>_<protocol>`

The components in this prefix are:

* the alias `<name>` specified in the `--link` parameter (for example, `webdb`)
* the `<port>` number exposed
* a `<protocol>` which is either TCP or UDP

Hyper.sh uses this prefix format to define three distinct environment variables:

* The `prefix_ADDR` variable contains the IP Address from the URL, for example `WEBDB_PORT_5432_TCP_ADDR=172.16.0.142`.
* The `prefix_PORT` variable contains just the port number from the URL for example `WEBDB_PORT_5432_TCP_PORT=5432`.
* The `prefix_PROTO` variable contains just the protocol from the URL for example `WEBDB_PORT_5432_TCP_PROTO=tcp`.

If the container exposes multiple ports, an environment variable set is defined for each one. For example, if a container exposes 4 ports that Hyper.sh creates 12 environment variables, 3 for each port.

Additionally, Hyper.sh creates an environment variable called `<alias>_PORT`. This variable contains the URL of the source container’s **first exposed port**. The ‘first’ port is defined as the exposed port with the lowest number.

For example, consider the `WEBDB_PORT=tcp://172.16.0.1422:5432` variable. If that port is used for both tcp and udp, then the tcp one is specified.

Finally, as we mentioned before, Hyper.sh also exposes each originated environment variable from the source container as an environment variable in the target. For each variable Hyper creates an `<alias>_ENV_<name>` variable in the target container. The variable’s value is set to the value Hyper.sh used when it started the source container.

Back to our database example, you can run the env command to list the specified container’s environment variables.
```shell
$ hyper run --rm --name web2 --link db:db training/webapp env
HOME=/root
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=0c1de13016d1
DB_PORT_5432_TCP_ADDR=172.16.0.137
DB_PORT_5432_TCP_PORT=5432
DB_PORT_5432_TCP_PROTO=tcp
DB_ENV_PG_VERSION=9.3
DB_NAME=db
DB_PORT=tcp://172.16.0.137:5432
DB_PORT_5432_TCP=tcp://172.16.0.137:5432
```
Each variable coming from the source container is prefixed with `DB_`, which is populated from the alias you specified above. You can use these environment variables to configure your applications to connect to the database on the db container.

> **NOTE:**
> `--link` works everywhere in Hyper.sh cloud. Unlike Docker legacy `--link`, software defined network in Hyper.sh guarantee the container connectivity within the same tenant. Users should never need to care things like cross-host or customized network.

However, IP addresses stored in the environment variables are not automatically updated if the source container is restarted. And these environment variables are only set for the first process in the container. Some daemons, such as `sshd`, will scrub them when spawning shells for connection.

We recommend using the host entries in `/etc/hosts` to resolve the IP address of linked containers in production.

##Updating the `/etc/hosts` file
In addition to the environment variables, Hyper.sh adds a host entry for the source container to the `/etc/hosts` file. Here’s an entry for the web container:

```shell
$ hyper run -t -i --rm --link db:webdb training/webapp /bin/bash
root@07c4b5c0305b:/opt/webapp# cat /etc/hosts
127.0.0.1 localhost
...
172.16.0.137  webdb
root@07c4b5c0305b:/opt/webapp#
```

You can see an entry uses the link alias `webdb` to reference the IP address of the `db` container. You can ping that host now via any of these entries:

```shell
root@07c4b5c0305b:/opt/webapp# ping webdb
PING webdb (172.16.0.137) 56(84) bytes of data.
64 bytes from webdb (172.16.0.137): icmp_seq=1 ttl=64 time=2.64 ms
64 bytes from webdb (172.16.0.137): icmp_seq=2 ttl=64 time=1.10 ms
64 bytes from webdb (172.16.0.137): icmp_seq=3 ttl=64 time=1.03 ms
```
Here, you used the ping command to ping the `db` container using its host entry, which resolves to `172.16.0.137`. You can use this host entry to configure an application to make use of your `db` container.

> **Note:**
> You can link multiple recipient containers to a single source. For example, you could have multiple (differently named) web containers attached to your `db` container.

When you restart the source container (`db` container), Hyper.sh will make sure it's **IP address will not change**, allowing linked communication to continue.


## Best Practice

As you can see above, Hyper.sh cloud networking is simple but useful, it avoids boring users and try to free their creativity to compose micro-services as they wish. For better usage of this networking model, some best practices are recommended here.

* Always naming your containers. Hyper.sh `--link` uses names to identify related containers, and renaming containers afterward is costly.
* Do not abuse floating IP. For security reason, and for resource saving reason.
* Expose service ports in your Dockerfile. This is not required by Hyper.sh, but this will bring you more automation, since only exposed ports will be added to target containers' ENV.

A nice example to show these best practice is [`dockercloud/harpoxy`](https://github.com/docker/dockercloud-haproxy) image from Docker Inc.

```
$ hyper run -d --name web-1 hyperhq/webapp:host python app.py
$ hyper run -d --name web-2 hyperhq/webapp:host python app.py
$ hyper run -d --name lb --link web-1 --link web-2 dockercloud/haproxy
$ FIP=$(hyper fip allocate 1)
$ hyper fip attach $FIP lb
$ curl $FIP:80
> Hello my host name is: de380811142a
$ curl $FIP:80
> Hello my host name is: 32d28908d30a
```
Exposed ports from `web-1` and `web-2` are added into the HAproxy container as ENV automatically. And these ENVs are tagged by container names as we mentioned in this article. So for HAproxy, consuming `WEB-1_PORT` and `WEB-2_PORT` is enough.

