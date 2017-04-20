title: "How to use Hyper.sh and AWS ECR to deploy a Hubot instance for less than $3 a month"
date: 2016-11-18 20:00:00 +0800
author: Pedro Yamada
tags:
    - Container
    - Hyper.sh
    - Hubot
    - AWS ECR

preview: "In this post [Pedro Yamada](https://twitter.com/yamadapc) from [Beijaflor Software](https://beijaflor.io/) explains how to use AWS ECR and Hyper.sh to run a Hubot instance for less than $3 per month."

---

# How to use Hyper.sh and AWS ECR to deploy a Hubot instance for less than $3 a month

*This is a translation from a Portuguese [blog post](https://t.co/TWuSSORp7h) by [Pedro Yamada](https://twitter.com/yamadapc) from [Beijaflor Software](https://beijaflor.io/).*

This week, I wanted to deploy a small [Hubot](https://hubot.github.com/) instance for Beijaflor Software, spending as little as possible and having a system that deploys easily and without maintenance. I decided to test the new container hosting service [Hyper.sh](https://hyper.sh/) that purports to provide *"Clusterless Docker Hosting."*

I will walk through the steps I used to create this deployment quickly.

## 1. Creating the Hubot

To create the Hubot bot, we'll just need to use its scaffolder and add environment variables with credentials for the chat service of our choice.

```
$ npm install -g yo-generator hubot
$ mkdir SuperBot && cd SuperBot
$ yo hubot
# Answer some questions
```

## 2. Dockerizing Hubot

Dockerizing Hubot is just like dockerizing any other Node.js app. We start with a Node.js image, install the dependencies and then add the application code. My Dockerfile looks like this:

```
from mhart/alpine-node:6
maintainer Peter Tacla Yamada <tacla.yamada@gmail.com>
add ./package.json /app/package.json
workdir /app
run npm install
add . /app
cmd npm start
```

We can then run the container locally to make sure everything is ok:

```
$ docker build -t SuperBot:latest .
$ docker run \
  -e HUBOT_SLACK_TOKEN = "$HUBOT_SLACK_TOKEN" \
  superBot:latest
```

## 3. Uploading image for ECR AWS

The AWS ECR is a "Docker Registry" as a service that stores Docker images in the AWS cloud. Some of its advantages over the equivalent service provided by the company behind the Docker, Docker Hub, are:

1. It runs on the AWS Cloud (so it should have low latency & has credentials managed by IAM if your infrastructure is already running on AWS)
2. It has a "Pay per Use" pricing model instead of a per-private repository model. (Docker Hub costs around $1/month for each repository, while AWS ECR costs around $ 0.10/month per GB of storage plus network transfer costs)

To use ECR, we need to create a repository for our app's images and login to the registry. We can do this through the AWS GUI, or using the AWS CLI:

```
$ aws create-ecr-repository --repository-name superbot
$ eval $(aws ecr get-login)
```

The second command is required because the ECR credentials are dynamic; essentially ```aws ecr get-login``` outputs a docker login command, which we tell the shell to execute.

With our repository set-up, we can now tag our image and push it:

```
$ docker superbot tag:latest this-was-printed-when-we-created-the-repository.dkr.ecr.us-east-1.amazonaws.com/superbot:latest
$ docker push this-was-printed-when-we-created-the-repository.dkr.ecr.us-east-1.amazonaws.com/superbot:latest
```

## 4. Deploying the bot using Hyper.sh

First install the Hyper.sh CLI following these instructions. In order for Hyper to pull the image from ECR, we need log-in again to the registry using the Hyper CLI. Hyper's CLI uses the same command structure as Docker's, so my solution was:

```
$ eval $(aws ecr get-login | sed 's/docker/hyper')
```

We take the output that the AWS CLI command generates and replace “docker” with “hyper” using ```sed```.

Now all we need to do is:

```
$ hyper run \
    -e HUBOT_SLACK_TOKEN=”$HUBOT_SLACK_TOKEN” \
    --size s3 \
    -d \
    --name beijaflor-bot \
    this-was-printed-when-we-created-the-repository.dkr.ecr.us-east-1.amazonaws.com/superbot:latest
```

Now our bot is running in the cloud using the “S3" container type which costs:

- $2.59 / month
- $0.0036 / hour
- $0.000001 / second
- 256MB RAM, 10GB disk and a virtual CPU
There's more information on that here: [https://www.hyper.sh/pricing.html](https://www.hyper.sh/pricing.html)

Considering AWS ECR costs for storing our image, which is only 76.2MB due to using Alpine as the base, the total approximate cost should be around $2.59762/month.

## That's it!

[Hyper.sh](http://hyper.sh/) seems to be a really well-implemented service with very competitive pricing, despite only currently being available on a zone in LA. _(Note: NYC and EU data centers are expected in Q1 2017)_

It'd be interesting to think further about how its model could be used to build things like on-demand continuous integration, which judging from the website is something that Hyper.sh are already busy with.

Thanks a lot and see you next time.

### About the author

Pedro is a Software Engineer and Founder at [Beijaflor Software](https://beijaflor.io/). He's passionate about open-source and software development, having spent his career working "full-stack" on diverse products for the web like [toggl.com](https://toggl.com/). He is currently trying to make Beijaflor Software a reference software development services provider in Brazil, growing its young but ambitious ventures.

Beijaflor Software is a young software development and consultancy company based in São Paulo focused on large-scale engineering for the web. We make use of JavaScript and Functional Programming to continuously deliver world-class results in a predictable manner, with technologies like Node.js, React.js and Haskell. Our goal is to make art through great software products, while building a healthy workplace where creativity can flourish and creators can own their work.
