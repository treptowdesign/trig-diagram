/////////////////////////////////////////////////////////////////////
// Setup
/////////////////////////////////////////////////////////////////////

const ratio = window.devicePixelRatio || 1;

const figEl = document.getElementById('figureUnitCircle');
const width = figEl.offsetWidth;
const height = figEl.offsetWidth;
const canvas = document.getElementById('unitCircleCanvas'); 
const ctx = canvas.getContext('2d');

canvas.width = width * ratio;
canvas.height = height * ratio;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(ratio, ratio); 
ctx.font = '600 14px "Noto Serif"';

const centerX = (canvas.width / 2) / ratio;
const centerY = (canvas.height / 2) / ratio; 
const radius = (canvas.width / 6) / ratio;

// Mouse States (to be updated by events)
let mousePos = {x: 0, y: 0};
let isMouseDown = false;

// 2nd canvas
const figEl2 = document.getElementById('figureWaveGraph');
const width2 = figEl2.offsetWidth;
const height2 = figEl2.offsetWidth;
const canvas2 = document.getElementById('waveGraph'); 
const ctx2 = canvas2.getContext('2d');

canvas2.width = width2 * ratio;
canvas2.height = height2 * ratio;
canvas2.style.width = width + 'px';
canvas2.style.height = height + 'px';
ctx2.scale(ratio, ratio); 
ctx2.font = '600 14px "Noto Serif"';

// Colors 
const colors = {
    gray: '#7a909e',
    grayMed: '#1d2933',
    grayDark: '#2d3b47',
    purple: '#ac71f0',
    green: '#16a163',
    orange: '#fc9162',
    red: '#fa5343',
    teal: '#279c9c',
    pink: '#ed4cb7'
};


/////////////////////////////////////////////////////////////////////
// Helper Functions
/////////////////////////////////////////////////////////////////////

function getAngleTheta(){
    return Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
}

function radiansToDegrees(angle){ 
    // convert: x = angle * (180 / Math.PI); 
    // make positive: (x + 360) % 360;
    // im not actually using this anywhere
    // everything is in radians
    return (angle * (180 / Math.PI) + 360) % 360;
}

// function to round to 4 decimals, hardcoded @ 4 for now
function roundDec(val){
    return Math.round(val * 10000) / 10000;
}

/////////////////////////////////////////////////////////////////////
// Draw Functions 
/////////////////////////////////////////////////////////////////////

function drawGrid() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.gray; 
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i <= canvas.width; i += radius) {
        ctx.beginPath();
        ctx.setLineDash([]); 
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    for (let i = (radius/2); i < canvas.width; i += radius) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]); 
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#111'; 
}

function drawUnitCircle({ color = '#111'} = {}){
    ctx.lineWidth = 3;
    ctx.strokeStyle = color; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLine(start, end, color){
    ctx.lineWidth = 3;
    ctx.strokeStyle = color; 
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = '#111'; 
}

function drawPoint(point){
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI); 
    ctx.fill();
}

function drawAngleArcs({ angle = 0, cosX = 0 } = {}){
    let thetaArc = {start: 0, end: 0}; // theta start & end
    let raOffset = {x: 0, y: 0}; // right angle offset x & y
    // adjust values based on unit circle quadrant 
    if (angle < (-Math.PI / 2)) {
        [thetaArc.start, thetaArc.end] = [-Math.PI, angle]; 
        raOffset = {x: 8, y: -8};
    } else if (angle < 0) {
        [thetaArc.start, thetaArc.end] = [angle, 0]; 
        raOffset = {x: -8, y: -8};
    } else if (angle < (Math.PI / 2)) {
        [thetaArc.start, thetaArc.end] = [0, angle]; 
        raOffset = {x: -8, y: 8};
    } else {
        [thetaArc.start, thetaArc.end] = [angle, (Math.PI)]; 
        raOffset = {x: 8, y: 8};
    }
    // Theta Angle Arc
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff'; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, thetaArc.start, thetaArc.end);
    ctx.stroke();
    // Right Angle Marker
    ctx.strokeStyle = colors.red; 
    ctx.beginPath();
    ctx.moveTo(cosX, centerY + raOffset.y); 
    ctx.lineTo(cosX + raOffset.x, centerY + raOffset.y); 
    ctx.moveTo(cosX + raOffset.x, centerY + raOffset.y); 
    ctx.lineTo(cosX + raOffset.x, centerY); 
    ctx.stroke();
}

function displayValues({vals = {}, theta = 0} = {}){
    ctx.fillStyle = colors.purple;
    ctx.fillText('Sin: '+roundDec(vals.sin), 10, 20);
    ctx.fillStyle = colors.green;
    ctx.fillText('Cos: '+roundDec(vals.cos), 10, 40);
    ctx.fillStyle = colors.orange;
    ctx.fillText('Tan: '+roundDec(vals.tan), 10, 60);
    ctx.fillStyle = colors.teal;
    ctx.fillText('Sec: '+roundDec(vals.sec), 10, 100);
    ctx.fillStyle = colors.pink;
    ctx.fillText('Csc: '+roundDec(vals.csc), 10, 80);
    ctx.fillStyle = colors.red;
    ctx.fillText('Cot: '+roundDec(vals.cot), 10, 120);
    ctx.fillStyle = '#fff'; 
    ctx.fillText('Theta: '+roundDec(theta), 10, canvas.height - 20);
    // ctx.fillText('Theta: '+roundDec(theta < 0 ? -theta + Math.PI : theta), 10, canvas.height - 20);
    // ctx.fillText('Theta: '+(theta + Math.PI), 10, canvas.height - 20);
    // unit circle has negative radians, fn graph does not - need to reconcile 
}



/////////////////////////////////////////////////////////////////////
// Draw Function Graph (starting with Sine)
/////////////////////////////////////////////////////////////////////

function drawFnGraph({theta = 0} = {}){
    const graphXmin = 0;
    const graphXmax = canvas2.width;
    const graphYmin = radius * 2;
    const graphYmax = radius * 4;
    const graphWidth = graphXmax - graphXmin;
    const graphHeight = graphYmax - graphYmin;
    const graphCenterX = graphXmin + (graphWidth / 2);
    const graphCenterY = graphYmin + (graphHeight / 2);
    const textOffset = radius / 22;
    const labelText = {
        0: ' ',
        1: ' 2',
        2: ' 1',
        3: ' 0',
        4: '-1',
        5: '-2',
        6: ' ',
    };

    // clear set initial ctx settings
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    ////////////////////////////////////////////////////
    // Cosine Wave
    let dotNum = 100;
    let dotDist = graphWidth / dotNum;
    ctx2.globalAlpha = 0.6;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        // ctx2.fillStyle = colors.gray;
        ctx2.fillStyle = colors.green;
        ctx2.arc(graphXmin + i, graphCenterY + (Math.cos(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    ctx.globalAlpha = 1;
    ////////////////////////////////////////////////////
    // Sine Wave
    dotNum = 100;
    dotDist = graphWidth / dotNum;
    ctx2.globalAlpha = 0.6;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        // ctx2.fillStyle = colors.gray; 
        ctx2.fillStyle = colors.purple; 
        ctx2.arc(graphXmin + i, graphCenterY + (Math.sin(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    ctx2.globalAlpha = 1;
    ////////////////////////////////////////////////////
    // Tan Wave
    dotNum = 200;
    dotDist = graphWidth / dotNum;
    ctx2.globalAlpha = 0.6;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        // ctx2.fillStyle = colors.gray; 
        ctx2.fillStyle = colors.orange; 
        ctx2.arc(graphXmin + i, graphCenterY - (Math.tan(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    ctx2.globalAlpha = 1;
    ////////////////////////////////////////////////////
    // Tan dot
    ctx2.beginPath();
    ctx2.fillStyle = colors.orange; 
    ctx2.strokeStyle = '#fff';
    ctx2.lineWidth = 1;
    ctx2.arc(graphCenterX, graphCenterY + (Math.tan(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // Sec Wave
    dotNum = 200;
    dotDist = graphWidth / dotNum;
    ctx2.globalAlpha = 0.6;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        // ctx2.fillStyle = colors.gray; 
        ctx2.fillStyle = colors.teal; 
        ctx2.arc(graphXmin + i, graphCenterY + (1 / Math.cos(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    ctx2.globalAlpha = 1;
    ////////////////////////////////////////////////////
    // Sec dot
    ctx2.beginPath();
    ctx2.fillStyle = colors.teal; 
    ctx2.strokeStyle = '#fff';
    ctx2.lineWidth = 1;
    ctx2.arc(graphCenterX, graphCenterY - (1 / Math.cos(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // Cosine dot
    ctx2.beginPath();
    ctx2.fillStyle = colors.green; 
    ctx2.strokeStyle = '#fff';
    ctx2.lineWidth = 1;
    ctx2.arc(graphCenterX, graphCenterY + (-Math.cos(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // Sine dot
    ctx2.beginPath();
    ctx2.fillStyle = colors.purple; 
    ctx2.strokeStyle = '#fff';
    ctx2.lineWidth = 1;
    ctx2.arc(graphCenterX, graphCenterY + (Math.sin(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // Draw Xpi line...
    function piToX({pi = 0} = {}) {
        return ((theta + (pi * Math.PI)) + (Math.PI)) / (Math.PI * 2);
        // theta + pi makes it 0 - 2pi positive instead of -pi -> pi so we can divide by 2pi and get a percentage for x-value
        // (pi * Math.PI) is an offset for how far along the unit circle you are
    }
    ctx2.setLineDash([5, 5]);
    for (let i = 0; i <= 1.5; i += 0.5) {
        const lineX = (canvas2.width * piToX({pi: i}) % canvas2.width);
        ctx2.globalAlpha = 0.3;
        ctx2.strokeStyle = colors.gray; 
        ctx2.beginPath();
        ctx2.moveTo(lineX, canvas2.height - radius);
        ctx2.lineTo(lineX, canvas2.height);
        ctx2.stroke();
        // draw pilabel
        ctx2.globalAlpha = 1;
        ctx2.fillStyle = '#fff'; 
        ctx2.fillText(i+'pi', lineX - 10, canvas2.height - 20); 
    }
    ctx2.setLineDash([]);
    ////////////////////////////////////////////////////
    // X-Axis Gridlines
    let gridIndex = 0;
    for (let i = 0; i <= canvas2.height; i += radius) {
        ctx2.lineWidth = 1;
        if(gridIndex == 2 || gridIndex == 4){
            ctx2.lineWidth = 2;
        }
        ctx2.globalAlpha = 0.3;
        ctx2.strokeStyle = colors.gray; 
        // draw line path
        ctx2.beginPath();
        ctx2.setLineDash([5, 5]);
        ctx2.moveTo(0, i);
        ctx2.lineTo(canvas2.width, i);
        ctx2.stroke();
        // draw num label
        ctx2.globalAlpha = 1;
        ctx2.fillStyle = '#fff'; 
        ctx2.fillText(labelText[gridIndex], radius * 0.65, i + textOffset); 
        gridIndex++;
    }
    // Draw Theta line at Center 
    ctx2.globalAlpha = 0.3;
    ctx2.strokeStyle = colors.gray; 
    ctx2.setLineDash([]);
    ctx2.beginPath();
    ctx2.moveTo(canvas2.width / 2 , 0);
    ctx2.lineTo(canvas2.width / 2, canvas2.height);
    ctx2.stroke();
    // reset draw settings
    ctx2.globalAlpha = 1;
    ctx2.setLineDash([]);
    ctx2.lineWidth = 3;
    ctx2.strokeStyle = '#fff'; 
    // Graph Bar Y
    ctx2.beginPath();
    ctx2.moveTo(radius, 0);
    ctx2.lineTo(radius, canvas2.height);
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // reset
    ctx2.setLineDash([]);
    ctx2.fillStyle = '#111';
    ctx2.strokeStyle = '#111'; 
}

/////////////////////////////////////////////////////////////////////
// Main Update Function
/////////////////////////////////////////////////////////////////////

function updateDraw({ angle = 0 } = {}){
    console.log('Theta: ', angle);
    // calc trig function values
    const vals = {
        sin: Math.sin(angle),
        cos: Math.cos(angle),
        tan: Math.tan(angle),
        sec: (1 / Math.cos(angle)),
        csc: (1 / Math.sin(angle)),
        cot: (1 / Math.tan(angle))
    }
    // get points from values
    const pointX = centerX + (radius * vals.cos);
    const pointY = centerY + (radius * vals.sin);
    const secantX = centerX + (radius * vals.sec);
    const cosecantY = centerY + (radius * vals.csc);
    // clear 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw grid and unit circle
    drawGrid();
    drawUnitCircle({color: (isMouseDown ? colors.gray : '#fff')});
    // draw sine of theta
    drawLine({x: pointX, y: pointY}, {x: pointX, y: centerY}, colors.purple);
    // draw cosine of theta
    drawLine({x: pointX, y: pointY}, {x: centerX, y: pointY}, colors.green);
    // draw tangent of theta (uses the secantX)
    drawLine({x: pointX, y: pointY}, {x: secantX, y: centerY}, colors.orange); 
    // draw secant of theta
    drawLine({x: centerX, y: centerY}, {x: secantX, y: centerY}, colors.teal);
    // draw cotangent of theta (uses the cosecantY)
    drawLine({x: pointX, y: pointY}, {x: centerX, y: cosecantY}, colors.red); 
    // draw cosecant of theta
    drawLine({x: centerX, y: centerY}, {x: centerX, y: cosecantY}, colors.pink); 
    // draw arctan (main angle line)
    drawLine({x: centerX, y: centerY}, {x: pointX, y: pointY}, '#fff'); 
    // draw tangent point
    drawPoint({x: secantX, y: centerY});
    // draw cotangent point
    drawPoint({x: centerX, y: cosecantY});
    // draw center point
    drawPoint({x: centerX, y: centerY});
    // draw intersection point
    drawPoint({x: pointX, y: pointY});
    // theta arc 
    drawAngleArcs({angle: angle, cosX: pointX});
    // display values via text
    displayValues({vals: vals, theta: angle});


    /////////////////////////////////////////////////////////////////////
    // function graph - Canvas2
    drawFnGraph({theta: angle});
}

/////////////////////////////////////////////////////////////////////
// Initializing
/////////////////////////////////////////////////////////////////////

const initAngle = -1 * (Math.PI / 4);
updateDraw({angle: initAngle});

WebFont.load({
    google: {
    families: ['PT Serif:400,700']
    },
    active: function() {
        updateDraw({angle: initAngle}); // redrawing to make font render
    }
});

/////////////////////////////////////////////////////////////////////
// Mouse Events
/////////////////////////////////////////////////////////////////////

canvas.addEventListener('mousedown', function(event) {
    isMouseDown = true;
    updateDraw({angle: getAngleTheta()});
});

canvas.addEventListener('mouseup', function(event) {
    isMouseDown = false;
    updateDraw({angle: getAngleTheta()});
});

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    if(isMouseDown){
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;
        updateDraw({angle: getAngleTheta()});
    }
});


















// end file
