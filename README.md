# Threejs Multivariable Calculus Visualizations MIT 2022

This is a showcase of math visualizations that were made during the years 2020-2022 at MIT. 

They were made by Duncan Levear and Jennifer French at MIT in 2020-2022 and included in online courses run during that time.

Others should feel inspired to adapt these for their own uses.

The `mitxThreeJsHelper.js` file does the "heavy lifting," in that it provides the helper functions that allowed us to write each visualization as a short HTML file. Thanks to helper functions, these HTML files usually do not exceed 200 lines. 

# Showcase

To see the visualizations, use Github Pages via [this link](https://dlevear.github.io/Threejs-Multivariable-Calculus-Visualizations/githubPages.html).

# License

MIT License. See LICENSE file.

# Notice of Third Party Licenses

This software uses third-party dependencies which are distributed according to their own license terms:

* [ThreeJs](https://github.com/mrdoob/three.js/blob/dev/LICENSE). MIT License. Copyright (c) 2010-2022 three.js authors. 
* [THREE.MeshLine](https://github.com/spite/THREE.MeshLine). MIT License. Copyright (c) 2016 Jaume Sanchez.
* [Jquery](https://github.com/jquery/jquery). MIT License. Copyright (c) OpenJS Foundation and other contributors.

# Symbolic links to helper files

The visualizations are `.html` files. They all depend on a collection of helper `.js` files (including `three.min.js`). 

Because it made it easier to import the images to the online courses, we have written the `.html` files to expect the `.js` files to be in the same directory. For that reason, we include symbolic links to all `.js` files in the same directory as the `.html` files, with the oriinal `.js` files in the repo's root. 

Also, for an uninteresting technical reason, to use these in our online course, we needed to prepend `threejs_` to each symlink filename. 
