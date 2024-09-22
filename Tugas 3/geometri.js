const canvas = document.getElementById("glcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL tidak didukung di browser Anda.");
}

let rotationSpeed = 0.5; 
let translateX = 0.0;
let translateY = 0.0;
let scaleValue = 1.0;
let rotateX = 0.0; 
let rotateY = 0.0; 

document.getElementById("rotationSpeed").addEventListener("input", (event) => {
  rotationSpeed = event.target.value / 100;
});

document.getElementById("translateX").addEventListener("input", (event) => {
  translateX = event.target.value / 50; 
});

document.getElementById("translateY").addEventListener("input", (event) => {
  translateY = event.target.value / 50;
});

document.getElementById("scale").addEventListener("input", (event) => {
  scaleValue = event.target.value / 50; 
});

document.getElementById("rotateX").addEventListener("input", (event) => {
  rotateX = (event.target.value * Math.PI) / 180; 
});

document.getElementById("rotateY").addEventListener("input", (event) => {
  rotateY = (event.target.value * Math.PI) / 180; 
});

let selectedShape = "cube";

document.getElementById("shapeSelect").addEventListener("change", (event) => {
  selectedShape = event.target.value;
  setupShapeBuffers();
});

let vertexBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer();
let vertexData, indexData;

function setupShapeBuffers() {
  if (selectedShape === "cube") {
    vertexData = new Float32Array([
      // X, Y, Z, U, V
      // Front
      -1.0, -1.0,  1.0,  0.0, 1.0,
       1.0, -1.0,  1.0,  1.0, 1.0,
       1.0,  1.0,  1.0,  1.0, 0.0,
      -1.0,  1.0,  1.0,  0.0, 0.0,
      // Back
      -1.0, -1.0, -1.0,  1.0, 1.0,
       1.0, -1.0, -1.0,  0.0, 1.0,
       1.0,  1.0, -1.0,  0.0, 0.0,
      -1.0,  1.0, -1.0,  1.0, 0.0,
    ]);

    indexData = new Uint16Array([
      0, 1, 2, 0, 2, 3,  // Front
      4, 5, 6, 4, 6, 7,  // Back
      0, 3, 7, 0, 7, 4,  // Left
      1, 2, 6, 1, 6, 5,  // Right
      3, 2, 6, 3, 6, 7,  // Top
      0, 1, 5, 0, 5, 4   // Bottom
    ]);
  } else if (selectedShape === "cone") {
    const slices = 32;
    const vertexCount = slices * 2 + 2;
    vertexData = new Float32Array(vertexCount * 5);
    indexData = [];
    
    // Apex
    vertexData.set([0, 1, 0, 0.5, 0], 0);
    
    // Base center
    vertexData.set([0, -1, 0, 0.5, 1], 5);
    
    for (let i = 0; i <= slices; i++) {
      const angle = (i / slices) * Math.PI * 2;
      const x = Math.cos(angle);
      const z = Math.sin(angle);
      const u = i / slices;
      
      // Base vertex
      vertexData.set([x, -1, z, u, 1], (i + 2) * 5);
      
      if (i < slices) {
        // Side face
        indexData.push(0, i + 2, i + 3);
        
        // Base triangle
        indexData.push(1, i + 3, i + 2);
      }
    }
    
    indexData = new Uint16Array(indexData);
  } else if (selectedShape === "pyramid") {
    vertexData = new Float32Array([
      // X, Y, Z, U, V
      // Base
      -1.0, -1.0, -1.0,  0.0, 1.0,
       1.0, -1.0, -1.0,  1.0, 1.0,
       1.0, -1.0,  1.0,  1.0, 0.0,
      -1.0, -1.0,  1.0,  0.0, 0.0,
      // Apex
       0.0,  1.0,  0.0,  0.5, 0.5
    ]);

    indexData = new Uint16Array([
      0, 1, 2, 0, 2, 3, // Base
      0, 4, 1, // Front face
      1, 4, 2, // Right face
      2, 4, 3, // Back face
      3, 4, 0  // Left face
    ]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
}

setupShapeBuffers();

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader: ", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexShaderSource = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uMatrix;
  varying vec2 vTexCoord;
  void main() {
    gl_Position = uMatrix * aPosition;
    vTexCoord = aTexCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  void main() {
    gl_FragColor = texture2D(uTexture, vTexCoord);
  }
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  console.error("Error linking program: ", gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

const positionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 5 * 4, 0);
gl.enableVertexAttribArray(positionLocation);

const texCoordLocation = gl.getAttribLocation(shaderProgram, "aTexCoord");
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
gl.enableVertexAttribArray(texCoordLocation);

// Texture setup
const texture = gl.createTexture();
const textureImage = document.getElementById("textureImage");

textureImage.onload = function() {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
};

function createMatrix() {
  const matrix = mat4.create();
  mat4.perspective(matrix, 45, canvas.width / canvas.height, 0.1, 100);
  mat4.translate(matrix, matrix, [translateX, translateY, -6]); 
  mat4.scale(matrix, matrix, [scaleValue, scaleValue, scaleValue]); 
  
  mat4.rotateX(matrix, matrix, rotateX); 
  mat4.rotateY(matrix, matrix, rotateY); 

  mat4.rotate(matrix, matrix, performance.now() / 1000 * rotationSpeed, [0, 1, 0]); 

  return matrix;
}

gl.viewport(0, 0, canvas.width, canvas.height);

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const matrix = createMatrix();
  const matrixLocation = gl.getUniformLocation(shaderProgram, "uMatrix");
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const textureLocation = gl.getUniformLocation(shaderProgram, "uTexture");
  gl.uniform1i(textureLocation, 0);

  gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(drawScene);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
drawScene();