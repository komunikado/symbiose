[Symbiose 1.0 beta 5](http://symbiose.fr.cr/)
==============================================

[![Build Status](https://travis-ci.org/symbiose/symbiose.svg?branch=master)](https://travis-ci.org/symbiose/symbiose)

This version (beta) is unstable. 

Key features
------------

* Apps:
 * Calculator (essential!)
 * Brackets code editor
 * Basic text editor ([gedit](https://en.wikipedia.org/wiki/Gedit))
 * File manager with copy-paste, drag'n'drop, file sharing, searching...
 * Google Docs to display and edit your documents
 * Chat app which supports XMPP (Google, Facebook, with multiple accounts and OTR encryption)
 * Basic word processor
 * Basic multimedia player
 * Music player (based on [GNOME Music](https://wiki.gnome.org/Apps/Music))
 * Basic web browser
 * Terminal (with a basic interpreter)
 * Image viewer, archive manager, software centre...
* Customizable: themes, background and so on
* Multiple interfaces: Elementary OS, GNOME Shell, GNOME Panel (GNOME 2), Windows 7-like, mobile, CLI
* Easy configuration with a _System settings_ app and simple config files
* FTP, Dropbox and Google Drive integration
* [LDAP authentication](https://github.com/symbiose/symbiose/wiki/LDAP-authentication) support
* Firefox Marketplace apps integration
* Native GTK3 apps can be displayed on the web desktop using [Broadway](https://github.com/symbiose/symbiose/wiki/Broadway)
* Available in English, French, German, Italian and Spanish
* WebSocket support
* Can be used in standalone mode (which just requires a static server, no PHP)
* And more!

Demo
----

You can try Symbiose on our website : http://symbiose.fr.cr/ (username : _demo_, password : _demo_).

Bug tracker
-----------

Have a bug ? Please create an issue here on GitHub : https://github.com/symbiose/symbiose/issues.

Installing
----------

To install Symbiose you just need to unzip files on your web server and to set them read and write permissions for web server user. You can also build Symbiose to make it faster.

For more information, please see the wiki : https://github.com/symbiose/symbiose/wiki/Installing.

Software requirements
---------------------

* Server: 
 * PHP >= 5.3
 * Database: optional (off by default)
* Client: a fast and modern web browser (e.g. the latest *Mozilla Firefox*). Tested on:
 * Firefox (latest version)
 * Chromium (latest version)
 * Internet Explorer 10+, if you're lucky!

> **NB**: Symbiose can also run in standalone mode, which doesn't require PHP.

Authors
-------

**Emersion**
+ http://emersion.fr/
+ http://github.com/emersion

**Codel**
+ https://github.com/Codel

**Doppelganger**
+ https://github.com/Doppelganger-Symbiose

Copyright
---------

Symbiose is licensed under the MIT License (MIT). A copy of the license is available in `LICENSE`.

Contact: symbiose@emersion.fr  
Copyright (C) 2014 Simon Ser
