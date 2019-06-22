class Brick {
    constructor() {
        this.color = { r: 1.0, g: 0.0, b: 0.0, a: 1.0 };
        this.transform = {
            scale: { x: 1.0, y: 1.0, z: 1.0 },
            position: { x: 0.0, y: 0.0, z: 0.0 },
            rotation: { x: 0.0, y: 0.0, z: 0.0 }
        }
    }
}

var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;

var gl;
var lightVector = {
    x: 1, y: 1, z: 1
};

var bricks = [];
var selectedIndex = 0;

function testGLError(functionLastCalled) {

    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var shaderProgram;

function initialiseBuffer() {

    var vertexData = [
        -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, //3
        0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 1.0, 0.0, //1
        0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0, 0.0, //2

        -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0, //3
        0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 1.0, 0.0, //2
        -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 0.0, //4

        0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 0.0, -1.0, //2
        0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, -1.0, //6
        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, -1.0, //8

        -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, -1.0, //4
        0.5, 0.5, -0.5, 1.0, 1.0, 0.0, 0.0, -1.0, //2
        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, -1.0, //8

        0.5, -0.5, 0.5, 0.0, 1.0, 1.0, 0.0, 0.0, //5
        0.5, -0.5, -0.5, 0.0, 1.0, 1.0, 0.0, 0.0, //6
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 0.0, 0.0, //2

        0.5, -0.5, 0.5, 0.0, 1.0, 1.0, 0.0, 0.0, //5
        0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 0.0, 0.0, //2
        0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 0.0, 0.0, //1

        -0.5, 0.5, -0.5, 0.0, 1.0, -1.0, 0.0, 0.0, //4
        -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.0, //8
        -0.5, -0.5, 0.5, 0.0, 0.0, -1.0, 0.0, 0.0, //7

        -0.5, 0.5, 0.5, 0.0, 1.0, -1.0, 0.0, 0.0, //3
        -0.5, 0.5, -0.5, 0.0, 1.0, -1.0, 0.0, 0.0, //4
        -0.5, -0.5, 0.5, 0.0, 0.0, -1.0, 0.0, 0.0, //7

        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0, //7
        0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.0, 1.0, //5
        0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 0.0, 1.0, //1

        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0, //7
        0.5, 0.5, 0.5, 1.0, 1.0, 0.0, 0.0, 1.0, //1
        -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 1.0, //3

        0.5, -0.5, -0.5, 1.0, 0.0, 0.0, -1.0, 0.0, //6
        0.5, -0.5, 0.5, 1.0, 0.0, 0.0, -1.0, 0.0, //5
        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, -1.0, 0.0, //7

        -0.5, -0.5, -0.5, 0.0, 0.0, 0.0, -1.0, 0.0, //8
        0.5, -0.5, -0.5, 1.0, 0.0, 0.0, -1.0, 0.0, //6
        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, -1.0, 0.0, //7
    ];

    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    // Bind buffer as a vertex buffer so we can fill it with data
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = '\
			varying mediump vec4 color; \
			void main(void) \
			{ \
				gl_FragColor = 1.0 * color;\
			}';

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    var vertexShaderSource = '\
			attribute highp vec3 myVertex; \
			attribute highp vec2 myUV; \
			attribute highp vec3 myNormal; \
            uniform highp vec4 brickColor; \
            uniform mediump mat4 Pmatrix; \
			uniform mediump mat4 Vmatrix; \
			uniform mediump mat4 Mmatrix; \
            uniform mediump mat4 Nmatrix; \
            uniform mediump vec3 lightVector; \
			varying mediump vec4 color; \
			varying mediump vec2 texCoord;\
			void main(void)  \
			{ \
				vec4 nN; \
				vec4 v1, v2, v3, v4; \
				vec3 v5; \
				v1 = Mmatrix * vec4(myVertex, 1.0); \
				v2 = Mmatrix * vec4(myVertex + myNormal, 1.0); \
				v1.xyz = v1.xyz / v1.w; \
				v2.xyz = v2.xyz / v2.w; \
				v3 = v2 - v1; \
				v5 = normalize(v3.xyz); \
				gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(myVertex, 1.0); \
				nN = Nmatrix * vec4(myNormal, 1.0); \
				color = brickColor * 0.5 * (dot(v5, lightVector) + 1.0); \
				color.a = brickColor.a; \
				texCoord = myUV; \
			}';

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    gl.programObject = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myUV");
    gl.bindAttribLocation(gl.programObject, 2, "myNormal");

    // Link the program
    gl.linkProgram(gl.programObject);

    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

// FOV, Aspect Ratio, Near, Far 
function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);//angle*.5
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0];
}

var proj_matrix = get_projection(30, 1.0, 1, 15.0);
var view_matrix = create$3();
// translating z
view_matrix[14] = view_matrix[14] - 4;//zoom

function multiply$3(out, a, b) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15]; // Cache only the current line of the second matrix

    var b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}

function create$3() {
    var out = new ARRAY_TYPE(16);

    if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
    }

    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
}

function translate$2(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
}


function rotateX(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
}

function rotateY(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
}

function rotateZ(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    } // Perform axis-specific matrix multiplication


    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
}

function scale$3(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

function normalizeVec3(v) {
    sq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    sq = Math.sqrt(sq);
    if (sq < 0.000001) // Too Small
        return -1;
    v[0] /= sq; v[1] /= sq; v[2] /= sq;
}

function rotateArbAxis(m, angle, axis) {
    var axis_rot = [0, 0, 0];
    var ux, uy, uz;
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var c1 = 1.0 - c;
    var s = Math.sin(angle);
    axis_rot[0] = axis[0];
    axis_rot[1] = axis[1];
    axis_rot[2] = axis[2];
    if (normalizeVec3(axis_rot) == -1)
        return -1;
    ux = axis_rot[0]; uy = axis_rot[1]; uz = axis_rot[2];
    console.log("Log", angle);
    rm[0] = c + ux * ux * c1;
    rm[1] = uy * ux * c1 + uz * s;
    rm[2] = uz * ux * c1 - uy * s;
    rm[3] = 0;

    rm[4] = ux * uy * c1 - uz * s;
    rm[5] = c + uy * uy * c1;
    rm[6] = uz * uy * c1 + ux * s;
    rm[7] = 0;

    rm[8] = ux * uz * c1 + uy * s;
    rm[9] = uy * uz * c1 - ux * s;
    rm[10] = c + uz * uz * c1;
    rm[11] = 0;

    rm[12] = 0;
    rm[13] = 0;
    rm[14] = 0;
    rm[15] = 1;

    multiply$3(m, m, rm);
}

rotValue = 0.0;
rotValueSmall = 0.0;
incRotValue = 0.0;
incRotValueSmall = 0.02;

transX = 0.0;
frames = 1;
tempRotValue = 0.0;
function stopRotate() {
    if (incRotValue == 0.0) {
        incRotValue = tempRotValue;
    }
    else {
        tempRotValue = incRotValue;
        incRotValue = 0.0;
    }
}

var time_old = 0;
function renderScene(time) {
    //console.log("Frame "+frames+"\n");
    frames += 1;

    var Pmatrix = gl.getUniformLocation(gl.programObject, "Pmatrix");
    var Vmatrix = gl.getUniformLocation(gl.programObject, "Vmatrix");
    var Mmatrix = gl.getUniformLocation(gl.programObject, "Mmatrix");
    var Nmatrix = gl.getUniformLocation(gl.programObject, "Nmatrix");
    var color_location = gl.getUniformLocation(gl.programObject, "brickColor");
    var lightVector_location = gl.getUniformLocation(gl.programObject, "lightVector");

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniform3fv(lightVector_location, [lightVector.x, lightVector.y, lightVector.z])

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 32, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, gl.FALSE, 32, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, gl.FALSE, 32, 20);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);

    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (i in bricks) {
        var brick = bricks[i]

        var brick_mov_matrix = create$3();
        scale$3(brick_mov_matrix, brick_mov_matrix,
            [
                brick.transform.scale.x,
                brick.transform.scale.y,
                brick.transform.scale.z
            ]
        );

        translate$2(brick_mov_matrix, brick_mov_matrix,
            [
                brick.transform.position.x,
                brick.transform.position.y,
                brick.transform.position.z
            ]);

        rotateY(brick_mov_matrix, brick_mov_matrix, brick.transform.rotation.y);
        rotateX(brick_mov_matrix, brick_mov_matrix, brick.transform.rotation.x);
        rotateZ(brick_mov_matrix, brick_mov_matrix, brick.transform.rotation.z);

        time_old = time;

        gl.uniformMatrix4fv(Mmatrix, false, brick_mov_matrix);
        var color = brick.color
        gl.uniform4fv(color_location, [color.r, color.g, color.b, color.a])
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var is_holding_left_shift = false;

var keyDown = function (e) {
    if (e.keyCode == 16) {
        is_holding_left_shift = true;
    }
};

var keyUp = function (e) {
    if (e.keyCode == 16) {
        is_holding_left_shift = false;
    }
};

var mouseDown = function (e) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function (e) {
    drag = false;
};

var mouseMove = function (e) {
    if (!drag) return false;
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width,
        dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    var brick = bricks[selectedIndex];
    if (is_holding_left_shift) {
        brick.transform.position.y += -dY;
        brick.transform.position.x += dX;
        document.getElementById("position_x").value = brick.transform.position.x;
        document.getElementById("position_y").value = brick.transform.position.y;
    } else {
        brick.transform.rotation.y += dX;
        brick.transform.rotation.x += dY;
        document.getElementById("rotation_x").value = brick.transform.rotation.x;
        document.getElementById("rotation_y").value = brick.transform.rotation.y;
    };
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};

function mouseWheel(e) {
    var delta = e.wheelDelta / 250;
    view_matrix[14] += delta;
}

function main() {
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    var canvas = document.getElementById("canvas");
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mousewheel", mouseWheel, false);
    addBrick();
    setOnInput();
    document.getElementById("light_x").value = lightVector.x;
    document.getElementById("light_y").value = lightVector.y;
    document.getElementById("light_z").value = lightVector.z;
    console.log("Start");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // Render loop
    requestAnimFrame = (
        function () {
            //	return window.requestAnimationFrame || window.webkitRequestAnimationFrame 
            //	|| window.mozRequestAnimationFrame || 
            return function (callback) {
                // console.log("Callback is"+callback); 
                window.setTimeout(callback, 10, 10);
            };
        })();

    (function renderLoop(param) {
        if (renderScene(param)) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}

function addBrick() {
    var brick = new Brick();
    bricks.push(brick);
    var brickButtonList = document.getElementById("brick_button_list");

    var brickButton = document.createElement("button");
    brickButton.innerHTML = "Brick" + bricks.length;
    selectBrick(brick);
    brickButton.onclick = function () {
        selectBrick(brick);
    }

    brickButtonList.appendChild(brickButton);
}

function selectBrick(brick) {
    selectedIndex = bricks.indexOf(brick);
    updateBrickInformation(brick)
}

function updateBrickInformation(brick) {
    document.getElementById("scale_x").value = brick.transform.scale.x;
    document.getElementById("scale_y").value = brick.transform.scale.y;
    document.getElementById("scale_z").value = brick.transform.scale.z;

    document.getElementById("position_x").value = brick.transform.position.x;
    document.getElementById("position_y").value = brick.transform.position.y;
    document.getElementById("position_z").value = brick.transform.position.z;

    document.getElementById("rotation_x").value = brick.transform.rotation.x;
    document.getElementById("rotation_y").value = brick.transform.rotation.y;
    document.getElementById("rotation_z").value = brick.transform.rotation.z;

    document.getElementById("color_r").value = brick.color.r;
    document.getElementById("color_g").value = brick.color.g;
    document.getElementById("color_b").value = brick.color.b;
    document.getElementById("color_a").value = brick.color.a;
}

function setOnInput() {
    var scale_x = document.getElementById("scale_x");
    scale_x.oninput = function () {
        bricks[selectedIndex].transform.scale.x = scale_x.value;
    };
    var scale_y = document.getElementById("scale_y");
    scale_y.oninput = function () {
        bricks[selectedIndex].transform.scale.y = scale_y.value;
    };
    var scale_z = document.getElementById("scale_z");
    scale_z.oninput = function () {
        bricks[selectedIndex].transform.scale.z = scale_z.value;
    };

    var position_x = document.getElementById("position_x");
    position_x.oninput = function () {
        bricks[selectedIndex].transform.position.x = position_x.value;
    };
    var position_y = document.getElementById("position_y");
    position_y.oninput = function () {
        bricks[selectedIndex].transform.position.y = position_y.value;
    };
    var position_z = document.getElementById("position_z");
    position_z.oninput = function () {
        bricks[selectedIndex].transform.position.z = position_z.value;
    };

    var rotation_x = document.getElementById("rotation_x");
    rotation_x.oninput = function () {
        bricks[selectedIndex].transform.rotation.x = rotation_x.value;
    };
    var rotation_y = document.getElementById("rotation_y");
    rotation_y.oninput = function () {
        bricks[selectedIndex].transform.rotation.y = rotation_y.value;
    };
    var rotation_z = document.getElementById("rotation_z");
    rotation_z.oninput = function () {
        bricks[selectedIndex].transform.rotation.z = rotation_z.value;
    };

    var color_r = document.getElementById("color_r");
    color_r.oninput = function () {
        bricks[selectedIndex].color.r = color_r.value;
    };
    var color_g = document.getElementById("color_g");
    color_g.oninput = function () {
        bricks[selectedIndex].color.g = color_g.value;
    };
    var color_b = document.getElementById("color_b");
    color_b.oninput = function () {
        bricks[selectedIndex].color.b = color_b.value;
    };
    var color_a = document.getElementById("color_a");
    color_a.oninput = function () {
        bricks[selectedIndex].color.a = color_a.value;
    };

    var light_x = document.getElementById("light_x");
    light_x.oninput = function () {
        lightVector.x = light_x.value;
    }
    var light_y = document.getElementById("light_y");
    light_y.oninput = function () {
        lightVector.y = light_y.value;
    }
    var light_z = document.getElementById("light_z");
    light_z.oninput = function () {
        lightVector.z = light_z.value;
    }
}