const vertexShaderSource = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;
  v_normal = mat3(u_normalMatrix) * a_normal;
  v_texcoord = a_texcoord;
}`;

const fragmentShaderSource = `
precision mediump float;

uniform vec3 u_reverseLightDirection;
uniform sampler2D u_texture;

varying vec3 v_normal;
varying vec2 v_texcoord;

void main() {
  vec3 normal = normalize(v_normal);
  float light = dot(normal, u_reverseLightDirection);
  vec4 color = texture2D(u_texture, v_texcoord);
  gl_FragColor = color * light;
}`;

// Utility to create shaders
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Utility to create WebGL programs
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Create perspective matrix
function createPerspectiveMatrix(fieldOfView, aspect, near, far) {
  const f = 1.0 / Math.tan(fieldOfView / 2);
  const rangeInv = 1 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0,
  ];
}

// Create orthographic matrix
function createOrthographicMatrix(left, right, bottom, top, near, far) {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  return [
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1,
  ];
}

// Load texture
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// Set up the buffer for the cube
function setCubeGeometry(gl) {
  const positions = new Float32Array([
    // Front face
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1,

    // Back face
    -1, -1, -1,
    -1,  1, -1,
     1,  1, -1,
     1, -1, -1,

    // Top face
    -1,  1, -1,
    -1,  1,  1,
     1,  1,  1,
     1,  1, -1,

    // Bottom face
    -1, -1, -1,
     1, -1, -1,
     1, -1,  1,
    -1, -1,  1,

    // Right face
     1, -1, -1,
     1,  1, -1,
     1,  1,  1,
     1, -1,  1,

    // Left face
    -1, -1, -1,
    -1, -1,  1,
    -1,  1,  1,
    -1,  1, -1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Define your pyramid, cone and lathe shapes similarly here

// Animation loop
function render(time) {
  // ...set up camera, draw geometry, apply textures and lighting
  requestAnimationFrame(render);
}

// Main execution
function main() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  
  gl.useProgram(program);

  // Set up geometry for shapes
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setCubeGeometry(gl);

  // Set up texture, lighting, etc.
  const texture = loadTexture(gl, "texture.png"); // Placeholder texture

  // Begin animation loop
  requestAnimationFrame(render);
}

main();
