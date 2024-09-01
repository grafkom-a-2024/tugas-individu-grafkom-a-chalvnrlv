var InitDemo = function () {
    console.log('Program ini berjalan dengan baik');

    var canvas = document.getElementById('canvas-game');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL tidak didukung, coba sesaat lagi');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Browser tidak mendukung WebGL');
        return;
    }

    var vertexShaderSource = `
    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;
    void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }`;

    var fragmentShaderSource = `
    precision mediump float;
    varying vec3 fragColor;
    void main() {
        gl_FragColor = vec4(fragColor, 1.0);
    }`;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Error saat compile vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Error saat compile fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error saat link program!', gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('Error saat validate program!', gl.getProgramInfoLog(program));
        return;
    }

    // Define vertices for triangle, square, and circle centered horizontally
    var triangleVertices = [
        // Triangle (centered left)
        -0.6, 0.1,  1.0, 0.0, 0.0,  // Vertex 1 
        -0.8, -0.3, 1.0, 0.0, 0.0,  // Vertex 2 
        -0.4, -0.3, 1.0, 0.0, 0.0   // Vertex 3 
    ];

    var squareVertices = [
        // Square (centered middle)
        -0.1, 0.3,  0.0, 0.0, 1.0,  // Vertex 1 
        -0.1, -0.3, 0.0, 0.0, 1.0,  // Vertex 2 
        0.1, -0.3,  0.0, 0.0, 1.0,  // Vertex 3 
        0.1, -0.3,  0.0, 0.0, 1.0,  // Vertex 3 
        0.1, 0.3,   0.0, 0.0, 1.0,  // Vertex 4 
        -0.1, 0.3,  0.0, 0.0, 1.0   // Vertex 1 
    ];

    // Generate vertices for a circle (centered right)
    var circleVertices = [];
    var numSegments = 50;
    var radius = 0.2;
    var circleCenterX = 0.6;
    var circleCenterY = 0.0;
    for (let i = 0; i <= numSegments; i++) {
        let theta = (i / numSegments) * 2.0 * Math.PI;
        let x = circleCenterX + radius * Math.cos(theta);
        let y = circleCenterY + radius * Math.sin(theta);
        circleVertices.push(x, y, 1.0, 1.0, 0.0);
    }

    var vertices = new Float32Array([...triangleVertices, ...squareVertices, ...circleVertices]);

    var bufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);
    gl.clearColor(0.1, 0.10, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Draw the square
    gl.drawArrays(gl.TRIANGLES, 3, 6);

    // Draw the circle
    gl.drawArrays(gl.TRIANGLE_FAN, 9, numSegments + 1);

    // Get the 2D context of the second canvas
    var textCanvas = document.getElementById('canvas-text');
    var ctx = textCanvas.getContext('2d');

    // Draw the text
    ctx.font = '30px Inter';
    ctx.fillStyle = 'white';
    var text = 'Triangle                 Square                    Circle';
    var textWidth = ctx.measureText(text).width;
    var canvasWidth = textCanvas.width;
    var xPosition = (canvasWidth - textWidth) / 2;
    var upperSpacing = 200;
    ctx.fillText(text, xPosition, 30 + upperSpacing);
};

window.onload = function () {
    InitDemo();
};
