---
layout: post
title: Building Plex Home Theatre on Arch Linux (Intel Atom 330)
published: true
---

After reading [this post](http://forums.plexapp.com/index.php/topic/54497-build-plexht-from-source/) (PlexPass required) I thought I'd have a go building PlexHT on my Arch box (despite having just tweaked [pyplex to use mplayer](https://github.com/pearswj/pyplex/tree/mplayer) -- the perfect interfaceless setup). It's worth mentioning that I had PMC running previously so the majority of dependencies were already dealt with. In my experience, installing xbmc first usually takes care of this!

You will also need to have an [X window system](https://wiki.archlinux.org/index.php/Xorg) installed.

The Plex Home Theatre source is available at [Github](https://github.com/plexinc/plex-home-theater-public).

Following the advice given in [this post](http://forums.plexapp.com/index.php/topic/57397-build-plex-home-theater-on-debian-wheezy/) I created the following directory structure:

* PlexHT
	* source
	* build

Next run cmake:

``` bash
cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_INSTALL_PREFIX=/opt/plexhometheater ../source
```

A number of dependencies were highlighted at this stage. Install the following packages via pacman and re-run cmake.

* libplist
* libshairport
* libcec

Now the start the build:

``` bash
make -j2
```

~~The first error that popped up revealed an issue with the ffmpeg implementation.~~ *Fixed in [fa31770c8c](https://github.com/plexinc/plex-home-theater-public/commit/fa31770c8ced06acdf2b9898d73332944b7a7a74).*


~~After restarting the build,~~ The second error that I received pointed to the file: *xbmc/peripherals/devices/PeripheralCecAdapter.cpp*.

Again I plugged the error message into Google and found and old [pull request](https://github.com/Pulse-Eight/libcec/pull/46) in the libcec repository. Seeing that this bug had been fixed I checked the version of libcec in the Arch repos and discovered that it is out-of-date. I installed [libcec-git](https://aur.archlinux.org/packages/libcec-git/) from AUR instead.


Once again continue the build and it should complete without any further errors. Now you can install PlexHT: 

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
