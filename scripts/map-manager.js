export default class MapManager {
  constructor() {
    this.zoom = 1.0;
    this.position = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    
    this.surface = document.getElementById('mapSurface');
    this.mapContainer = document.getElementById('mapContainer');
  }

  setupDragEvents() {
    // Мышь
    this.mapContainer.addEventListener('mousedown', e => this.handleMouseDown(e));
    this.mapContainer.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: false });
    document.addEventListener('mousemove', e => this.handleMouseMove(e));
    document.addEventListener('touchmove', e => this.handleTouchMove(e), { passive: false });
    document.addEventListener('mouseup', () => this.handleMouseUp());
    document.addEventListener('touchend', () => this.handleMouseUp());
    
    // Zoom колесиком
    this.mapContainer.addEventListener('wheel', e => this.handleWheel(e), { passive: false });
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.dragStart = { x: e.clientX - this.position.x, y: e.clientY - this.position.y };
    this.mapContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      const t = e.touches[0];
      this.dragStart = { x: t.clientX - this.position.x, y: t.clientY - this.position.y };
      e.preventDefault();
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.position.x = e.clientX - this.dragStart.x;
    this.position.y = e.clientY - this.dragStart.y;
    this.updateTransform();
  }

  handleTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    this.position.x = t.clientX - this.dragStart.x;
    this.position.y = t.clientY - this.dragStart.y;
    this.updateTransform();
    e.preventDefault();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.mapContainer.style.cursor = 'grab';
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.setZoom(this.zoom + delta);
  }

  setZoom(zoom) {
    this.zoom = Math.min(2, Math.max(0.5, zoom));
    this.updateTransform();
  }

  updateTransform() {
    this.surface.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(${this.zoom})`;
  }

  loadSVG(svgContent) {
    this.surface.innerHTML = svgContent;
  }

  drawPoints(points, onPointClick) {
    // Удаляем старые точки
    document.querySelectorAll('.point').forEach(el => el.remove());

    points.forEach(point => {
      const el = document.createElement('div');
      el.className = `point ${point.type}`;
      el.style.left = `${point.x}px`;
      el.style.top = `${point.y}px`;
      el.title = point.name;
      const num = point.name.match(/\d+/)?.[0] || '•';
      el.innerHTML = `<span>${num}</span><div class="point-label">${point.name}</div>`;
      el.dataset.id = point.id;
      el.addEventListener('click', () => onPointClick(point));
      this.surface.appendChild(el);
    });
  }

  highlightPoint(id) {
    document.querySelectorAll('.point.selected').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.classList.add('selected');
  }

  clearHighlight() {
    document.querySelectorAll('.point.selected').forEach(el => el.classList.remove('selected'));
  }

  centerMap(containerElement) {
    const container = containerElement.getBoundingClientRect();
    const svgWidth = 1500;
    const svgHeight = 1000;
    
    const scaleX = container.width / svgWidth;
    const scaleY = container.height / svgHeight;
    this.zoom = Math.min(scaleX, scaleY) * 5.0;
    
    this.position = {
      x: (container.width - svgWidth * this.zoom) / 2,
      y: (container.height - svgHeight * this.zoom) / 2
    };
    
    this.updateTransform();
  }
}