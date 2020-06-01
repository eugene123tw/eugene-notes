# Friday Theme

## A Bootstrap 4 portfolio and blog theme for Jekyll

- Example 1: This repo builds directly to GitHub pages, which is also the documentation: https://sfreytag.github.io/friday-theme/
- Example 2: my own homepage, http://www.freytag.org.uk

## Get Started

Follow the [install notes](https://sfreytag.github.io/friday-theme/projects/install.html).

## Usage

The theme is free to use, but if you do use it, it would be great to hear from you. Email simon@freytag.org.uk - thanks!

## Jekyll Version

**Watch out!** This theme uses {{site.baseurl}} throughout, so is not currently suitable for Jekyll 4. It works well with 3.8.5 and works well with GitHub Pages.

## Include Image from Assets

```html
<div class="card mb-3">
  <img class="card-img-top" src="{{ site.baseurl }}/assets/img/../image.png" />
  <div class="card-body bg-light">
    <div class="card-text">
      Image caption.
    </div>
  </div>
</div>
```
