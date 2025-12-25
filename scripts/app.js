import { MAPS } from '../data/map-svg.js';
import { POINTS } from './constants.js';
import MapManager from './map-manager.js';
import PointsManager from './points-manager.js';
import UIManager from './ui-manager.js';
import SearchManager from './search-manager.js';

// 🧩 ОСНОВНОЙ КЛАСС НАВИГАТОРА
class Navigator {
  constructor() {
    this.building = 'A';
    this.floor = 1;
    this.selectedPoint = null;
    
    this.mapManager = new MapManager();
    this.pointsManager = new PointsManager(POINTS);
    this.uiManager = new UIManager();
    this.searchManager = new SearchManager(POINTS);
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadMap();
    this.centerMap();
    this.showMoveHint();
  }

  setupEventListeners() {
    // Кнопка маршрута
    this.uiManager.routeBtn.addEventListener('click', () => {
      this.showUnderConstructionNotification();
    });

    // Drag & Zoom
    this.mapManager.setupDragEvents();
    
    // UI события
    this.uiManager.buildingBtn.addEventListener('click', () => this.toggleBuildingDropdown());
    this.uiManager.dropdown.addEventListener('click', e => {
      if (e.target.classList.contains('building-option')) {
        this.setBuilding(e.target.dataset.building);
        this.uiManager.dropdown.style.display = 'none';
      }
    });
    document.addEventListener('click', () => this.uiManager.dropdown.style.display = 'none');

    this.uiManager.floors.forEach(btn => btn.addEventListener('click', e => this.setFloor(parseInt(e.target.dataset.floor))));

    this.uiManager.closePoint.addEventListener('click', () => this.hidePointInfo());

    this.uiManager.zoomIn.addEventListener('click', () => this.mapManager.setZoom(this.mapManager.zoom + 0.2));
    this.uiManager.zoomOut.addEventListener('click', () => this.mapManager.setZoom(this.mapManager.zoom - 0.2));

    this.uiManager.searchTrigger.addEventListener('click', () => this.showSearch());
    this.uiManager.closeSearch.addEventListener('click', () => this.hideSearch());
    
    // Поиск
    this.uiManager.searchInput.addEventListener('input', e => {
      const results = this.searchManager.search(e.target.value);
      this.uiManager.displaySearchResults(results, (point) => {
        this.selectPoint(point);
        this.hideSearch();
      });
    });
  }

  loadMap() {
    const key = `${this.building}_${this.floor}`;
    this.mapManager.loadSVG(MAPS[key] || MAPS['A_1']);
    this.drawPoints();
    this.centerMap();
    this.updateFloorButtons();
  }

  drawPoints() {
    const points = this.pointsManager.getPoints(this.building, this.floor);
    this.mapManager.drawPoints(points, (point) => this.selectPoint(point));
  }

  selectPoint(point) {
    this.selectedPoint = point;
    this.showPointInfo(point);
  }

  showPointInfo(point) {
    this.uiManager.showPointInfo(point);
    this.mapManager.highlightPoint(point.id);
  }

  hidePointInfo() {
    this.uiManager.hidePointInfo();
    this.selectedPoint = null;
    this.mapManager.clearHighlight();
  }

  setBuilding(building) {
    this.building = building;
    this.uiManager.setCurrentBuilding(building);
    this.floor = 1;
    this.loadMap();
  }

  setFloor(floor) {
    this.floor = floor;
    this.loadMap();
  }

  updateFloorButtons() {
    this.uiManager.updateFloorButtons(this.floor);
  }

  toggleBuildingDropdown() {
    const isVisible = this.uiManager.dropdown.style.display === 'flex';
    this.uiManager.dropdown.style.display = isVisible ? 'none' : 'flex';
  }

  centerMap() {
    this.mapManager.centerMap(this.uiManager.mapContainer);
  }

  showMoveHint() {
    this.uiManager.showNotification('Перемещайте карту пальцем', 3000);
  }

  showUnderConstructionNotification() {
    this.uiManager.showNotification('Функция в разработке :(', 2000);
  }

  showSearch() {
    this.uiManager.showSearch();
  }

  hideSearch() {
    this.uiManager.hideSearch();
  }
}

// Запуск приложения
let navigatorApp;
document.addEventListener('DOMContentLoaded', () => {
  navigatorApp = new Navigator();
});

// Экспорт для использования в консоли или других модулях
export default Navigator;