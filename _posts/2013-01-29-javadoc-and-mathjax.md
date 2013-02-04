---
layout: post
title: Javadoc and MathJax
---

I recently found it necessary to add math to javadoc comments; [MathJax][] makes this super easy!

Simply include the script using javadoc's *header* argument.

``` bash
javadoc -header "<script type='text/javascript' src='http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>" [YOUR_PACKAGE_HERE]
```

Adding this to a build process requires considerable escaping. Thanks to [this post][escape] for the tip. I've included an example for Ant.

``` xml
<javadoc additionalparam="-header &apos;&lt;script type=&quot;text/javascript&quot; src=&quot;http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML&quot;&gt;&lt;/script&gt;&apos;">
```

Now you can use the LaTeX math delimeters, `\(...\)` and `\[...\]`, in your javadoc comments! Here's an example...

``` java
/**
 * Laplaician smoothing.
 * @return \( \displaystyle \bar{x}_{i}= \frac{1}{N} \sum_{j=1}^{N}x_j \)<br />
 * Where \( N \) is the number of adjacent vertices to node \( i \) and \( \bar{x}_i \) is the new position for node \( x_i \).
 */
public PVector laplacianSmoothing() { ...
```

The math in this comment will be formatted as:
>\\[\bar{x}_{i}= \frac{1}{N} \sum_{j=1}\^{N}x_j\\]
>Where \\( N \\) is the number of adjacent vertices to node \\( i \\) and \\( \bar{x}_i \\) is the new position for node \\( x_i \\).

On a side note, the LaTeX for the equation above was lifted directly from the Wikipedia page on Laplacian Smoothing. I found it in the `alt` attribute of the `img` tag (the equations are stored as PNGs). A nice little time-saver!

Next step: getting this to work with [TeXDoclet][]...



[MathJax]: http://www.mathjax.org
[escape]: http://zverovich.net/2012/01/14/beautiful-math-in-javadoc.html
[TeXDoclet]: http://doclet.github.com
