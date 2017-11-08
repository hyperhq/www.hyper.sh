title: "Deploying a Docker-Based PHP Project with Hyper.sh"
date: 2017-11-08 18:00:00 +0800
author: Karl Hughes
preview: |
  This guest post gives a step-by-step tutorial how to deploy a Docker-based PHP project in Hyper.sh.
  
---

# Deploying a Docker-Based PHP Project with Hyper.sh

> This is a guest blog by one of our customers, Karl Hughes. The original post can be found at [his personal blog](https://www.shiphp.com/blog/2017/deploying-php-hyper-sh).

![](https://i.imgur.com/1T5fFXz.png)

Once you've [built a local PHP application using Docker](/blog/2017/php-web-app-in-docker), you have many options for hosting. One of my favorite tools is [Hyper.sh](https://hyper.sh/), a container-based hosting platform that works for just about any Dockerized project you have including PHP projects. Hyper.sh charges you only for uptime on your containers, so it's a perfect solution for continuous integration environments, development environments, or even production projects. I have successfully hosted [several of my side projects on Hyper.sh for the past few months](https://www.karllhughes.com/posts/hyper-sh-weekend).

Let's dig into the process for building and deploying a simple PHP application to Hyper.sh.

## Building a Dockerized PHP application

In order to demonstrate Hyper.sh's hosting, we'll need to build a simple PHP application. In [a previous tutorial](/blog/2017/php-web-app-in-docker), I showed you how to run a basic PHP web application using Docker and PHP's official Docker image. Here's the PHP code we'll use:
 
_index.php_

```php
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My PHP Website</title>
</head>
<body>
  <h1>My PHP Website</h1>
  <p>Here is some static content.</p>
  <p><?php echo "Here is some dynamic content"; ?></p>
</body>
</html>
```

To run this sample PHP web app locally, run:

```bash
docker run --rm -p 8000:80 -v $(pwd):/var/www/html php:apache
```

And view your website locally at [`localhost:8000`](http://localhost:8000/).

## Pushing our application to Docker Hub

In order to deploy our application, we'll need to push it to a [container registry](https://docs.docker.com/registry/). [Docker Hub](https://hub.docker.com/) is free for open source projects, and it works well with Hyper.sh, so we'll start there.

First, [create an account on Docker Hub](https://hub.docker.com/). You'll also need to log into your Docker Hub account on your local command line by running `docker login` and entering your credentials.

![](https://i.imgur.com/K8ERq0E.png)

Next, we need to build the PHP project by creating a new Docker image. Add a `Dockerfile` to the root of the project:

```
FROM php:apache
COPY index.php /var/www/html/index.php
```

Once you've got the Dockerfile in the root directory with your `index.php` file, build an image from the command line using your Docker Hub username:

```bash
docker build . -t <YOUR_USERNAME>/tiny-php-app
```

Finally, push that image to Docker Hub:

```bash
docker push <YOUR_USERNAME>/tiny-php-app
```

If everything worked, you should see a bunch of hashes followed by stages of your build, and finally a long string with a `size` designation like this: `latest: digest: sha256:035d2fb05c6545823383adf31fa4b4dc947f72f79f68320863051b9ab2b8eb4b size: 1993`. That means that your Docker image was uploaded and is now available on Docker Hub. 

## Deploying to Hyper.sh

Obviously, you will need an account on [Hyper.sh](https://hyper.sh/) to host your project there, but you should also download the [Hyper.sh command line application](https://docs.hyper.sh/GettingStarted/install.html) for this tutorial. Be sure to log into your Hyper.sh account and log into Docker Hub as well by running `hyper login`.

Once you've logged in via the command line, you can go ahead and run your site on Hyper.sh:

```bash
hyper run -d -p 80:80 <YOUR_USERNAME>/tiny-php-app
```

Hyper.sh will automatically pull the latest version of the image and start up a new container, leaving you with the ID in your command line. To ensure the container is running, run `hyper ps` to see a list of your running Hyper.sh containers.
 
While our container is running on Port 80, we haven't assigned a public IP address to the container, so you won't be able to access it from the web. In order to attach an IP address, create one in Hyper.sh:

```bash
hyper fip allocate 1
```

And then attach it to your container:

```bash
hyper fip attach <YOUR_IP> <YOUR_CONTAINER_ID>
```

Your tiny PHP application should now be hosted live on the web at `<YOUR_IP>` address. If you don't see it, you can log into the running container on Hyper.sh just like you would a regular Docker container to debug any issues. [Hyper's CLI](https://docs.hyper.sh/Reference/CLI/index.html) has most of the same commands as Docker's CLI, so the interface should feel quite familiar.

## Updating the Code

Finally, you may want to know how to update your application. First, make a change to the `index.php` file. Next, you will need to rebuild the image, push it to Docker Hub, pull it from Hyper.sh, and re-run the container. In short, you will need to run something like this in your command line:

```bash
docker build . -t <YOUR_USERNAME>/tiny-php-app
docker push <YOUR_USERNAME>/tiny-php-app
hyper pull <YOUR_USERNAME>/tiny-php-app
hyper rm -f <OLD_CONTAINER_ID>
hyper run -d -p 80:80 <YOUR_USERNAME>/tiny-php-app
hyper fip hyper fip attach <YOUR_IP> <NEW_CONTAINER_ID>
```

Your code will now be up to date and the IP address will be attached to the new container.


Feel free to drop us an email [contact@hyper.sh](mailto:contact@hyper.sh), or use the [forum](https://forum.hyper.sh), [Twitter](https://twitter.com/hyper_sh) or in the console support window!
