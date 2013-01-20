---
layout: post
title: Building Plex Home Theatre on Arch Linux (Intel Atom 330)
published: false
---

After reading [this post](http://forums.plexapp.com/index.php/topic/54497-build-plexht-from-source/) I thought I'd have a go building PlexHT on my Arch box (despite having just tweaked [pyplex to use mplayer](https://github.com/pearswj/pyplex/tree/mplayer) -- the perfect interfaceless setup). It's worth mentioning that I had PMC running previously so the majority of dependencies were already dealt with. In my experience, installing xbmc first usually takes care of this!

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

Here's the first error that I found, revealing an issue with ffmpeg:

>/home/will/tmp/PlexHT/source/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp: In member function ‘virtual int CDVDDemuxFFmpeg::GetStreamBitrate()’:
>/home/will/tmp/PlexHT/source/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp:1376:73: error: ‘AVFormatContext’ has no member named ‘file_size’
>/home/will/tmp/PlexHT/source/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp:1379:49: error: ‘AVFormatContext’ has no member named ‘file_size’

A quick Google revealed [this patch from VideoLAN](http://git.videolan.org/gitweb.cgi/ffmpeg.git/?p=ffmpeg.git;a=blobdiff;f=avprobe.c;h=4d2ed67606f7cedc1b9b2ef19f8711b8b09fa11a;hp=de9657b7e37b020ed2b88a49e1498c9f9a4dc7b9;hb=136ee32da3c728fb4e3490393efb947cc7c4e898;hpb=44bcab5883fcfdc9e9b1cc5315e994fd33391deb) demonstrating the use of `avio_size()` instead of deprecated `AVFormatContext.file_size`. See the changes I made below:

``` diff
diff --git a/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp b/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp
index 9b57b2b..7bd92e9 100644
--- a/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp
+++ b/xbmc/cores/dvdplayer/DVDDemuxers/DVDDemuxFFmpeg.cpp
@@ -1373,10 +1373,10 @@ int CDVDDemuxFFmpeg::GetStreamBitrate()
       missingStreamInfo = true;
   }
 
-  if (overallBitrate == 0 && aggregateBitrate == 0 && m_pFormatContext->file_size > 0 && m_pFormatContext->duration != (uint32_t)AV_NOPTS_VALUE)
+  if (overallBitrate == 0 && aggregateBitrate == 0 && avio_size(m_pFormatContext->pb) > 0 && m_pFormatContext->duration != (uint32_t)AV_NOPTS_VALUE)
   {
     int64_t seconds = m_pFormatContext->duration / AV_TIME_BASE;
-    int bitsPerSecond = (int)(m_pFormatContext->file_size / seconds * 8);
+    int bitsPerSecond = (int)(avio_size(m_pFormatContext->pb) / seconds * 8);
 
     CLog::Log(LOGNOTICE, "Using file computed bitrate = %d", bitsPerSecond);
     return (int)bitsPerSecond;
```

I started the build again and after some time this error popped up, relating to the CEC functionality in xbmc:

>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp: In member function ‘virtual bool PERIPHERALS::CPeripheralCecAdapter::InitialiseFeature(PERIPHERALS::PeripheralFeature)’:
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:239:46: error: invalid conversion from ‘int (*)(void*, CEC::cec_log_message)’ to ‘CEC::CBCecLogMessageType {aka int (*)(void*, const CEC::cec_log_message&)}’ [-fpermissive]
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:240:46: error: invalid conversion from ‘int (*)(void*, CEC::cec_keypress)’ to ‘CEC::CBCecKeyPressType {aka int (*)(void*, const CEC::cec_keypress&)}’ [-fpermissive]
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:241:46: error: invalid conversion from ‘int (*)(void*, CEC::cec_command)’ to ‘CEC::CBCecCommandType {aka int (*)(void*, const CEC::cec_command&)}’ [-fpermissive]
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:242:46: error: invalid conversion from ‘int (*)(void*, CEC::libcec_configuration)’ to ‘CEC::CBCecConfigurationChangedType {aka int (*)(void*, const CEC::libcec_configuration&)}’ [-fpermissive]
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:243:46: error: invalid conversion from ‘int (*)(void*, CEC::libcec_alert, CEC::libcec_parameter)’ to ‘CEC::CBCecAlertType {aka int (*)(void*, CEC::libcec_alert, const CEC::libcec_parameter&)}’ [-fpermissive]
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp: In member function ‘void PERIPHERALS::CPeripheralCecAdapter::SetConfigurationFromSettings()’:
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:1344:35: error: ‘CEC_CLIENT_VERSION_2_0_0’ was not declared in this scope
>/home/will/tmp/PlexHT/source/xbmc/peripherals/devices/PeripheralCecAdapter.cpp:1420:19: error: ‘CEC::libcec_configuration’ has no member named ‘iDoubleTapTimeoutMs’

Again I plugged the error message into Google and found and old [pull request](https://github.com/Pulse-Eight/libcec/pull/46) in the libcec repository. Seeing that this bug had been fixed I checked the version of libcec in the Arch repos and discovered that it is out-of-date. I installed [libcec-git](https://aur.archlinux.org/packages/libcec-git/) from AUR instead.


Once again continue the build and it should complete without any further errors. Install PlexHT via `sudo make install`.

Before running PlexHT, first ensure that you have an X server running and that plex will be able to find the necessary XBMC data files:

``` bash
nohup X & # start a bare X session in the background
export XBMC_HOME=/opt/plexhometheater/share/XBMC # ~/.bashrc
```

You can now run PlexHT:

``` bash
/opt/plexhometheater/bin/plexhometheater
```

Enjoy!
