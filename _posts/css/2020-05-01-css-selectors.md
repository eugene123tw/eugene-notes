---
title: CSS Selectors
comments: true
tags:
  - CSS
---

In this post, I'll give some examples and explain some confusing CSS selectors.

<!--more-->
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/styles.css">

### Child combinator

The following example selects `<span>` that are direct children of `<div>` elements using the child combinator (`>`). This will only change the color of first child:

#### CSS Highlight

{% highlight css %}

div>span {
background-color: DodgerBlue;
}

{% endhighlight %}

#### HTML Highlight

{% highlight html %}

  <div> 
    <div>
      <span> Span #1 is a child and also a descendant.
        <span> Span #2 is a descendant but not a child </span>
      </span>
    </div>
    <span> Span #3 is not selected </span>
  </div>
{% endhighlight %}

#### HTML

<div class="case1 border"> 
  <div>
    <span> Span #1 is a child and also a descendant.
      <span> Span #2 is a descendant but not a child </span>
    </span>
  </div>
  <span> Span #3 is not selected </span>
</div>

<div style="margin: 2rem 2rem 0 0;"></div>

### Descendant combinator

The nuance between Descendant combinator and Child combinator is that Child combinator will only change the style of its own children. But Descendant combinator will change every descendants (including children).

#### CSS Highlight

{% highlight css %}

div span {
background-color: DodgerBlue;
}

{% endhighlight %}

#### HTML Highlight

{% highlight html %}

<div> 
  <div>
    <span> Span #1 is a descendant and also a child.
      <span> Span #2 is a descendant but not a child </span>
    </span>
  </div>
  <span> Span #3 is not selected </span>
</div>

{% endhighlight %}

#### HTML

<div class="case2 border"> 
  <div>
    <span> Span #1 is a descendant and also a child.
      <span> Span #2 is a descendant but not a child </span>
    </span>
  </div>
  <span> Span #3 is not selected </span>
</div>

<div style="margin: 2rem 2rem 0 0;"></div>

### Using the universal selector to make your selectors easier to read

One use of the universal selector is to make selectors easier to read and more obvious in terms of what they are doing. For example, if I wanted to select the first child of any `article` element, no matter
what element it was, and make it bold, I could use the `:first-child` selector, as a descendant selector along with the `article` element selector:

{% highlight css %}

article :first-child {
  font-weight: bold;
}

{% endhighlight %}

This could be confused however with `article:first-child`, which will select any `<article>` element **that is the first child of another element.**

To avoid this confusion we can add the universal selector to the `:first-child selector`, so it is obvious what the selector is doing. It is selecting any element which is the first-child of an `<article>` element:

{% highlight css %}

article *:first-child { 
  font-weight: bold;
} 

{% endhighlight %}

## Class selectors
### Apply multiclass to elements

Multiclass works a bit like abstract class which will inherit attributes from the previous class. In the example, we're going to have a `notebox` class as our abstract class (base class), then we will override and extend its attributes.

{% highlight css %}
.notebox { 
  border: 4px solid #666;
  background-color: yellow;
  padding: .5em;
} 

.notebox.warning {
  border-color: orange;
  background-color: white;
  font-weight: bold;
}

.notebox.danger {
  border-color: red;
  background-color: white;
  font-weight: bold;
}
{% endhighlight %}

{% highlight html %}
<div class="notebox">
    This is an base notebox.
</div>

<div class="notebox warning">
    This shows a warning notebox.
</div>

<div class="notebox danger">
    This shows danger notebox!
</div>
{% endhighlight %}


<div class="notebox">
    This is an base notebox.
</div>

<div class="notebox warning">
    This shows a warning notebox.
</div>

<div class="notebox danger">
    This shows danger notebox!
</div>