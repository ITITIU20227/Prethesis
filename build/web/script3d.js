document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cubeButton = document.getElementById('cube');
    const coneButton = document.getElementById('cone');
    const sphereButton = document.getElementById('sphere');
    const sizeSlider = document.getElementById('size-slider');
    const colorPicker = document.getElementById('color-picker');
    const clearCanvasButton = document.getElementById('clear-canvas');
    const saveImgButton = document.getElementById('save-img');
    const colorOption = document.querySelector('.colors .option');
    const showAxisCheckbox = document.getElementById('show-axis');

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    let shape = null;
    let zoom = 1;
    let color = colorPicker.value;
    let showAxis = false;

    // Axis colors
    const xAxisColor = '#FF0000'; // Red
    const yAxisColor = '#00FF00'; // Green
    const zAxisColor = '#0000FF'; // Blue

    

    cubeButton.addEventListener('click', () => {
        const length = prompt("Enter the length of the cube:");
        if (length) {
            shape = {
                type: 'cube',
                length: parseFloat(length)
            };
            draw();
        }
    });

    coneButton.addEventListener('click', () => {
        const height = prompt("Enter the height of the cone:");
        const radius = prompt("Enter the radius of the cone:");
        if (height && radius) {
            shape = {
                type: 'cone',
                height: parseFloat(height),
                radius: parseFloat(radius)
            };
            draw();
        }
    });

    sphereButton.addEventListener('click', () => {
        const radius = prompt("Enter the radius of the sphere:");
        if (radius) {
            shape = {
                type: 'sphere',
                radius: parseFloat(radius)
            };
            draw();
        }
    });

    sizeSlider.addEventListener('input', () => {
        zoom = parseInt(sizeSlider.value) / 5;
        draw();
    });

    colorPicker.addEventListener('input', (event) => {
        color = event.target.value;
        updateColorOption(color);
        draw();
    });

    function updateColorOption(color) {
        colorOption.style.backgroundColor = color;
    }

    clearCanvasButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shape = null; // Reset the shape

        if (showAxisCheckbox.checked) {
            showAxisCheckbox.checked = false;
            showAxis = false; // Also update the showAxis variable
        }
    });


    saveImgButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'canvas-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    showAxisCheckbox.addEventListener('change', () => {
        showAxis = showAxisCheckbox.checked;
        draw();
    });

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;

            rotation.x += deltaX * 0.01;
            rotation.y += deltaY * 0.01;

            previousMousePosition = { x: event.clientX, y: event.clientY };

            draw();
        }
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (showAxis) {
            drawAxis();
        }

        if (shape) {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            if (shape.type === 'cube') {
                drawCube(ctx, shape.length, rotation, zoom, color);
            } else if (shape.type === 'cone') {
                drawCone(ctx, shape.height, shape.radius, rotation, zoom, color);
            } else if (shape.type === 'sphere') {
                drawSphere(ctx, shape.radius, rotation, zoom, color);
            }
        }
    }

    function drawAxis() {
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const length = Math.max(canvas.width, canvas.height) / 2; // Half the canvas size
        const axisMarkerSpacing = 50; // Spacing between axis markers
        const markerSize = 5; // Size of the marker lines
        const markerFontSize = 12; // Font size of the marker text

        // Apply rotation to axes
        const xAxisEndPositive = rotatePoint({ x: length, y: 0, z: 0 }, rotation, zoom);
        const xAxisEndNegative = rotatePoint({ x: -length, y: 0, z: 0 }, rotation, zoom);
        const yAxisEndPositive = rotatePoint({ x: 0, y: length, z: 0 }, rotation, zoom);
        const yAxisEndNegative = rotatePoint({ x: 0, y: -length, z: 0 }, rotation, zoom);
        const zAxisEndPositive = rotatePoint({ x: 0, y: 0, z: length }, rotation, zoom);
        const zAxisEndNegative = rotatePoint({ x: 0, y: 0, z: -length }, rotation, zoom);

        // Draw axes
        drawLine(center, { x: center.x + xAxisEndPositive.x, y: center.y - xAxisEndPositive.y }, xAxisColor);
        drawLine(center, { x: center.x + xAxisEndNegative.x, y: center.y - xAxisEndNegative.y }, xAxisColor);
        drawLine(center, { x: center.x + yAxisEndPositive.x, y: center.y - yAxisEndPositive.y }, yAxisColor);
        drawLine(center, { x: center.x + yAxisEndNegative.x, y: center.y - yAxisEndNegative.y }, yAxisColor);
        drawLine(center, { x: center.x + zAxisEndPositive.x, y: center.y - zAxisEndPositive.y }, zAxisColor);
        drawLine(center, { x: center.x + zAxisEndNegative.x, y: center.y - zAxisEndNegative.y }, zAxisColor);

        // Draw axis markers
        drawAxisMarkers(center, xAxisEndPositive, xAxisEndNegative, 'x');
        drawAxisMarkers(center, yAxisEndPositive, yAxisEndNegative, 'y');
        drawAxisMarkers(center, zAxisEndPositive, zAxisEndNegative, 'z');

        function drawAxisMarkers(start, endPositive, endNegative, axis) {
            const totalLength = Math.abs(endPositive[axis] - endNegative[axis]);
            const numMarkers = Math.floor(totalLength / axisMarkerSpacing);

            for (let i = 0; i <= numMarkers; i++) {
                const ratio = i / numMarkers;
                const x = start.x + (endNegative.x + ratio * (endPositive.x - endNegative.x));
                const y = start.y - (endNegative.y + ratio * (endPositive.y - endNegative.y));

                // Draw marker lines
                ctx.beginPath();
                ctx.moveTo(x, y - markerSize);
                ctx.lineTo(x, y + markerSize);
                ctx.strokeStyle = 'black';
                ctx.stroke();

                // Draw marker text
                ctx.font = `${markerFontSize}px Arial`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (axis === 'x') {
                    ctx.fillText(Math.round(ratio * totalLength - length), x, y + markerSize + markerFontSize);
                } else {
                    ctx.fillText(Math.round(length - ratio * totalLength), x - markerFontSize, y);
                }
            }
        }
    }



    function drawLine(start, end, color) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function drawCube(ctx, length, rotation, zoom) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const offset = length / 2;

        const points = [
            { x: -offset, y: -offset, z: -offset },
            { x: offset, y: -offset, z: -offset },
            { x: offset, y: offset, z: -offset },
            { x: -offset, y: offset, z: -offset },
            { x: -offset, y: -offset, z: offset },
            { x: offset, y: -offset, z: offset },
            { x: offset, y: offset, z: offset },
            { x: -offset, y: offset, z: offset }
        ];

        const rotatedPoints = points.map(point => rotatePoint(point, rotation, zoom));

        const faces = [
            { points: [rotatedPoints[0], rotatedPoints[1], rotatedPoints[2], rotatedPoints[3]], shade: -0.1 },
            { points: [rotatedPoints[4], rotatedPoints[5], rotatedPoints[6], rotatedPoints[7]], shade: -0.3 },
            { points: [rotatedPoints[0], rotatedPoints[4], rotatedPoints[7], rotatedPoints[3]], shade: -0.1 },
            { points: [rotatedPoints[1], rotatedPoints[5], rotatedPoints[6], rotatedPoints[2]], shade: -0.2 },
            { points: [rotatedPoints[0], rotatedPoints[1], rotatedPoints[5], rotatedPoints[4]], shade: -0.1 },
            { points: [rotatedPoints[3], rotatedPoints[2], rotatedPoints[6], rotatedPoints[7]], shade: -0.4 }
        ];

        // Sort faces based on their average z value to handle drawing order correctly
        faces.sort((a, b) => {
            const avgZA = a.points.reduce((sum, p) => sum + p.z, 0) / 4;
            const avgZB = b.points.reduce((sum, p) => sum + p.z, 0) / 4;
            return avgZB - avgZA;
        });

        faces.forEach(face => {
            drawFace(face.points, shadeColor(color, face.shade));
        });

        function drawFace(points, fillColor) {
            const gradient = ctx.createLinearGradient(centerX + points[0].x, centerY - points[0].y, centerX + points[2].x, centerY - points[2].y);
            gradient.addColorStop(0, fillColor);
            gradient.addColorStop(1, shadeColor(fillColor, -0.5));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(centerX + points[0].x, centerY - points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(centerX + points[i].x, centerY - points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        }

        function shadeColor(color, percent) {
            let R = parseInt(color.substring(1, 3), 16);
            let G = parseInt(color.substring(3, 5), 16);
            let B = parseInt(color.substring(5, 7), 16);

            R = parseInt(R * (100 + percent * 100) / 100);
            G = parseInt(G * (100 + percent * 100) / 100);
            B = parseInt(B * (100 + percent * 100) / 100);

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
            const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
            const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

            return "#" + RR + GG + BB;
        }

        function rotatePoint(point, rotation, zoom) {
            const cosX = Math.cos(rotation.x);
            const sinX = Math.sin(rotation.x);
            const cosY = Math.cos(rotation.y);
            const sinY = Math.sin(rotation.y);

            let y = point.y * cosY - point.z * sinY;
            let z = point.y * sinY + point.z * cosY;

            let x = point.x * cosX - z * sinX;
            z = point.x * sinX + z * cosX;

            x *= zoom;
            y *= zoom;

            return { x: x, y: y, z: z };
        }
    }

    function drawCone(ctx, height, radius, rotation, zoom, color) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const offset = height / 2;

        const baseCenter = { x: 0, y: 0, z: -offset };
        const apex = { x: 0, y: 0, z: offset };

        const basePoints = [];
        const segments = 36;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            basePoints.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                z: -offset
            });
        }

        const rotatedBaseCenter = rotatePoint(baseCenter, rotation, zoom);
        const rotatedApex = rotatePoint(apex, rotation, zoom);
        const rotatedBasePoints = basePoints.map(point => rotatePoint(point, rotation, zoom));

        const faces = [];
        for (let i = 0; i < segments; i++) {
            const nextIndex = (i + 1) % segments;
            faces.push({ points: [rotatedBasePoints[i], rotatedBasePoints[nextIndex], rotatedApex], shade: -0.3 });
        }

        // Sort faces based on their average z value to handle drawing order correctly
        faces.sort((a, b) => {
            const avgZA = a.points.reduce((sum, p) => sum + p.z, 0) / 3;
            const avgZB = b.points.reduce((sum, p) => sum + p.z, 0) / 3;
            return avgZB - avgZA;
        });

        faces.forEach(face => {
            drawFace(face.points, shadeColor(color, face.shade));
        });

        function drawFace(points, fillColor) {
            const gradient = ctx.createLinearGradient(centerX + points[0].x, centerY - points[0].y, centerX + points[1].x, centerY - points[1].y);
            gradient.addColorStop(0, fillColor);
            gradient.addColorStop(1, shadeColor(fillColor, -0.5));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(centerX + points[0].x, centerY - points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(centerX + points[i].x, centerY - points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        }

        function shadeColor(color, percent) {
            let R = parseInt(color.substring(1, 3), 16);
            let G = parseInt(color.substring(3, 5), 16);
            let B = parseInt(color.substring(5, 7), 16);

            R = parseInt(R * (100 + percent * 100) / 100);
            G = parseInt(G * (100 + percent * 100) / 100);
            B = parseInt(B * (100 + percent * 100) / 100);

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
            const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
            const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

            return "#" + RR + GG + BB;
        }

        function rotatePoint(point, rotation, zoom) {
            const cosX = Math.cos(rotation.x);
            const sinX = Math.sin(rotation.x);
            const cosY = Math.cos(rotation.y);
            const sinY = Math.sin(rotation.y);

            let y = point.y * cosY - point.z * sinY;
            let z = point.y * sinY + point.z * cosY;

            let x = point.x * cosX - z * sinX;
            z = point.x * sinX + z * cosX;

            x *= zoom;
            y *= zoom;

            return { x: x, y: y, z: z };
        }
    }

    function drawSphere(ctx, radius, rotation, zoom, color) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const latitudeBands = 30;
        const longitudeBands = 30;
        const vertices = [];

        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = lat * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= longitudeBands; long++) {
                const phi = long * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push({ x: x * radius, y: y * radius, z: z * radius });
            }
        }

        const faces = [];
        for (let lat = 0; lat < latitudeBands; lat++) {
            for (let long = 0; long < longitudeBands; long++) {
                const first = (lat * (longitudeBands + 1)) + long;
                const second = first + longitudeBands + 1;
                const third = first + 1;
                const fourth = second + 1;

                const rotatedFirst = rotatePoint(vertices[first], rotation, zoom);
                const rotatedSecond = rotatePoint(vertices[second], rotation, zoom);
                const rotatedThird = rotatePoint(vertices[third], rotation, zoom);
                const rotatedFourth = rotatePoint(vertices[fourth], rotation, zoom);

                faces.push({ points: [rotatedFirst, rotatedSecond, rotatedFourth, rotatedThird], shade: -0.3 });
            }
        }

        // Sort faces based on their average z value to handle drawing order correctly
        faces.sort((a, b) => {
            const avgZA = a.points.reduce((sum, p) => sum + p.z, 0) / 4;
            const avgZB = b.points.reduce((sum, p) => sum + p.z, 0) / 4;
            return avgZB - avgZA;
        });

        faces.forEach(face => {
            drawFace(face.points, shadeColor(color, face.shade));
        });

        function drawFace(points, fillColor) {
            const gradient = ctx.createLinearGradient(centerX + points[0].x, centerY - points[0].y, centerX + points[2].x, centerY - points[2].y);
            gradient.addColorStop(0, fillColor);
            gradient.addColorStop(1, shadeColor(fillColor, -0.5));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(centerX + points[0].x, centerY - points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(centerX + points[i].x, centerY - points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.stroke();
        }

        function shadeColor(color, percent) {
            let R = parseInt(color.substring(1, 3), 16);
            let G = parseInt(color.substring(3, 5), 16);
            let B = parseInt(color.substring(5, 7), 16);

            R = parseInt(R * (100 + percent * 100) / 100);
            G = parseInt(G * (100 + percent * 100) / 100);
            B = parseInt(B * (100 + percent * 100) / 100);

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
            const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
            const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

            return "#" + RR + GG + BB;
        }

        function rotatePoint(point, rotation, zoom) {
            const cosX = Math.cos(rotation.x);
            const sinX = Math.sin(rotation.x);
            const cosY = Math.cos(rotation.y);
            const sinY = Math.sin(rotation.y);

            let y = point.y * cosY - point.z * sinY;
            let z = point.y * sinY + point.z * cosY;

            let x = point.x * cosX - z * sinX;
            z = point.x * sinX + z * cosX;

            x *= zoom;
            y *= zoom;

            return { x: x, y: y, z: z };
        }
    }

    function rotatePoint(point, rotation, zoom) {
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);

        let y = point.y * cosY - point.z * sinY;
        let z = point.y * sinY + point.z * cosY;

        let x = point.x * cosX - z * sinX;
        z = point.x * sinX + z * cosX;

        x *= zoom;
        y *= zoom;

        return { x: x, y: y, z: z };
    }    
});

