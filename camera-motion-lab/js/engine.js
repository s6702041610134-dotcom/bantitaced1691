import { Camera } from './camera.js';
import { Character } from './character.js';

export class SceneEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.camera = new Camera();
    this.character = new Character();
    
    this.showViewfinder = true;
    this.showFloorGrid = true;
    this.isRecording = false;
    
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  project(x, y, z) {
    const dx = x - this.camera.x;
    const dy = y - this.camera.y;
    const dz = z - this.camera.z;

    const panRad = (this.camera.pan * Math.PI) / 180;
    const cosP = Math.cos(panRad);
    const sinP = Math.sin(panRad);
    const x1 = dx * cosP - dz * sinP;
    const z1 = dx * sinP + dz * cosP;

    const tiltRad = (this.camera.tilt * Math.PI) / 180;
    const cosT = Math.cos(-tiltRad);
    const sinT = Math.sin(-tiltRad);
    const y2 = dy * cosT - z1 * sinT;
    const z2 = dy * sinT + z1 * cosT;

    const sensorSize = 36;
    const fov = 2 * Math.atan(sensorSize / (2 * this.camera.focalLength));
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    
    const f = (cw / 2) / Math.tan(fov / 2);
    
    const inFront = z2 < -0.1;
    
    const sx = (cw / 2) + (x1 / -z2) * f;
    const sy = (ch / 2) - (y2 / -z2) * f;

    return {
      sx,
      sy,
      scale: f / -z2,
      behindCamera: !inFront
    };
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#0a192f");
    grd.addColorStop(1, "#172a45");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    if (this.showFloorGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;

      for (let x = -30; x <= 30; x += 2) {
        let p1 = this.project(x, 0, -30);
        let p2 = this.project(x, 0, 30);
        if (!p1.behindCamera || !p2.behindCamera) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }

      for (let z = -30; z <= 30; z += 2) {
        let p1 = this.project(-30, 0, z);
        let p2 = this.project(30, 0, z);
        if (!p1.behindCamera || !p2.behindCamera) {
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }
    }

    const renderList = [];

    renderList.push({
      type: 'rect',
      p1: [-15, 6, -15],
      p2: [15, 0, -15],
      color: '#2a3b5c'
    });

    renderList.push({
      type: 'rect',
      p1: [3, 2.2, -14.9],
      p2: [4.5, 0, -14.9],
      color: '#4e3b31'
    });

    const parts = this.character.getBodyParts();
    for (const key in parts) {
      const part = parts[key];
      if (part.type === 'cylinder') {
        renderList.push({
          type: 'line',
          p1: [part.p1.x, part.p1.y, part.p1.z],
          p2: [part.p2.x, part.p2.y, part.p2.z],
          width: part.width,
          color: '#8a9baf'
        });
      } else if (part.type === 'sphere') {
        renderList.push({
          type: 'point',
          p: [part.p.x, part.p.y, part.p.z],
          radius: part.radius,
          color: '#d4bfa3'
        });
      }
    }

    // A simple table setup for props
    // Table top
    renderList.push({
      type: 'line',
      p1: [-6, 0.9, -6],
      p2: [-4, 0.9, -6],
      width: 0.1,
      color: '#5c4a3d'
    });
    // Table legs
    renderList.push({ type: 'line', p1: [-6, 0.9, -6], p2: [-6, 0, -6], width: 0.05, color: '#3c2a1d' });
    renderList.push({ type: 'line', p1: [-4, 0.9, -6], p2: [-4, 0, -6], width: 0.05, color: '#3c2a1d' });

    for (const item of renderList) {
      if (item.type === 'rect') {
        let pt1 = this.project(item.p1[0], item.p1[1], item.p1[2]);
        let pt2 = this.project(item.p2[0], item.p2[1], item.p2[2]);
        let pt3 = this.project(item.p2[0], item.p1[1], item.p1[2]);
        let pt4 = this.project(item.p1[0], item.p2[1], item.p2[2]);
        
        if (!pt1.behindCamera && !pt2.behindCamera) {
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.moveTo(pt1.sx, pt1.sy);
          ctx.lineTo(pt3.sx, pt3.sy);
          ctx.lineTo(pt2.sx, pt2.sy);
          ctx.lineTo(pt4.sx, pt4.sy);
          ctx.closePath();
          ctx.fill();
        }
      } else if (item.type === 'line') {
        let pt1 = this.project(item.p1[0], item.p1[1], item.p1[2]);
        let pt2 = this.project(item.p2[0], item.p2[1], item.p2[2]);
        if (!pt1.behindCamera && !pt2.behindCamera) {
          ctx.strokeStyle = item.color;
          ctx.lineWidth = Math.max(1, item.width * pt1.scale);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt1.sx, pt1.sy);
          ctx.lineTo(pt2.sx, pt2.sy);
          ctx.stroke();
        }
      } else if (item.type === 'point') {
        let pt = this.project(item.p[0], item.p[1], item.p[2]);
        if (!pt.behindCamera) {
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, Math.max(1, item.radius * pt.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (this.showViewfinder) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo(w * 2 / 3, 0); ctx.lineTo(w * 2 / 3, h);
      ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
      ctx.moveTo(0, h * 2 / 3); ctx.lineTo(w, h * 2 / 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w / 2 - 15, h / 2); ctx.lineTo(w / 2 + 15, h / 2);
      ctx.moveTo(w / 2, h / 2 - 15); ctx.lineTo(w / 2, h / 2 + 15);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

      ctx.fillStyle = "white";
      ctx.font = "14px monospace";
      const shotSize = this.camera.getShotSizeName();
      const angle = this.camera.getAngleName();
      const fl = this.camera.focalLength.toFixed(1);

      ctx.fillText(`${shotSize} | ${angle} | ${fl}mm`, 20, h - 20);
    }

    if (this.isRecording) {
      ctx.fillStyle = "#ff3333";
      ctx.beginPath();
      ctx.arc(30, 30, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("REC", 45, 35);
    }
  }

  captureFrame() {
    return this.canvas.toDataURL('image/png');
  }
}
