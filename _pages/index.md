---
layout: defaults/page
permalink: index.html
narrow: true
title: Eugene's Dev Blog
---

## What is it?

{% include components/intro.md %}

### Recent Posts

{% for post in site.posts limit:5 %}
{% include components/post-card.html %}
{% endfor %}


