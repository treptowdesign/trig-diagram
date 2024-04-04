const canvas = document.getElementById('unitCircleCanvas');
const ctx = canvas.getContext('2d');

// unit circle
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 100;

// functions
function radiansToDegrees(angle){ // im not actually using this
    // convert: x = angle * (180 / Math.PI); 
    // make positive: (x + 360) % 360;
    return (angle * (180 / Math.PI) + 360) % 360;
}

// bounding rectangle and grid
function drawGrid() {
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

function drawUnitCircle(){
    ctx.strokeStyle = '#111'; 
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLine(start, end, color){
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

drawGrid();
drawUnitCircle();

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // points for sine/cosine
    const pointX = centerX + (radius * Math.cos(angle));
    const pointY = centerY + (radius * Math.sin(angle));
    // point for tan & sec - where tan crosses the x-axis
    // const tangentX = centerX + (radius * (Math.cos(angle) + Math.tan(angle) * Math.sin(angle)));
    const secant = centerX + (radius * (1 / Math.cos(angle)));
    // point for cotan & csc - where cotan crosses the y-axis
    // const cotangentY = centerY + (radius * (Math.cos(angle) / Math.tan(angle) + Math.sin(angle)));
    const cosecant = centerY + (radius * (1 / Math.sin(angle)));

    // clear 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw grid and unit circle
    drawGrid();
    drawUnitCircle();
    // draw sine of theta
    drawLine({x: pointX, y: pointY}, {x: pointX, y: centerY}, 'purple');
    // draw cosine of theta
    drawLine({x: pointX, y: pointY}, {x: centerX, y: pointY}, 'green');
    // draw tangent of theta (uses the secant)
    drawLine({x: pointX, y: pointY}, {x: secant, y: centerY}, 'orange'); 
    // draw secant of theta
    drawLine({x: centerX, y: centerY}, {x: secant, y: centerY}, 'cyan');
    // draw cotangent of theta (uses the cosecant)
    drawLine({x: pointX, y: pointY}, {x: centerX, y: cosecant}, 'red'); 
    // draw cosecant of theta
    drawLine({x: centerX, y: centerY}, {x: centerX, y: cosecant}, 'pink'); 
    // draw arctan (main angle line)
    drawLine({x: centerX, y: centerY}, {x: pointX, y: pointY}, 'black'); 
    // draw tangent point
    drawPoint({x: secant, y: centerY});
    // draw cotangent point
    drawPoint({x: centerX, y: cosecant});
    // draw center point
    drawPoint({x: centerX, y: centerY});
    // draw intersection point
    drawPoint({x: pointX, y: pointY});

});

