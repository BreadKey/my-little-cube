class Brick {
    constructor() {
        this.color = {r: 1.0, g: 0.0, b: 0.0, a: 1.0};
        this.transform = {
            scale: {x: 1.0, y: 1.0, z: 1.0},
            position: {x: 0.0, y: 0.0, z: 0.0},
            rotation: {x: 0.0, y: 0.0, z: 0.0}
        }
    }
}

var gl;

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
        -0.5, 0.5, 0.5,  0.0, 1.0, 0.0, 1.0, 0.0, //3
        0.5, 0.5, 0.5,  1.0, 1.0, 0.0, 1.0, 0.0, //1
        0.5, 0.5, -0.5,  1.0, 1.0, 0.0, 1.0, 0.0, //2

        -0.5, 0.5, 0.5,  0.0, 1.0, 0.0, 1.0, 0.0, //3
        0.5, 0.5, -0.5,  1.0, 1.0, 0.0, 1.0, 0.0, //2
        -0.5, 0.5, -0.5,  0.0, 1.0, 0.0, 1.0, 0.0, //4

        0.5, 0.5, -0.5,  1.0, 1.0, 0.0, 0.0, -1.0, //2
        0.5, -0.5, -0.5,  1.0, 0.0, 0.0, 0.0, -1.0, //6
        -0.5, -0.5, -0.5,  0.0, 0.0, 0.0, 0.0, -1.0, //8

        -0.5, 0.5, -0.5,  0.0, 1.0, 0.0, 0.0, -1.0, //4
        0.5, 0.5, -0.5,  1.0, 1.0, 0.0, 0.0, -1.0, //2
        -0.5, -0.5, -0.5,  0.0, 0.0, 0.0, 0.0, -1.0, //8

        0.5, -0.5, 0.5,  0.0, 1.0, 1.0, 0.0, 0.0, //5
        0.5, -0.5, -0.5,  0.0, 1.0, 1.0, 0.0, 0.0, //6
        0.5, 0.5, -0.5,  1.0, 1.0, 1.0, 0.0, 0.0, //2

        0.5, -0.5, 0.5,  0.0, 1.0, 1.0, 0.0, 0.0, //5
        0.5, 0.5, -0.5,  1.0, 1.0, 1.0, 0.0, 0.0, //2
        0.5, 0.5, 0.5,  1.0, 1.0, 1.0, 0.0, 0.0, //1

        -0.5, 0.5, -0.5,  0.0, 1.0, -1.0, 0.0, 0.0, //4
        -0.5, -0.5, -0.5,  0.0, 0.0, -1.0, 0.0, 0.0, //8
        -0.5, -0.5, 0.5,  0.0, 0.0, -1.0, 0.0, 0.0, //7

        -0.5, 0.5, 0.5,  0.0, 1.0, -1.0, 0.0, 0.0, //3
        -0.5, 0.5, -0.5,  0.0, 1.0, -1.0, 0.0, 0.0, //4
        -0.5, -0.5, 0.5,  0.0, 0.0, -1.0, 0.0, 0.0, //7

        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0, //7
        0.5, -0.5, 0.5,  1.0, 0.0, 0.0, 0.0, 1.0, //5
        0.5, 0.5, 0.5,  1.0, 1.0, 0.0, 0.0, 1.0, //1

        -0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0, //7
        0.5, 0.5, 0.5,  1.0, 1.0, 0.0, 0.0, 1.0, //1
        -0.5, 0.5, 0.5,  0.0, 1.0, 0.0, 0.0, 1.0, //3

        0.5, -0.5, -0.5,  1.0, 0.0, 0.0, -1.0, 0.0, //6
        0.5, -0.5, 0.5,  1.0, 0.0, 0.0, -1.0, 0.0, //5
        -0.5, -0.5, 0.5,  0.0, 0.0, 0.0, -1.0, 0.0, //7

        -0.5, -0.5, -0.5,  0.0, 0.0, 0.0, -1.0, 0.0, //8
        0.5, -0.5, -0.5,  1.0, 0.0, 0.0, -1.0, 0.0, //6
        -0.5, -0.5, 0.5,  0.0, 0.0, 0.0, -1.0, 0.0, //7
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
				color = brickColor * 0.5 * (dot(v5, vec3(0, 0, 1)) + 1.0); \
				color.a = 1.0; \
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

var proj_matrix = get_projection(30, 1.0, 1, 8.0);
var mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// translating z
view_matrix[14] = view_matrix[14] - 4;//zoom

function idMatrix(m) {
    m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
}

function mulStoreMatrix(r, m, k) {
    m0 = m[0]; m1 = m[1]; m2 = m[2]; m3 = m[3]; m4 = m[4]; m5 = m[5]; m6 = m[6]; m7 = m[7];
    m8 = m[8]; m9 = m[9]; m10 = m[10]; m11 = m[11]; m12 = m[12]; m13 = m[13]; m14 = m[14]; m15 = m[15];
    k0 = k[0]; k1 = k[1]; k2 = k[2]; k3 = k[3]; k4 = k[4]; k5 = k[5]; k6 = k[6]; k7 = k[7];
    k8 = k[8]; k9 = k[9]; k10 = k[10]; k11 = k[11]; k12 = k[12]; k13 = k[13]; k14 = k[14]; k15 = k[15];

    a0 = k0 * m0 + k3 * m12 + k1 * m4 + k2 * m8;
    a4 = k4 * m0 + k7 * m12 + k5 * m4 + k6 * m8;
    a8 = k8 * m0 + k11 * m12 + k9 * m4 + k10 * m8;
    a12 = k12 * m0 + k15 * m12 + k13 * m4 + k14 * m8;

    a1 = k0 * m1 + k3 * m13 + k1 * m5 + k2 * m9;
    a5 = k4 * m1 + k7 * m13 + k5 * m5 + k6 * m9;
    a9 = k8 * m1 + k11 * m13 + k9 * m5 + k10 * m9;
    a13 = k12 * m1 + k15 * m13 + k13 * m5 + k14 * m9;

    a2 = k2 * m10 + k3 * m14 + k0 * m2 + k1 * m6;
    a6 = k6 * m10 + k7 * m14 + k4 * m2 + k5 * m6;
    a10 = k10 * m10 + k11 * m14 + k8 * m2 + k9 * m6;
    a14 = k14 * m10 + k15 * m14 + k12 * m2 + k13 * m6;

    a3 = k2 * m11 + k3 * m15 + k0 * m3 + k1 * m7;
    a7 = k6 * m11 + k7 * m15 + k4 * m3 + k5 * m7;
    a11 = k10 * m11 + k11 * m15 + k8 * m3 + k9 * m7;
    a15 = k14 * m11 + k15 * m15 + k12 * m3 + k13 * m7;

    r[0] = a0; r[1] = a1; r[2] = a2; r[3] = a3; r[4] = a4; r[5] = a5; r[6] = a6; r[7] = a7;
    r[8] = a8; r[9] = a9; r[10] = a10; r[11] = a11; r[12] = a12; r[13] = a13; r[14] = a14; r[15] = a15;
}

function mulMatrix(m, k) {
    mulStoreMatrix(m, m, k);
}

function translate(m, tx, ty, tz) {
    var tm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    tm[12] = tx; tm[13] = ty; tm[14] = tz;
    mulMatrix(m, tm);
}


function rotateX(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[5] = c; rm[6] = s;
    rm[9] = -s; rm[10] = c;
    mulMatrix(m, rm);
}

function rotateY(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[0] = c; rm[2] = -s;
    rm[8] = s; rm[10] = c;
    mulMatrix(m, rm);
}

function rotateZ(m, angle) {
    var rm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    rm[0] = c; rm[1] = s;
    rm[4] = -s; rm[5] = c;
    mulMatrix(m, rm);
}

function scale(m, sx, sy, sz) {
    var rm = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
    mulMatrix(m, rm);
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

    mulMatrix(m, rm);
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

    idMatrix(mov_matrix);
    
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
 
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
        brick_mov_matrix = mov_matrix.slice();

        scale(brick_mov_matrix,
            brick.transform.scale.x,
            brick.transform.scale.y,
            brick.transform.scale.z,
        )
        translate(brick_mov_matrix, 
            brick.transform.position.x, 
            brick.transform.position.y, 
            brick.transform.position.z);
   
        rotateY(brick_mov_matrix, brick.transform.rotation.y);
        rotateX(brick_mov_matrix, brick.transform.rotation.x);
        rotateZ(brick_mov_matrix, brick.transform.rotation.z);

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

var keyDown = function(e) {
    if (e.keyCode == 16) {
        is_holding_left_shift = true;
    }
};

var keyUp = function(e) {
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
    if (is_holding_left_shift) {
        bricks[selectedIndex].transform.position.y += -dY;
        bricks[selectedIndex].transform.position.x += dX;
    } else {
        bricks[selectedIndex].transform.rotation.y += dX;
        bricks[selectedIndex].transform.rotation.x += dY;
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
    addBrick()
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
    brickButton.onclick = function() {
        selectedIndex = bricks.indexOf(brick);
    }
    
    brickButtonList.appendChild(brickButton);
}