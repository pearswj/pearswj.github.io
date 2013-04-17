---
layout: post
title: SSH config
tags: linux, ssh
---


> [...] However, there’s a much more elegant and flexible solution to this problem. Enter the SSH config file:
>
> ```bash
> # contents of $HOME/.ssh/config
> Host dev
>     HostName dev.example.com
>     Port 22000
>     User fooey
> ```
>
> This means that I can simply `$ ssh dev`, and the options will be read from the configuration file. Easy peasy.

(via [Joël Perras](http://nerderati.com/2011/03/simplify-your-life-with-an-ssh-config-file/))

For me this means easy remote access to Git repositories on my home server (such as the one for this website) for which I use a custom SSH port. Previously I was forced to use the full URI in order to specify this port:

```bash
git clone ssh://<user>@<host>:<port>/<repository>.git
```

However, with a simple entry to my `~/.ssh/config`:

```bash
Host <host>
    Port <port>
```

I can now use the following address, omitting the custom port entirely:

```bash
git clone <user>@<host>:<repository>.git
```
