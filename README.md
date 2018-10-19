# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, I have incrementally converted a static webpage to a mobile-ready web application. In **Stage One**, I have taken a static design that lacks accessibility and converted the design to be responsive on different sized displays and accessible for screen reader use. I have also added a service worker to begin the process of creating a seamless offline experience for users.

## Project Overview: Stage 2

In Stage Two, I have taken the responsive, accessible design I built in **Stage One** and connected it to an external server. I modified the web app to use asynchronous JavaScript to request JSON data from the server. I stored data received from the server in an offline database using IndexedDB, which creates an app shell architecture. Finally, I optimized my site to meet performance benchmarks, which I tested using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### Specification

The core functionality of the application did not change for this stage. Only the source of the data changed. I used the fetch() API to make requests to the server to populate the content of the Restaurant Reviews app.

### Prerequisites:

Clone [Stage 2](https://github.com/jlhart/mws-restaurant-stage-2) and **follow the instructions** for getting the local node sails server online. (REQUIRED)

### Requirements

Use server data instead of local memory In the first version of the application, all of the data for the restaurants was stored in the local application. I changed this behavior so that I am pulling all of the data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.

**Use IndexedDB to cache JSON responses** In order to maintain offline use with the development server I updated the service worker to store the JSON received by get requests using the IndexedDB API. As with Stage One, any page that has been visited by the user is available offline, with data pulled from the shell database.

Meet the minimum performance requirements Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

[Lighthouse](https://developers.google.com/web/tools/lighthouse/) measures performance in four areas, but my review focused on three:

Progressive Web App score should be at 90 or better.  **Mine scored:** Desktop - **92** / Mobile - **92**
Performance score should be at 70 or better.  **Mine scored:** Desktop - **100** / Mobile - **99**
Accessibility score should be at 90 or better.    **Mine scored:** Desktop - **94** / Mobile - **94**

You can audit this site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and checkout how I implemented the required features in three areas: responsive design, accessibility and offline use.
4. Please make suggestions for improvement in implementing the updates to get this site on its way to being a mobile-ready website.

## Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). You will need to replace my API KEY with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information. 

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, I have tried to maintain use of ES6 in any additional JavaScript written. 

# mws-project-1-stage-1
