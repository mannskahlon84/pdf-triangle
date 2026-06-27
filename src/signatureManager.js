export class SignaturePad {
  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    
    // Set transparent background explicitly
    this.clear();
    this.setupListeners();
  }
  
  setupListeners() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      // Map screen coordinates back to actual pixel canvas coordinates
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };
    
    const start = (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;
      
      // Draw a small dot on click to allow simple marking
      this.ctx.beginPath();
      this.ctx.arc(this.lastX, this.lastY, 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#000000';
      this.ctx.fill();
      
      e.preventDefault();
    };
    
    const draw = (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.strokeStyle = '#000000'; // Standard black ink signature
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
      
      this.lastX = pos.x;
      this.lastY = pos.y;
      e.preventDefault();
    };
    
    const stop = () => {
      this.isDrawing = false;
    };
    
    // Mouse
    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stop);
    
    // Touch (Mobile support)
    this.canvas.addEventListener('touchstart', start, { passive: false });
    this.canvas.addEventListener('touchmove', draw, { passive: false });
    document.addEventListener('touchend', stop);
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  isEmpty() {
    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // Alpha channel has color
        return false;
      }
    }
    return true;
  }
  
  getDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
}
