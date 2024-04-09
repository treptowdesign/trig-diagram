/////////////////////////////////////////////////////////////////////
// Setup
/////////////////////////////////////////////////////////////////////

const width = 600;
const height = 600;
const canvas = document.getElementById('unitCircleCanvas'); 
const ctx = canvas.getContext('2d');
const ratio = window.devicePixelRatio || 1;

canvas.width = width * ratio;
canvas.height = height * ratio;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(ratio, ratio); 

const centerX = (canvas.width / 2) / ratio;
const centerY = (canvas.height / 2) / ratio; 
const radius = 100;

// Mouse States (to be updated by events)
let mousePos = {x: 0, y: 0};
let isMouseDown = false;

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
    for (let i = 0; i <= canvas.width; i += 100) {
        ctx.beginPath();
        ctx.setLineDash([]); 
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    for (let i = 50; i < canvas.width; i += 100) {
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

function drawUnitCircle({ color = '#111', radius = 100 } = {}){
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
    ctx.font = '14px Arial';
    ctx.fillStyle = 'purple';
    ctx.fillText('Sin: '+(vals.sin), 20, 20);
    ctx.fillStyle = 'green';
    ctx.fillText('Cos: '+(vals.cos), 20, 40);
    ctx.fillStyle = 'orange';
    ctx.fillText('Tan: '+(vals.tan), 20, 60);
    ctx.fillStyle = 'pink';
    ctx.fillText('Csc: '+(vals.csc), 20, 80);
    ctx.fillStyle = 'cyan';
    ctx.fillText('Sec: '+(vals.sec), 20, 100);
    ctx.fillStyle = 'red';
    ctx.fillText('Cot: '+(vals.cot), 20, 120);
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
}

/////////////////////////////////////////////////////////////////////
// Initializing
/////////////////////////////////////////////////////////////////////

const initAngle = -1 * (Math.PI / 4);
updateDraw({angle: initAngle});

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
