## Problem
===

When doing research online, people open the results in a new tabs which make it difficult to find the right tab.

[Project proposal slide deck](https://docs.google.com/presentation/d/12-HeEY_-6mX8jAHfuzQP8yYTguHW-hWwip06nzPCX6Y/edit?usp=sharing)

## Solution

A web app that lets the user copy and paste the relevant information they need from a tab into my app, thus allowing them to close that tab and reclaim tab real estate. Given the time constraints, the scope of the project was constrained to code snippets.

## Code Paste

Code paste lets you paste any code snippets anonymously so they can shared easily with others.

### Features

* Add multiple code editors, one for every code snippet you have
* Page expiry: choose from never, 1 min, all the way upto 1 week at which point, the page will no longer be accessible. A countdown timer lets you know how much time remains.
* Auto-save: pasting or typing code automatically saves. It also attempts to save before the tab is closed
* Resizable and draggable code editors: Code paste remembers the sizing and positions so next time you view them, they will be in the same place
* Formatting: change the font size, theme and language syntax highlighting. Currently supports Ruby/Javascript/CSS/HTML

### Demo

[Try it now](https://code-paste.herokuapp.com)

### Technologies used

* [gridster js](http://gridster.net/)
* [codemirror](https://codemirror.net/)
* [moment js](http://momentjs.com/)
* [jQuery countdown plugin](http://hilios.github.io/jQuery.countdown/)
* [underscore js](http://underscorejs.org/)
* [jQuery](https://jquery.com/)
* Javascript
* Rails
* [Skeleton CSS](http://getskeleton.com/)
* [Font awesome](https://fortawesome.github.io/Font-Awesome/)
* [Postgresql](http://postgresapp.com/)

### Thanks

To Joel for suggesting how expiry could be done without background workers, thus saving me lots of time to work on other features. To Jack for helping me limit the scope of the project so I could produce something within a week and for debugging an annoying deployment issue concerning SASS. Shoutout to Alex, Colin and Rob for the enlightening discussions.

### Configuration

Install and run the postgresql app.

```
rake db:create
rake db:migrate
rake db:seed
```

### Deployment

Run the command line `rails server`

### Bugs

* Moving an editor around sometimes causes the green shadow to remain
* If a user adds content to a code editor and closes the tab within 5s, it is possible the data might not save if the server is down. It attempts to save before the tab is closed but allows the tab to close even if the update failed.

### Sore points

* Browser was using local time but postgresql was using UTC time so had to convert between them
* using jquery keypress event handling when I should've been using code editor event handling
* jquery countdown giving me issues when trying to turn it off

### What's next?

* view editor changes without doing a page refresh
* Copy to clipboard button
* Global toolbar instead of 1 for each editor
* Admin/user login
  * Public/private view modes
  * Public/private edit modes
  * users can comment on a specific line or segment
* When pasting in code, auto add the source link
* maximise code editor
* rewrite to use backbone.js

