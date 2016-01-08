# Stp.pediff

A simple set of tools for visually comparing web pages.

## Table of Contents
* [How it works](#how-it-works)
* [Why to use it](#why-to-use-it)
* [Usage](#usage)
* [Specs](#specs)
* 	[Example spec file](#example-spec-file)

## How it works
Basically, Pediff executes a set of user defined tasks over two different versions of a website, takes screenshots at desired moments and scans the output for differences. Then it generates human-friendly report containing all the inconsistencies.

## Why to use it
Pediff enables developers to detect entire class of visual problems invisible to
classic unit tests and only occasionally catchable by manual review. For more details on the topic see this great talk by Brett Slatkin at Air Mozilla:
https://air.mozilla.org/continuous-delivery-at-google/

## Usage
1.  Download the project to a place of your convenience
2.  Rename `pediff.dist.js` to `pediff.js` and update the `environments` configuration. One of the URLs should point at your dev site (the one you want to test) and another one should point at the production site.
3.  Create as many specs files as needed. They all must be placed inside the `spec/` subdirectory.
4.  After creating your tasks, type:

    ```bash
    $ npm start
    ```
    into terminal and wait for the tool to finish.

5.  Results are generated in `results/` directory. In order to access them run `npm run results` command and open `http://localhost:3000/`

## Specs
  Every spec is a file containig following exported properties:
  
  * `path: string` - relative path which should be open the the beginning of the test
  * `options : object` - options passed to CasperJS
  * `dependencies : array` - array of spec files which should be run before this spec (eg. you might want to run `login` spec before accessing the dashboard)
  * `run : function` - code of the spec
  
### Example spec file:
  
```javascript
var login = require('./login');

module.exports = {
    path: '',
    options: {},
    dependencies: [login],
    run: function () {
    	// generate URL relative to current domain
        var a = document.createElement('a');
        a.href = this.getCurrentUrl();
        a.pathname = '/dashboard';
        this.thenOpen(a.href);

        this.then(function () {
            this.waitUntilVisible('.dashboard-container');
        });

        this.then(function () {
            this.click('.dashboard-container button');
        });

        this.then(function () {
            this.waitUntilVisible('.dashboard-popup');
        });

        this.then(function () {
            this.wait(2000);
        });
    }
};
```
