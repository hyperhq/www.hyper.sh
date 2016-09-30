title: "How To Deploy Jenkins Server"
date: 2016-06-01 21:00:00 +0800
author: hyper
tags:
    - Container
    - Hyper
    - Jenkins
preview: This guide shows how you can launch a full functional Jenkins server in one minute And then configure this Jenkins works with you Github account.

---

[Jenkins](https://jenkins.io/) is the leading open source automation server, Jenkins provides hundreds of plugins to support building, deploying and automating any project.

This tutorial shows you how to deploy Jenkins server in Hyper.sh cloud and integrate it with your Github repo in minutes. Note that we assume that you have installed `hyper` command line tool and had basic knowledge about how to play with Hyper.sh. 

### Pull Jenkins image

First, pull the Jenkins image from docker hub. This is optional because image will be pulled automatically during `hyper run`.

```shell
$ hyper pull jenkins
Using default tag: latest
latest: Pulling from library/jenkins
8b87079b7a06: Pull complete
a3ed95caeb02: Pull complete
...
Digest: sha256:836a89893656996920f91639ee7355da16a67e1d58186f98ef1de8c0251331fb
Status: Downloaded newer image for jenkins:latest
```
Pull completed.

```shell
$ hyper images
REPOSITORY            TAG                 IMAGE ID            CREATED             SIZE
jenkins               latest              73801abb9d9d        3 days ago          710 MB
```

### `hyper run` Jenkins server
Next, create the Jenkins server with a simple `hyper run`:
```
$ hyper run -d --name myjenkins -v /var/jenkins_home jenkins
94241df88c8bcf49f916cc8968a3b27ab4ca0fea55a40d405038409b0e643b79
```

If you have read our previous blogs, you may noticed that we told Hyper.sh to attach a persistent volume to this Jenkins container. This volume will persist the workspace in `/var/jenkins_home`, since all Jenkins data lives in there - including plugins and configurations. It is highly recommended to treat the `jenkins_home` directory as you would a database, and thanks to Hyper.sh volume, you already achieved that.

### Allocate public IP

Finally, allocate a `fip` and bind it with our Jenkins container.

```
$ hyper fip allocate 1
162.221.195.48

$ hyper fip attach 162.221.195.48 myjenkins
```
Great! Now we should be able to  visit the URL `http://162.221.195.48:8080` of the Jenkins server to see if it works.

![](-/images/launch-your-jenkins-server-on-hyper/0.png)

## Conclusion

In the traditional IT environment, deploying and configuring Jenkins is never an easy task. But with Hyper.sh cloud and a pre-built Jenkins container image, you can have it up and running within seconds.  With Hyper.sh cloud,  you can easily standup a production ready Jenkins CI/CD pipeline on the Internet, in under a minute!

## (Additional) Configure the Jenkins to work with your Github account

The magic of Jenkins is that it is designed to work with Github and create a full automation CI/CD work-flow. We would like to show how to set up Jenkins to work with Github step by step.

### Install Jenkins Github plugins
```
Install the follow plugins
GIT plugin
Git client plugin
Git Parameter Plug-In
Git server plugin
Github Authentication plugin
GitHub Pull Request Plugin
GitHub pull requests builder
SCM Sync Configuration Plugin
```

These plugins are all avialable in `http://162.221.195.48:8080/pluginManager/available`.

#### Create a Jenkins project

![](-/images/launch-your-jenkins-server-on-hyper/1.jpg)

Configure the project, add your Github repo into the project. In this post, we use `https://github.com/carmark/myjenkins` as a test repo.

![](-/images/launch-your-jenkins-server-on-hyper/2.jpg)

Configure the Git options of the project.

![](-/images/launch-your-jenkins-server-on-hyper/3.jpg)

Setup build triggers of the project.

![](-/images/launch-your-jenkins-server-on-hyper/4.jpg)

Add build actions for this repo. Then save the project.

![](-/images/launch-your-jenkins-server-on-hyper/5.jpg)

### Configure Jenkins server to use Github

Click **Manage Jenkins** -> **Config System** to set the global configuration.

![](-/images/launch-your-jenkins-server-on-hyper/6.jpg)


### Set GitHub Pull Request Builder

First, we recommend you create GitHub 'bot' user that will be used for communication with GitHub (however you can use your own account if you want).

Go to `Manage Jenkins` -> `Configure System` -> `GitHub pull requests builder` section.

* If you are using Enterprise GitHub set the server api URL in `GitHub server api URL`. Otherwise leave there `https://api.github.com`.
* Make sure you have a GitHub API token or username password can be used for access to the GitHub API
* To setup credentials for a given GitHub Server API URL:
  * Click `Add` next to the `Credentials` drop down
    * For a token select `Kind` -> `Secret text`
      * If you haven’t generated an access token you can generate one in `Test Credentials...`
          * Set your `bot` user’s GitHub username and password (or your own Github account).
          * Press the `Create Access Token` button
          * Jenkins will create a token credential, and give you the id of the newly created credentials. The default description is: `serverAPIUrl + <GitHub auto generated token credentials>`.
        * For username/password us `Kind`->` Username with password`
  * Credentials will automatically be created in the domain given by the `GitHub Server API URL` field.
  * Select the credentials you just created in the drop down.
  * The first fifty characters in the Description are used to differentiate credentials per job, so again use something semi-descriptive
* You can add as many GitHub auth sections as you need, even duplicate server URLs

### Set web hook for your Github project

Now, Jenkins + Github integration is ready. Just add these two hooks into your project.
```
http://162.221.195.48:8080/github-webhook/
http://162.221.195.48:8080/ghprbhook/
```

Now let's create a Pull Request to see if Jenkins can be triggered and run the project CI tasks automatically.

![](-/images/launch-your-jenkins-server-on-hyper/7.jpg)

If the CI passed, you will see Jenkins reports `Everything has passed` on the PR page.

![](-/images/launch-your-jenkins-server-on-hyper/8.jpg)

You can checkout the build details in **Status** part on Jenkins server's dashbord.

![](-/images/launch-your-jenkins-server-on-hyper/9.jpg)

When a new pull request is opened in the project and the author of the pull request isn’t white-listed, builder will ask `"Can one of the admins verify this patch?"`.

You can comment to reply the `bot` on that PR page like this:

* `ok to test` to accept this pull request for testing
* `test this please` for a one time test run
* `add to whitelist` to add the author to the whitelist
If the build fails for other various reasons you can rebuild by replying:
* `retest this please` to start a new build.
