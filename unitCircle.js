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

/////////////////////////////////////////////////////////////////////
// Draw Functions 
/////////////////////////////////////////////////////////////////////

function drawGrid() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ddd'; 
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
    ctx.strokeStyle = '#111'; 
}

function drawUnitCircle({ color = '#111'} = {}){
    ctx.lineWidth = 2;
    ctx.strokeStyle = color; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLine(start, end, color){
    ctx.lineWidth = 2;
    ctx.strokeStyle = color; 
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = '#111'; 
}

function drawPoint(point){
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI); 
    ctx.fill();
}

function drawAngleArcs({ angle = 0, cosX = 0 } = {}){
    let thetaArc = {start: 0, end: 0}; // theta start & end
    let raOffset = {x: 0, y: 0}; // right angle offset x & y
    // adjust values based on unit circle quadrant 
    if (angle < (-Math.PI / 2)) {
        [thetaArc.start, thetaArc.end] = [-Math.PI, angle]; 
        raOffset = {x: 6, y: -6};
    } else if (angle < 0) {
        [thetaArc.start, thetaArc.end] = [angle, 0]; 
        raOffset = {x: -6, y: -6};
    } else if (angle < (Math.PI / 2)) {
        [thetaArc.start, thetaArc.end] = [0, angle]; 
        raOffset = {x: -6, y: 6};
    } else {
        [thetaArc.start, thetaArc.end] = [angle, (Math.PI)]; 
        raOffset = {x: 6, y: 6};
    }
    // Theta Angle Arc
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#111'; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, thetaArc.start, thetaArc.end);
    ctx.stroke();
    // Right Angle Marker
    ctx.strokeStyle = 'red'; 
    ctx.beginPath();
    ctx.moveTo(cosX, centerY + raOffset.y); 
    ctx.lineTo(cosX + raOffset.x, centerY + raOffset.y); 
    ctx.moveTo(cosX + raOffset.x, centerY + raOffset.y); 
    ctx.lineTo(cosX + raOffset.x, centerY); 
    ctx.stroke();
}

function displayValues(vals){
    ctx.fillStyle = 'purple';
    ctx.fillText('Sin: '+(vals.sin), 10, 20);
    ctx.fillStyle = 'green';
    ctx.fillText('Cos: '+(vals.cos), 10, 40);
    ctx.fillStyle = 'orange';
    ctx.fillText('Tan: '+(vals.tan), 10, 60);
    ctx.fillStyle = 'pink';
    ctx.fillText('Csc: '+(vals.csc), 10, 80);
    ctx.fillStyle = 'cyan';
    ctx.fillText('Sec: '+(vals.sec), 10, 100);
    ctx.fillStyle = 'red';
    ctx.fillText('Cot: '+(vals.cot), 10, 120);
    ctx.fillStyle = '#111';
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
    drawUnitCircle({color: (isMouseDown ? '#999' : '#111')});
    // draw sine of theta
    drawLine({x: pointX, y: pointY}, {x: pointX, y: centerY}, 'purple');
    // draw cosine of theta
    drawLine({x: pointX, y: pointY}, {x: centerX, y: pointY}, 'green');
    // draw tangent of theta (uses the secantX)
    drawLine({x: pointX, y: pointY}, {x: secantX, y: centerY}, 'orange'); 
    // draw secant of theta
    drawLine({x: centerX, y: centerY}, {x: secantX, y: centerY}, 'cyan');
    // draw cotangent of theta (uses the cosecantY)
    drawLine({x: pointX, y: pointY}, {x: centerX, y: cosecantY}, 'red'); 
    // draw cosecant of theta
    drawLine({x: centerX, y: centerY}, {x: centerX, y: cosecantY}, 'pink'); 
    // draw arctan (main angle line)
    drawLine({x: centerX, y: centerY}, {x: pointX, y: pointY}, 'black'); 
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
    displayValues(vals);

    // function graph 
    // drawFnGraph({sin: vals.sin * radius});
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
// Draw Function Graph (starting with Sine)
/////////////////////////////////////////////////////////////////////

function drawFnGraph({theta = 0} = {}){

    const graphXmin = radius;
    const graphXmax = radius * 5;
    const graphYmin = radius * 2;
    const graphYmax = radius * 4;
    const graphWidth = graphXmax - graphXmin;
    const graphHeight= graphYmax - graphYmin;
    const graphCenterX = graphXmin + (graphWidth / 2);
    const graphCenterY = graphYmin + (graphHeight / 2);

    // clear 
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    // set vals
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = '#111'; 
    // Graph Line Y
    ctx2.beginPath();
    ctx2.moveTo(graphXmin, graphYmin);
    ctx2.lineTo(graphXmin, graphYmax);
    ctx2.stroke();
    // Graph Line X
    ctx2.beginPath();
    ctx2.moveTo(graphXmin, graphYmax);
    ctx2.lineTo(graphXmax, graphYmax);
    ctx2.stroke();
    // Graph Line 0 (middle)
    ctx2.strokeStyle = '#ddd'; 
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.setLineDash([5, 5]); 
    ctx2.moveTo(graphXmin, graphYmin + (graphHeight / 2));
    ctx2.lineTo(graphXmax, graphYmin + (graphHeight / 2));
    ctx2.stroke();
    ////////////////////////////////////////////////////
    // Cosine Wave
    let dotNum = 100;
    let dotDist = graphWidth / dotNum;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        ctx2.fillStyle = '#ddd'; 
        ctx2.arc(graphXmin + i, graphCenterY + (Math.cos(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    // Sine dot
    ctx2.beginPath();
    ctx2.fillStyle = 'green'; 
    ctx2.arc(graphCenterX, graphCenterY + (-Math.cos(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    // Sine Wave
    dotNum = 100;
    dotDist = graphWidth / dotNum;
    for (let i = 0; i <= graphWidth; i += dotDist) {
        // % = i / graphWidth
        ctx2.beginPath();
        ctx2.fillStyle = '#ddd'; 
        ctx2.arc(graphXmin + i, graphCenterY + (Math.sin(-theta + ((i / graphWidth) * (Math.PI * 2))) * radius), 2, 0, 2 * Math.PI); 
        ctx2.fill();
    }
    // Sine dot
    ctx2.beginPath();
    ctx2.fillStyle = 'purple'; 
    ctx2.arc(graphCenterX, graphCenterY + (Math.sin(theta) * radius), 6, 0, 2 * Math.PI); 
    ctx2.fill();
    ////////////////////////////////////////////////////
    // reset
    ctx2.setLineDash([]);
    ctx2.fillStyle = '#111';
    ctx2.strokeStyle = '#111'; 
}

// drawFnGraph();


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
