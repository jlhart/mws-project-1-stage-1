# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, I have incrementally converted a static webpage to a mobile-ready web application. In **Stage One**, I have taken a static design that lacks accessibility and converted the design to be responsive on different sized displays and accessible for screen reader use. I have also added a service worker to begin the process of creating a seamless offline experience for users.

## Project Overview: Stage 2

In Stage Two, I have taken the responsive, accessible design I built in **Stage One** and connected it to an external server. I modified the web app to use asynchronous JavaScript to request JSON data from the server. I stored data received from the server in an offline database using IndexedDB, which creates an app shell architecture. Finally, I optimized my site to meet performance benchmarks, which I tested using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

## Project Overview: Stage 3 <---- FINAL PROJECT 
In Stage Three, I have taken the connected application I built in Stage One and Stage Two and added additional functionality. I added a form to allow users to create their own reviews. When the app is offline, my review form defers updating to the remote database until a connection is established. Finally, I optimized the site to meet even stricter performance benchmarks than my previous project, and tested again using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### Specification

I used the provided code for the updated [Node development server](https://github.com/udacity/mws-restaurant-stage-3) and I used the README for getting the server up and running locally on my computer. The README contains the API needed for this app to make JSON requests to the server.

This server is different than the server from stage 2, and has added capabilities. Make sure to use the Stage Three server when testing my project. Connecting to this server is the same as with Stage Two, however.

You will find the documentation for the new server in the README file for the server.

### Prerequisites:

Clone [Stage 3](https://github.com/udacity/mws-restaurant-stage-3) and **follow the instructions** for getting the local node sails server online. (REQUIRED)

### Requirements

Add a form to allow users to create their own reviews: In previous versions of the application, users could only read reviews from the database. You will need to add a form that adds new reviews to the database. The form should include the user’s name, the restaurant id, the user’s rating, and whatever comments they have. Submitting the form should update the server when the user is online.

Add functionality to defer updates until the user is connected: If the user is not online, the app should notify the user that they are not connected, and save the users' data to submit automatically when re-connected. In this case, the review should be deferred and sent to the server when connection is re-established (but the review should still be visible locally even before it gets to the server.)

Meet the new performance requirements: In addition to adding new features, the performance targets you met in Stage Two have tightened. Using Lighthouse, you’ll need to measure your site performance against the new targets using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

[Lighthouse](https://developers.google.com/web/tools/lighthouse/) measures performance in four areas, but my review focused on three:

Progressive Web App score should be at 90 or better.  **Mine scored:** Desktop - **92** / Mobile - **92**

Performance score should be at 90 or better.  **Mine scored:** Desktop - **98** / Mobile - **99**

Accessibility score should be at 90 or better.   **Mine scored:** Desktop - **94** / Mobile - **94**

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

# mws-project-1-stage-3
