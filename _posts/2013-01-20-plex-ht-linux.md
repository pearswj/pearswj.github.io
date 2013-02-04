---
layout: post
title: Building Plex Home Theatre on Arch Linux (Intel Atom 330)
published: true
---

*Updated 25/01/2013: ffmpeg workaround no longer necessary.*  
*Updated 04/02/2013: libcec workaround no longer necessary.*


After reading [this post](http://forums.plexapp.com/index.php/topic/54497-build-plexht-from-source/) (PlexPass required) I thought I'd have a go building PlexHT on my Arch box (despite having just tweaked [pyplex to use mplayer](https://github.com/pearswj/pyplex/tree/mplayer) -- the perfect interfaceless setup). It's worth mentioning that I had PMC running previously so the majority of dependencies were already dealt with. In my experience, installing xbmc first usually takes care of this! You will also need to have an [X window system](https://wiki.archlinux.org/index.php/Xorg) installed.

[This post](http://forums.plexapp.com/index.php/topic/57397-build-plex-home-theater-on-debian-wheezy/) is also worth a quick read before getting started.


Starting in a fresh directory, I grabbed the Plex Home Theatre source:

``` bash
git clone git@github.com:plexinc/plex-home-theater-public.git source
```

Next, I created a 'build' directory and ran cmake from inside it:

``` bash
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_INSTALL_PREFIX=/opt/plexhometheater ../source
```

A number of dependencies were highlighted at this stage. I installed the following packages via pacman and re-ran cmake.

* libplist
* libshairport
* libcec

Now to start the build:

``` bash
make -j2
```

~~The first error that popped up revealed an issue with the ffmpeg implementation.~~ *Fixed in [fa31770c8c](https://github.com/plexinc/plex-home-theater-public/commit/fa31770c8ced06acdf2b9898d73332944b7a7a74).*


~~After restarting the build, the second error that I received pointed to the file: *xbmc/peripherals/devices/PeripheralCecAdapter.cpp*.~~ *The [libcec](https://www.archlinux.org/packages/community/x86_64/libcec/) package is now up-to-date -- problem solved.*


Now you can install PlexHT: 

``` bash
sudo make install
```

Before running PlexHT, first ensure that you have an X server running and that plex will be able to find the necessary XBMC data files:

``` bash
nohup startx & # start an X session and background it
export XBMC_HOME=/opt/plexhometheater/share/XBMC # add to ~/.bashrc
```

You can now run PlexHT:

``` bash
/opt/plexhometheater/bin/plexhometheater
```

I'm currently having some issues controlling PlexHT via iOS/HTTP API but aside from that it's playing media like a beaut!
