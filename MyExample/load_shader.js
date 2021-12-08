var load_shader = function() {
  var self = this;

  self.loadVertexShader = function(gl, id) {
    const vertexShaderScript = document.getElementById(id);
    if (!vertexShaderScript) {
      throw ('*** Error: unknown script element' + "vertex-shader-3d");
    }
    let vertexShaderSource = vertexShaderScript.text;

    // Create the shader object
    const shader = gl.createShader(gl.VERTEX_SHADER);

    // Load the shader source
    gl.shaderSource(shader, vertexShaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      console.log('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + shaderSource.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  self.loadFragmentShader = function(gl, id) {
    const fragmentShaderScript = document.getElementById(id);
    if (!fragmentShaderScript) {
      throw ('*** Error: unknown script element' + "fragment-shader-3d");
    }
    let fragmentShaderSource = fragmentShaderScript.text;

    // Create the shader object
    const shader = gl.createShader(gl.FRAGMENT_SHADER);

    // Load the shader source
    gl.shaderSource(shader, fragmentShaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      console.log('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + shaderSource.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  self.createProgram = function (gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  };
};