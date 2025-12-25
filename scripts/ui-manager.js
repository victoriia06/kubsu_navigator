export default class UIManager {
  constructor() {
    this.initElements();
  }

  initElements() {
    // Основные элементы
    this.mapContainer = document.getElementById('mapContainer');
    this.buildingBtn = document.getElementById('buildingBtn');
    this.currentBuilding = document.getElementById('currentBuilding');
    this.dropdown = document.getElementById('buildingDropdown');
    this.floors = document.querySelectorAll('.floor-btn');
    
    // Информация о точке
    this.pointInfo = document.getElementById('pointInfo');
    this.pointTitle = document.getElementById('pointTitle');
    this.pointType = document.getElementById('pointType');
    this.pointFloor = document.getElementById('pointFloor');
    this.closePoint = document.getElementById('closePointInfo');
    
    // Поиск
    this.searchTrigger = document.getElementById('searchTrigger');
    this.searchOverlay = document.getElementById('searchOverlay');
    this.searchInput = document.getElementById('searchInputFull');
    this.searchResults = document.getElementById('searchResults');
    this.closeSearch = document.getElementById('closeSearch');
    
    // Контролы
    this.routeBtn = document.getElementById('quickRouteBtn');
    this.zoomIn = document.getElementById('zoomIn');
    this.zoomOut = document.getElementById('zoomOut');
    
    // Индикатор
    this.moveIndicator = document.getElementById('moveIndicator');
  }

  showPointInfo(point) {
    this.pointTitle.textContent = point.name;
    this.pointType.textContent = this.getPointTypeName(point.type);
    this.pointFloor.textContent = `Этаж ${point.floor}`;
    this.pointInfo.classList.add('show');
  }

  hidePointInfo() {
    this.pointInfo.classList.remove('show');
  }

  setCurrentBuilding(building) {
    this.currentBuilding.textContent = `Корпус ${building}`;
  }

  updateFloorButtons(currentFloor) {
    this.floors.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.floor) === currentFloor);
    });
  }

  showNotification(message, duration = 3000) {
    if (this.moveIndicator) {
      this.moveIndicator.textContent = message;
      this.moveIndicator.style.display = 'block';
      
      setTimeout(() => {
        this.moveIndicator.style.display = 'none';
      }, duration);
    }
  }

  showSearch() {
    this.searchOverlay.style.display = 'flex';
    setTimeout(() => this.searchInput.focus(), 100);
  }

  hideSearch() {
    this.searchOverlay.style.display = 'none';
    this.searchInput.value = '';
  }

  displaySearchResults(results, onSelect) {
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21L16.65 16.65"/>
          </svg>
          <div>Ничего не найдено</div>
        </div>
      `;
      return;
    }

    this.searchResults.innerHTML = results.map(point => `
      <div class="search-result-item" onclick="(${onSelect.toString()})(${JSON.stringify(point)})">
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
          <div style="font-size: 13px; color: #666;">
            Корпус ${point.building}, Этаж ${point.floor}
          </div>
        </div>
        <span class="result-type">${this.getPointTypeName(point.type)}</span>
      </div>
    `).join('');
  }

  getPointTypeName(type) {
    const names = {
      room: 'Кабинет', 
      stairs: 'Лестница', 
      elevator: 'Лифт',
      toilet: 'Туалет', 
      cafe: 'Буфет', 
      office: 'Офис', 
      entrance: 'Вход', 
      other: 'Другое'
    };
    return names[type] || type;
  }
}