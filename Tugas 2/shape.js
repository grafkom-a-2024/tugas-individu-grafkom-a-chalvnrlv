// Initialize the WebGL context
function initWebGL(canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return null;
    }
    return gl;
}

// Shader source code
const vertexShaderSource = `
    attribute vec2 coordinates;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat3 transformationMatrix; // Transformation matrix

    void main(void) {
        vec3 pos = transformationMatrix * vec3(coordinates, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
        vColor = color; // Pass the color to the fragment shader
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    void main(void) {
        gl_FragColor = vec4(vColor, 1.0); // Use the interpolated color
    }
`;

// Compile and attach shaders
function initShaders(gl) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Get the location of the uniforms
    shaderProgram.transformationMatrixUniform = gl.getUniformLocation(shaderProgram, "transformationMatrix");

    return shaderProgram;
}

// Create buffer and bind triangle vertices
function createTriangleBuffer(gl) {
    const vertices = [
        // Triangle vertices: (x, y)    // Colors (r, g, b)
        // Depan roket orange
        -0.4, 0.1,   1.0, 0.5, 0.0,  
        -0.8, -0.4,  1.0, 0.5, 0.0,  
        -0.4, -0.4,  1.0, 0.5, 0.0,  

        // Jetnya orange
        0, -0.15,    -1.0, 0.5, 0.0,  
        0.2, -0.3,   1.0, 0.5, 0.0,  
        0.2, 0,      1.0, 0.5, 0.0,  

        // Badan Roket orange
        -0.4, 0.1,   1.0, 0.5, 0.0, 
        0.1, 0.1,    1.0, 0.5, 0.0,  
        -0.4, -0.4,  1.0, 0.5, 0.0, 

        0.1, -0.4,   1.0, 0.5, 0.0, 
        0.1, 0.1,    1.0, 0.5, 0.0,  
        -0.4, -0.4,  1.0, 0.5, 0.0, 

        // Jendela
        -0.4, 0,      1, 1, 1, 
        -0.7, -0.35,  0.5, 0.5, 0.5, 
        -0.4, -0.35,  1, 1, 1,  

        // Api Jet
        0.5, -0.15,   1, 0, 0, 
        0.2, -0.3,    1, 1, 0.0,  
        0.2, 0,       1, 1, 0.0, 

        0.5, -0.07,  1, 0, 0, 
        0.2, -0.3,   1, 1, 0.0, 
        0.2, 0,      1, 1, 0.0,  
    ];

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return vertexBuffer;
}

function createTransformationMatrix(scaleX, scaleY, rotation, translationX, translationY) {
    // Convert rotation to radians
    const rad = rotation * Math.PI / 180;
    const cosRad = Math.cos(rad);
    const sinRad = Math.sin(rad);

    // Create the 2D transformation matrix
    return [
        scaleX * cosRad, -sinRad, 0,
        sinRad, scaleY * cosRad, 0,
        translationX, translationY, 1
    ];
}

function drawScene(gl, shaderProgram, vertexBuffer, translationX, translationY, rotation, scaleX, scaleY) {
    const coordinates = gl.getAttribLocation(shaderProgram, "coordinates");
    const color = gl.getAttribLocation(shaderProgram, "color");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Each vertex has 2 coordinates (x, y) and 3 color values (r, g, b)
    const stride = 5 * Float32Array.BYTES_PER_ELEMENT; // 5 elements (x, y, r, g, b)

    // Set up the position attribute (first 2 elements are coordinates)
    gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(coordinates);

    // Set up the color attribute (next 3 elements are color values)
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(color);

    // Clear the canvas with a transparent background (alpha = 0)
    gl.clearColor(0.0, 0.0, 0.0, 0.0); // Fully transparent
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create and set the transformation matrix
    const transformationMatrix = createTransformationMatrix(scaleX, scaleY, rotation, translationX, translationY);
    gl.uniformMatrix3fv(shaderProgram.transformationMatrixUniform, false, new Float32Array(transformationMatrix));

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, 21);
}

// Main function to execute the WebGL rendering
function main() {
    const canvas = document.getElementById("c");
    canvas.width = 800;
    canvas.height = 600;

    const gl = initWebGL(canvas);
    if (!gl) return;

    const shaderProgram = initShaders(gl);
    const vertexBuffer = createTriangleBuffer(gl);

    const sliderX = document.getElementById("sliderX");
    const sliderY = document.getElementById("sliderY");
    const sliderRotation = document.getElementById("sliderRotation");
    const sliderScaleX = document.getElementById("sliderScaleX");
    const sliderScaleY = document.getElementById("sliderScaleY");
    
    const valueX = document.getElementById("valueX");
    const valueY = document.getElementById("valueY");
    const valueRotation = document.getElementById("valueRotation");
    const valueScaleX = document.getElementById("valueScaleX");
    const valueScaleY = document.getElementById("valueScaleY");

    function updateScene() {
        const translationX = parseFloat(sliderX.value);
        const translationY = parseFloat(sliderY.value);
        const rotation = parseFloat(sliderRotation.value);
        const scaleX = parseFloat(sliderScaleX.value);
        const scaleY = parseFloat(sliderScaleY.value);

        drawScene(gl, shaderProgram, vertexBuffer, translationX, translationY, rotation, scaleX, scaleY);

        valueX.textContent = sliderX.value;
        valueY.textContent = sliderY.value;
        valueRotation.textContent = sliderRotation.value;
        valueScaleX.textContent = sliderScaleX.value;
        valueScaleY.textContent = sliderScaleY.value;
    }

    sliderX.addEventListener("input", updateScene);
    sliderY.addEventListener("input", updateScene);
    sliderRotation.addEventListener("input", updateScene);
    sliderScaleX.addEventListener("input", updateScene);
    sliderScaleY.addEventListener("input", updateScene);

    // Initial draw
    updateScene();
}

// Execute the main function once the page loads
window.onload = main;
