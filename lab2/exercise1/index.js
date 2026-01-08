// Get the canvas element and its 2D context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Draw a filled rectangle
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 120, 80);

// Draw a filled circle
ctx.fillStyle = '#e74c3c';
ctx.beginPath();
ctx.arc(300, 90, 50, 0, 2 * Math.PI);
ctx.fill();

// Draw a straight line
ctx.strokeStyle = '#2ecc71';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.lineTo(450, 200);
ctx.stroke();

// Display text "HTML5 Canvas"
ctx.fillStyle = '#34495e';
ctx.font = '30px Arial';
ctx.fillText('HTML5 Canvas', 150, 260);
