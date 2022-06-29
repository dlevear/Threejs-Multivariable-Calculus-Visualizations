// Your file should have a single <canvas></canvas> element in it
// (because of createRenderer())

function createScene() {
    window.scene = new THREE.Scene();
    return window.scene
}

function createRenderer() {
    window.renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, canvas: document.querySelector('canvas') } );
    window.renderer.setPixelRatio( window.devicePixelRatio );
    window.renderer.setSize( window.innerWidth, window.innerHeight );
    window.renderer.setClearColor( 0xffffff, 1 );
    document.body.appendChild( window.renderer.domElement );
    return window.renderer
}

function setBoundingBox(p0,p1) {
    /*
        Sets some global variables that could be used when resizing the window. 
        We used to use these values to deal with window resize events. 
        But now we use createOrthographicCameraDynamically() instead.
        This was adapted from sage's threejs files.

        INPUT
            What part of 3D space needs to be visible? Defined as a box given by two corner points. Arguments are two json points.

        EXAMPLES
            setBoundingBox({"x":-2.0, "y":-2.0, "z":-2.0}, {"x":2.0, "y":2.0, "z":2.0})
    */
    window.b = [p0,p1];
    if ( b[0].x === b[1].x ) {
        b[0].x -= 1;
        b[1].x += 1;
    }
    if ( b[0].y === b[1].y ) {
        b[0].y -= 1;
        b[1].y += 1;
    }
    if ( b[0].z === b[1].z ) {
        b[0].z -= 1;
        b[1].z += 1;
    }

    window.xRange = b[1].x - b[0].x;
    window.yRange = b[1].y - b[0].y;
    window.zRange = b[1].z - b[0].z;

    // there used to be some code about aspect ratio here

    // Distance from (xMid,yMid,zMid) to any corner of the bounding box, after applying aspectRatio
    window.midToCorner = Math.sqrt( xRange*xRange + yRange*yRange + zRange*zRange ) / 2;
    window.xMid = ( b[0].x + b[1].x ) / 2;
    window.yMid = ( b[0].y + b[1].y ) / 2;
    window.zMid = ( b[0].z + b[1].z ) / 2;
};

function addLabel( text, x, y, z, color='black', font='monospace', size=1 ) {
    var canvas = document.createElement( 'canvas' ); 
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext( '2d' );
    c = new THREE.Color(color);
    color = c.getStyle();

    context.font = 'italic 64px Georgia';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText( text, canvas.width/2, canvas.height/2);

    var texture = new THREE.Texture( canvas );
    texture.needsUpdate = true;

    var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: texture, color: 0xffffff } ) );
    sprite.position.set( x, y, z );

    sprite.scale.set(size,size,size); 

    scene.add( sprite );
}

function createCamera(projection="perspective") {
  /*
    Synonym for createPerspectiveCamera. 
  */
    if ( projection != "perspective" ) {
      console.error('To create an orthographic camera, use createOrthographicCamera.');
    }
    return createPerspectiveCamera(); 
}
function createPerspectiveCamera({fov=45, near=0.1, far=1000}={}) {
  /*
    Return a camera with perspective projection.

    ARGUMENTS
      fov: field of view, measured from top to bottom
      near: near plane for viewing frustum
      far: far plane for viewing frustum

    Field of view matters a lot for determining what part of the scene is visible.

    Near and Far matter mostly for viewing-frustum culling.

    Aspect of camera will match the window's aspect ratio.
  */
    const aspect = window.innerWidth / window.innerHeight;
    return new THREE.PerspectiveCamera( fov, aspect, near, far ); 
}
function createOrthographicCamera({left=-1.5, right=1.5, top=1.5, bottom=-1.5, near=0.1, far=1000}={}) {
  /*
    Return a camera with orthographic projection.

    ARGUMENTS
      left,right,top,bottom,near,far: viewing frustum parameters 

    DESCRIPTION
      An orthographic camera is one where the viewing frustum is a box (prism). 

      The box is determined as follows.

      Based on camera.position, camera.up, and controls.target, the camera
      points along a line through camera.position. 

      This determines a coordinate system hat{out} (parallel to line, away from camera), hat{up} (camera.up) and hat{right} (pointing right from the camera's point of view, that is, hat{right} = hat{out} x hat{up}).

      Using the above vectors, provided arguments determine the six planes that define the box. 
      E.g. one plane goes through camera.position+`left`*hat{right} with normal vector hat{right}. 
      Another plane goes through camera.position+`right`*hat{right} with normal vector hat{right}. 
      Etc. 

      EXAMPLES
        Suppose camera.position is (1,0,0) and camera.up is (0,0,1) and pointing at (0,0,0).
        Then createOrthographicCamera({
          left: -.5,
          right: .5,
          top: .5,
          bottom: -.5,
          near: 0,
          far: 1
        });
        will have the unit cube centered at (0,0,0) as its viewing frustum.

  */
    var camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far ); 
    return camera;
}

function createOrthographicCameraDynamically({top=1.5, bottom=-1.5, near=0.1, far=1000}={}) {
  /*
    Return a camera using orthographic projection where left,right are determined by window size. Set camera.dynamic to true.

    DESCRIPTION
      This is more similar to the behavior of perspective camera, because
      the top plane and bottom plane are always the same. The window size
      determines how much can be seen horizontally. We set dynamic to true
      so that during updateCameraAspect we can update left,right planes.

  */
  const frustumWidth = window.innerWidth/window.innerHeight * (top-bottom);
  var camera = createOrthographicCamera({left: -frustumWidth/2, right:frustumWidth/2, top: top, bottom: bottom, near: near, far: far});
  camera.dynamic = true;
  return camera;

}


function updateCameraAspect( camera ) {
    // This method is called when the window is resized
    const aspect = window.innerWidth / window.innerHeight;
    if ( camera.isPerspectiveCamera ) {
        camera.aspect = aspect;
    }
    else if ( camera.dynamic ) {
      // dynamic orthographic projection
      // so we should update viewing frustum based on window size
      const frustumWidth = aspect*(camera.top-camera.bottom);
      camera.left = -frustumWidth/2;
      camera.right = frustumWidth/2;
    }
    camera.updateProjectionMatrix();
}

function fatArrow(dir=new THREE.Vector3(1,1,1), color='#000000', thickness=.01, segments=8, headHeight=-1) {
    /*
        Helper function for drawVector.
    */
    if (headHeight==-1) {headHeight = dir.length()*(5/100);}
    const height = dir.length() - headHeight;
    const shaftGeometry = new THREE.CylinderGeometry( thickness, thickness, height, segments );
    const shaftMaterial = new THREE.MeshBasicMaterial( {color: color} );
    const shaft = new THREE.Mesh( shaftGeometry, shaftMaterial );
    shaft.lookAt(dir);
    shaft.rotateX(Math.PI/2);
    shaft.translateY(height/2);

    const headGeometry = new THREE.CylinderGeometry( 0, 3*thickness, headHeight, segments );
    const headMaterial = new THREE.MeshBasicMaterial( {color: color} );
    const head = new THREE.Mesh( headGeometry, headMaterial );
    head.lookAt(dir);
    head.rotateX(Math.PI/2);
    head.translateY(dir.length()-headHeight/2);

    const group = new THREE.Group();
    group.add(head);
    group.add(shaft);
    return group;
}

function drawVector(vector, {origin=new THREE.Vector3(0,0,0), color=new THREE.Color('#000000'), thickness=0.05, segments=8, headHeight=-1} = {}) {
    /*
        Returns ThreeJs group containing geometries that represent the given vector.
        
        ARGUMENTS
            vector: a THREE.Vector3 representing the desired direction&length
            options: an Object with keys (all optional)
                origin: a THREE.Vector3 for the starting point of the drawn vector
                color: the color you want the vector to be
                thickness: the thickness you want the vector to be
                segments: the number of segments for the cylinder that represents the vector
                headHeight: the length of the head of the arrow 
        
        EXAMPLE
            // draws a green vector from (-1,-1,-1) to (0,0,0).
            v = drawVector(new THREE.Vector3(1,1,1), {origin: new THREE.Vector3(-1,-1,-1), color: new THREE.Color('#00FF00')})
            scene.add(v); 
        EXAMPLE
            //draws rainbow normal vectors for every vertex in SphereGeometry
            const g = new THREE.SphereGeometry(1, 8, 8); 
            scene.add(new THREE.Mesh( g, new THREE.MeshBasicMaterial( {color: 0x222222} )));
            scene.add(new THREE.Mesh( g, new THREE.MeshBasicMaterial( {color: 0xDDDDDD, wireframe: true} )));
            for (var i=0; i < g.attributes.position.array.length; i+=3) {
              const [x, y, z] = g.attributes.position.array.slice(i,i+3);
              const [nx, ny, nz] = g.attributes.normal.array.slice(i,i+3);
              scene.add(drawVector( new THREE.Vector3(nx,ny,nz), {color: new THREE.Color().setHSL(z/2+.5, 1, .5), origin: new THREE.Vector3(x,y,z), thickness: 0.003} ));
            }
    */
    const V = fatArrow(vector, color, thickness, segments, headHeight);
    V.translateX(origin.x);
    V.translateY(origin.y);
    V.translateZ(origin.z);
    return V;
}

function makeAxes({xColor=new THREE.Color('#696969'), yColor=new THREE.Color('#696969'), zColor=new THREE.Color('#696969'), color=undefined, xMax=1, yMax=1, zMax=1, labels=true} = {}) {
    /*
        Returns ThreeJs group containing gemetries that represent x,y,z coordinate axes. 
        
        Practically, these are our "default axes", so we have kept the options somewhat minimal.
        But you can easily achieve more by adapting the code. 
        
        ARGUMENTS
            options: an Object with keys (all optional)
                color: a THREE.Color which is the color of all axes and labels
                xColor: a THREE.Color which is the color of the x-axis and its label (this option is ignored if color is defined)
                yColor: a THREE.Color which is the color of the y-axis and its label (this option is ignored if color is defined)
                zColor: a THREE.Color which is the color of the z-axis and its label (this option is ignored if color is defined)
                labels: a boolean, if true, then labels "x" "y" and "z" are added to the axes, kicked out by .1 units
                xMax: how long the x-axis should be (starting from 0)
                yMax: how long the y-axis should be (starting from 0)
                zMax: how long the z-axis should be (starting from 0)
        
        EXAMPLE
            scene.add(makeAxes()); // draws simple set of axes with labels
        EXAMPLE
            scene.add(makeAxes({xColor: new THREE.Color('#FF0000')})); // draws x-axis red, other axes default 
        EXAMPLE
            // uses color exclusively to indicate axes (not altogether accessible)
            scene.add(makeAxes({xColor: new THREE.Color('#FF0000'), yColor: new THREE.Color('#00FF00'), zColor: new THREE.Color('#0000FF'), labels: false})); 
        EXAMPLE
            // adds axes with arrows on both positive and negative sides, with labels on the positive side
            let a1 = makeAxes(); 
            let a2 = makeAxes({labels: false, xMax: -.25, yMax: -.25, zMax: -.25});
            scene.add(a1);
            scene.add(a2);
    */
    if (color != undefined) {
      xColor = yColor = zColor = color;
    }
    var xAxis = new THREE.Vector3( xMax, 0, 0);
    var yAxis = new THREE.Vector3( 0, yMax, 0);
    var zAxis = new THREE.Vector3( 0, 0, zMax);
    var group = new THREE.Group();
    shift = .1
    group.add(drawVector(xAxis, {color:xColor, thickness:.005})); 
    group.add(drawVector(yAxis, {color:yColor, thickness:.005})); 
    group.add(drawVector(zAxis, {color:zColor, thickness:.005})); 
    if (labels) {
        addLabel( 'x', xMax + shift, shift, shift, xColor, 'Arial', .5);
        addLabel( 'y', shift, yMax + shift, shift, yColor, 'Arial', .5);
        addLabel( 'z', shift, shift, zMax + shift, zColor, 'Arial', .5);
    }
    return group;
}

window.color1 = 0x999999; //light gray
window.color2 = 0xFEC635; //orange
window.color3 = 0x317DFB; //blue
window.color4 = 0x808080; //Gray
window.color5 = 0x696969; //DimGray
window.transparentOrange = 0xFF8C00;
window.transparentBlue = 0x0000FF;

function rainbowColorMap(t) {
    /* Color map going through a rainbow t=0 to t=1 */
    color = new THREE.Color(0x0000ff);
    color.setHSL(.7*(1-t), 1, .5);
    return color;
}

function addColorMapToGeometry(g, colorMap=rainbowColorMap) {
    /*
        Assigns colors to vertices of g using a colormap based on the z coordinate.

        ARGUMENTS
            * g is a ThreeJs Geometry
            * colorMap is a function that takes a number between 0 and 1 and returns a THREE.Color object.

        EXAMPLE
             // Sphere
             g = new THREE.SphereGeometry(.5,10,10);
             addColorMapToGeometry(g);
             material = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors, side:THREE.DoubleSide, } );
             plane = new THREE.Mesh( g, material);
             scene.add(plane);

        EXAMPLE
             // Cone pointing along z axis: note that it will only show as a linear gradient between the t=0 and t=1 colors.
             // To get more colors, you would have to retriangulate.
             g = new THREE.ConeGeometry(.5,1,5);
             g.rotateX(Math.PI/2);
             addColorMapToGeometry(g);
             material = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors, side:THREE.DoubleSide, } );
             plane = new THREE.Mesh( g, material);
             scene.add(plane);

        DETAILS
          The color of each vertex v is determined by colorMap(t) where 
          t is obtained by normalizing the z-coordinate difference between v and the lowest z-coordinate in g.

          Note that the vertex colors will ultimately be interpolated barycentrically.
          Consequently, the triangulation of your geometry could have a large effect on the rendering. See the cone example.
    */
    g.computeBoundingBox();
    var zMin = g.boundingBox.min.z;
    var zMax = g.boundingBox.max.z;
    var zRange = zMax - zMin;
    var Vs = g.attributes.position.array; //vertices
    var Cs = [] //colors
    for (var i=0; i < Vs.length; i+=3) {
        point = {x: Vs[i], y: Vs[i+1], z: Vs[i+2]};
        t = (point.z  - zMin)/zRange
        color = colorMap(t);
        Cs.push(color.r); 
        Cs.push(color.g); 
        Cs.push(color.b); 
    }
    g.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(Cs),3, true)
    );
}

function add_uv_from_y_direction(g) {
    /*
        Add u,v coordinates to a geometry as if texture is projected from positive y-axis
     
        ARGUMENTS
            g: THREE.BufferGeometry
    */
    g.computeBoundingBox();
    var zMin = g.boundingBox.min.z;
    var zMax = g.boundingBox.max.z;
    var zRange = zMax - zMin;
    var xMin = g.boundingBox.min.x;
    var xMax = g.boundingBox.max.x;
    var xRange = xMax - xMin;
    var Vs = g.attributes.position.array; //vertices
    var Cs = [] //coordinates
    for (var i=0; i < Vs.length; i+=3) {
        point = {x: Vs[i], y: Vs[i+1], z: Vs[i+2]};
        u = (point.x - xMin)/xRange;
        v = (point.z  - zMin)/zRange;
        Cs.push(u);
        Cs.push(v);
    }
    g.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(Cs),2, true)
    );
}

function create_level_curve_texture(lineYs, lineWeight, bgColor, lineColor) {
    /*
        Creates a texture with horizontal lines at position descirbed by lineYs

        ARGUMENTS
            lineYs: a list of numbers between 0 and 1, representing where you want the horizontal lines
            lineWeight: a number between 0 and 1 (probably pretty close to 0) representing thickness of horizontal lines
            bgColor: color for background (will be converted as THREE.Color(bgColor))
            lineColor: color for lines (will be converted as THREE.Color(lineColor))
    */
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = 1; 
    ctx.canvas.height = 500;
    // Fill background 
    var bgColor3 = new THREE.Color(bgColor);
    ctx.fillStyle = '#' + bgColor3.getHexString();
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw rectangles 
    var lineColor3 = new THREE.Color(lineColor);
    ctx.fillStyle = '#' + lineColor3.getHexString();
    lineYs.forEach(function(element) {
        var computedY = ctx.canvas.height*element;
        var computedSize = ctx.canvas.height*lineWeight;;
        ctx.fillRect(0, computedY-computedSize/2, ctx.canvas.width, computedSize);
    });
    const t = new THREE.CanvasTexture(ctx.canvas);
    return t;
}

function autoRotate_until_clicked(controls, renderFunction, {rotateSpeed=2.0}={}) {
  /*
      Sets up an animation loop that will rotate the scene until clicked.

      ARGUMENTS
        controls: your OrbitControls object
        renderFunction: the function you call to render your scene
        rotateSpeed (default 2.0): degrees per second assuming fps is 60
  */
  controls.autoRotate = true;
  controls.autoRotateSpeed = rotateSpeed; // 30 seconds per round when fps is 60
  controls.addEventListener('start', function(){
    controls.autoRotate = false;
  });

  const animate = function() {
    requestAnimationFrame(animate);
    controls.update();
    renderFunction();
  }
  animate();
  return;
}

function texture_two_centered_boxes({outerWidth=32,outerHeight=32,outerColor=new THREE.Color('black'),innerWidth=28, innerHeight=28, innerColor=new THREE.Color('white') }={}) {
    /*
       DESCRIPTION
         Return a Threejs texture consisting of two centered boxes.

       PARAMETERS
         outerWidth,outerHeight = width,height of outer box
         innerWidth,innerHeight = width,height of inner box
         outerColor = a THREEJS color for the color of outer box
         innerColor = a THREEJS color for the color of inner box
    */
    const canvas = document.createElement( 'canvas' );
    canvas.width = outerWidth;
    canvas.height = outerHeight;
    const context = canvas.getContext( '2d' );
    context.fillStyle = outerColor.getStyle();
    context.fillRect(0, 0, outerWidth, outerHeight);
    context.fillStyle = innerColor.getStyle();
    context.fillRect(outerWidth/2 - innerWidth/2, outerHeight/2 - innerHeight/2, outerWidth/2 + innerWidth/2, outerHeight/2 + innerWidth/2);
    const texture = new THREE.Texture( canvas );
    return texture;
}

