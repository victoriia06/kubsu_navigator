// Основное приложение навигатора
class CampusNavigator {
    constructor() {
        this.currentFloorId = 0;
        this.currentFloor = null;
        this.floors = [];
        this.grid = null;
        this.cellSize = 10; // Уменьшаем размер ячейки для отображения
        this.selectedStartPoint = null;
        this.selectedEndPoint = null;
        this.currentRoute = null;
        this.zoomLevel = 0.4; // Начальный зум
        this.showGrid = true;
        this.currentBuilding = 'A';
        this.selectedPoint = null;
        
        // Параметры перемещения карты
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.mapPosition = { x: 0, y: 0 };
        
        // История поиска
        this.searchHistory = [];
        this.allPoints = [];
        this.searchResults = [];
        this.lastSearchQuery = '';
        
        // DOM элементы
        this.elements = {};
        this.initElements();
        
        // Инициализация
        this.init();
    }
    
    initElements() {
        this.elements = {
            appContainer: document.getElementById('appContainer'),
            mapContainer: document.getElementById('mapContainer'),
            mapGrid: document.getElementById('mapGrid'),
            mapContent: document.getElementById('mapContent'),
            buildingBtn: document.getElementById('buildingBtn'),
            buildingDropdown: document.getElementById('buildingDropdown'),
            currentBuilding: document.getElementById('currentBuilding'),
            searchTrigger: document.getElementById('searchTrigger'),
            searchOverlay: document.getElementById('searchOverlay'),
            searchInputFull: document.getElementById('searchInputFull'),
            searchResults: document.getElementById('searchResults'),
            closeSearch: document.getElementById('closeSearch'),
            quickRouteBtn: document.getElementById('quickRouteBtn'),
            zoomInBtn: document.getElementById('zoomIn'),
            zoomOutBtn: document.getElementById('zoomOut'),
            floorBtns: document.querySelectorAll('.floor-btn'),
            pointInfo: document.getElementById('pointInfo'),
            pointTitle: document.getElementById('pointTitle'),
            pointType: document.getElementById('pointType'),
            pointFloor: document.getElementById('pointFloor'),
            closePointInfo: document.getElementById('closePointInfo'),
            setAsStartPoint: document.getElementById('setAsStartPoint'),
            setAsEndPoint: document.getElementById('setAsEndPoint'),
            routeInfo: document.getElementById('routeInfo'),
            routeFrom: document.getElementById('routeFrom'),
            routeTo: document.getElementById('routeTo'),
            routeDistance: document.getElementById('routeDistance'),
            routeTime: document.getElementById('routeTime'),
            routeFloor: document.getElementById('routeFloor'),
            closeRouteInfo: document.getElementById('closeRouteInfo'),
            moveIndicator: document.getElementById('moveIndicator'),
            
            // Новые элементы для модального окна
            routeModal: document.getElementById('routeModal'),
            routeFromInput: document.getElementById('routeFromInput'),
            routeToInput: document.getElementById('routeToInput'),
            cancelRouteBtn: document.getElementById('cancelRouteBtn'),
            confirmRouteBtn: document.getElementById('confirmRouteBtn')
        };
    }
    
    init() {
        // Загружаем данные карты
        this.loadMapData();
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        // Инициализируем карту
        this.initMap();
        
        // Загружаем историю поиска
        this.loadSearchHistory();
        
        // Показываем индикатор перемещения
        this.showMoveIndicator();
        
        // Центрируем карту
        this.centerMap();
    }
    
    loadMapData() {
        if (window.mapData && window.mapData.floors) {
            this.floors = window.mapData.floors;
            this.currentFloor = this.floors[0];
            this.currentFloorId = this.floors[0].id;
            
            console.log('Загружено этажей:', this.floors.length);
            console.log('Текущий этаж:', this.currentFloor.name);
            console.log('Точек на этаже:', this.currentFloor.points.length);
            console.log('Стен на этаже:', this.currentFloor.walls.length);
            
            // Собираем все точки для поиска
            this.collectAllPoints();
            
            // Создаем сетку
            this.createGridFromData();
        } else {
            console.error('Данные карты не загружены');
            this.createDemoData();
        }
    }
    
    createDemoData() {
        console.log('Создание демо данных...');
        this.floors = [{
            id: 0,
            name: "Этаж 1",
            grid: { width: 225, height: 150 },
            walls: [
                [50, 50], [51, 50], [52, 50], [53, 50], [54, 50],
                [50, 51], [54, 51],
                [50, 52], [54, 52],
                [50, 53], [54, 53],
                [50, 54], [51, 54], [52, 54], [53, 54], [54, 54]
            ],
            points: [
                { id: 1, name: "Кабинет 101", type: "room", x: 52, y: 52 },
                { id: 2, name: "Кабинет 102", type: "room", x: 60, y: 60 },
                { id: 3, name: "Лестница", type: "stairs", x: 70, y: 70 },
                { id: 4, name: "Туалет", type: "toilet", x: 80, y: 80 },
                { id: 5, name: "Вход", type: "entrance", x: 90, y: 90 }
            ]
        }];
        
        this.currentFloor = this.floors[0];
        this.currentFloorId = this.floors[0].id;
        this.collectAllPoints();
        this.createGridFromData();
    }
    
    collectAllPoints() {
        this.allPoints = [];
        this.floors.forEach(floor => {
            floor.points.forEach(point => {
                this.allPoints.push({
                    ...point,
                    floorId: floor.id,
                    floorName: floor.name,
                    floorNumber: parseInt(floor.name.split(' ')[1]) || 1
                });
            });
        });
        console.log('Всего точек собрано:', this.allPoints.length);
    }
    
    createGridFromData() {
        if (!this.currentFloor || !this.currentFloor.grid) return;
        
        const gridWidth = this.currentFloor.grid.width;
        const gridHeight = this.currentFloor.grid.height;
        
        console.log(`Создание сетки ${gridWidth}x${gridHeight}`);
        
        // Создаем пустую сетку
        this.grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
        
        // Заполняем стены
        if (this.currentFloor.walls && this.currentFloor.walls.length > 0) {
            console.log('Заполняем стены:', this.currentFloor.walls.length);
            this.currentFloor.walls.forEach(([x, y]) => {
                if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                    this.grid[y][x] = 1;
                }
            });
        } else {
            console.warn('Нет данных о стенах');
        }
    }
    
    initMap() {
        console.log('Инициализация карты...');
        this.clearMap();
        this.drawGrid();
        this.drawWalls();
        this.drawPoints();
        this.applyZoom();
        this.applyMapPosition();
    }
    
    clearMap() {
        this.elements.mapGrid.innerHTML = '';
        this.elements.mapContent.innerHTML = '';
    }
    
    drawGrid() {
        if (!this.showGrid || !this.currentFloor) return;
        
        const gridWidth = this.currentFloor.grid.width;
        const gridHeight = this.currentFloor.grid.height;
        
        console.log(`Отрисовка сетки ${gridWidth}x${gridHeight}`);
        
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = `${x * this.cellSize}px`;
                cell.style.top = `${y * this.cellSize}px`;
                cell.style.width = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;
                
                this.elements.mapGrid.appendChild(cell);
            }
        }
    }
    
    drawWalls() {
        if (!this.currentFloor || !this.currentFloor.walls) {
            console.warn('Нет данных для отрисовки стен');
            return;
        }
        
        console.log('Отрисовка стен:', this.currentFloor.walls.length);
        
        this.currentFloor.walls.forEach(([x, y]) => {
            const wall = document.createElement('div');
            wall.className = 'cell wall';
            wall.style.left = `${x * this.cellSize}px`;
            wall.style.top = `${y * this.cellSize}px`;
            wall.style.width = `${this.cellSize}px`;
            wall.style.height = `${this.cellSize}px`;
            
            this.elements.mapContent.appendChild(wall);
        });
    }
    
    drawPoints() {
        if (!this.currentFloor) {
            console.warn('Нет данных для отрисовки точек');
            return;
        }
        
        console.log('Отрисовка точек:', this.currentFloor.points.length);
        
        this.currentFloor.points.forEach(point => {
            try {
                const pointEl = this.createPointElement(point);
                this.elements.mapContent.appendChild(pointEl);
            } catch (error) {
                console.error('Ошибка при создании точки:', point, error);
            }
        });
    }
    
    createPointElement(point) {
        const x = point.x * this.cellSize;
        const y = point.y * this.cellSize;
        
        const pointContainer = document.createElement('div');
        pointContainer.className = `point ${point.type}`;
        pointContainer.style.left = `${x}px`;
        pointContainer.style.top = `${y}px`;
        pointContainer.dataset.pointId = point.id;
        pointContainer.dataset.floorId = this.currentFloorId;
        pointContainer.title = point.name;
        
        // Номер точки
        const pointNumber = document.createElement('span');
        pointNumber.textContent = this.extractRoomNumber(point.name);
        pointContainer.appendChild(pointNumber);
        
        // Подпись
        const pointLabel = document.createElement('div');
        pointLabel.className = 'point-label';
        pointLabel.textContent = point.name;
        pointContainer.appendChild(pointLabel);
        
        // Обработчик клика
        pointContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Клик по точке:', point);
            this.handlePointClick(point);
        });
        
        return pointContainer;
    }
    
    extractRoomNumber(name) {
        // Извлекаем номер из названия
        const match = name.match(/\d+/);
        return match ? match[0] : '?';
    }
    
    handlePointClick(point) {
        console.log('Обработка клика по точке:', point.name);
        this.selectedPoint = point;
        this.showPointInfo(point);
    }
    
    showPointInfo(point) {
        console.log('Показ информации о точке:', point.name);
        this.elements.pointTitle.textContent = point.name;
        this.elements.pointType.textContent = MapUtils.getPointTypeName(point.type);
        this.elements.pointFloor.textContent = this.currentFloor.name;
        
        // Подсвечиваем точку
        this.highlightPoint(point);
        
        this.elements.pointInfo.classList.add('show');
    }
    
    highlightPoint(point) {
        // Убираем предыдущие подсветки
        this.clearHighlights();
        
        // Находим элемент точки
        const pointEl = document.querySelector(`[data-point-id="${point.id}"]`);
        if (pointEl) {
            pointEl.classList.add('selected');
        }
    }
    
    clearHighlights() {
        document.querySelectorAll('.point.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }
    
    centerMap() {
        const container = this.elements.appContainer;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const mapWidth = this.currentFloor.grid.width * this.cellSize * this.zoomLevel;
        const mapHeight = this.currentFloor.grid.height * this.cellSize * this.zoomLevel;
        
        this.mapPosition.x = (containerWidth - mapWidth) / 2;
        this.mapPosition.y = (containerHeight - mapHeight) / 2;
        
        this.applyMapPosition();
        console.log('Карта центрирована');
    }
    
    centerMapOnPoint(point) {
        const container = this.elements.appContainer;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const pointX = point.x * this.cellSize * this.zoomLevel;
        const pointY = point.y * this.cellSize * this.zoomLevel;
        
        this.mapPosition.x = containerWidth / 2 - pointX;
        this.mapPosition.y = containerHeight / 2 - pointY;
        
        this.applyMapPosition();
        console.log('Карта центрирована на точке:', point.name);
    }
    
    applyZoom() {
        this.elements.mapContainer.style.transform = 
            `translate(${this.mapPosition.x}px, ${this.mapPosition.y}px) scale(${this.zoomLevel})`;
    }
    
    applyMapPosition() {
        this.elements.mapContainer.style.transform = 
            `translate(${this.mapPosition.x}px, ${this.mapPosition.y}px) scale(${this.zoomLevel})`;
    }
    
    showFullscreenSearch() {
        this.elements.searchOverlay.classList.add('active');
        this.elements.mapContainer.classList.add('blurred');
        this.elements.appContainer.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.elements.searchInputFull.focus();
        }, 100);
        
        // Показываем историю поиска
        this.showSearchHistory();
    }
    
    hideFullscreenSearch() {
        this.elements.searchOverlay.classList.remove('active');
        this.elements.mapContainer.classList.remove('blurred');
        this.elements.appContainer.style.overflow = '';
        this.elements.searchInputFull.value = '';
        this.searchResults = [];
    }
    
    performSearch(query) {
        if (!query.trim()) {
            this.showSearchHistory();
            return;
        }
        
        this.lastSearchQuery = query;
        
        // Ищем точки
        const searchResults = MapUtils.searchPoints(this.allPoints, query);
        
        // Сортируем результаты по релевантности
        this.searchResults = MapUtils.sortSearchResults(searchResults, query);
        
        console.log('Результаты поиска:', this.searchResults.length);
        
        // Показываем результаты
        this.showSearchResults();
        
        // Добавляем в историю, если есть результаты
        if (this.searchResults.length > 0) {
            this.addToSearchHistory(query);
        }
    }
    
    showSearchResults() {
        const resultsContainer = this.elements.searchResults;
        resultsContainer.innerHTML = '';
        
        if (this.searchResults.length === 0) {
            this.showNoResults();
            return;
        }
        
        // Группируем результаты по типу
        const groupedResults = MapUtils.groupResultsByType(this.searchResults);
        
        // Сортируем группы по количеству результатов
        const sortedGroups = Object.entries(groupedResults)
            .sort(([, a], [, b]) => b.length - a.length);
        
        sortedGroups.forEach(([type, points]) => {
            const category = document.createElement('div');
            category.className = 'search-category';
            
            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = `${MapUtils.getPointTypeName(type)} (${points.length})`;
            category.appendChild(title);
            
            points.forEach(point => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <span>${point.name}</span>
                    <span class="result-type">${point.floorName}</span>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.handleSearchResultClick(point);
                });
                
                category.appendChild(resultItem);
            });
            
            resultsContainer.appendChild(category);
        });
    }
    
    showNoResults() {
        const resultsContainer = this.elements.searchResults;
        resultsContainer.innerHTML = `
            <div class="search-history-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/>
                </svg>
                <p>Ничего не найдено</p>
                <p style="font-size: 14px; margin-top: 8px;">Попробуйте другой запрос</p>
            </div>
        `;
    }
    
    showSearchHistory() {
        const resultsContainer = this.elements.searchResults;
        resultsContainer.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-history-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/>
                    </svg>
                    <p>История поиска пуста</p>
                    <p style="font-size: 14px; margin-top: 8px;">Ищите кабинеты, аудитории и другие места</p>
                </div>
            `;
            return;
        }
        
        const category = document.createElement('div');
        category.className = 'search-category';
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = 'История поиска';
        category.appendChild(title);
        
        this.searchHistory.forEach(query => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <span>${query}</span>
                <span class="result-type">Поиск</span>
            `;
            
            resultItem.addEventListener('click', () => {
                this.elements.searchInputFull.value = query;
                this.performSearch(query);
            });
            
            category.appendChild(resultItem);
        });
        
        resultsContainer.appendChild(category);
    }
    
    handleSearchResultClick(point) {
        console.log('Клик по результату поиска:', point.name);
        
        // Переключаемся на нужный этаж
        if (point.floorId !== this.currentFloorId) {
            console.log('Переключение этажа на:', point.floorName);
            this.switchFloor(point.floorId);
        }
        
        // Показываем информацию о точке
        this.showPointInfo(point);
        
        // Центрируем карту на точке
        this.centerMapOnPoint(point);
        
        // Закрываем поиск
        this.hideFullscreenSearch();
    }
    
    addToSearchHistory(query) {
        // Удаляем предыдущие вхождения
        this.searchHistory = this.searchHistory.filter(item => 
            item.toLowerCase() !== query.toLowerCase()
        );
        
        // Добавляем в начало
        this.searchHistory.unshift(query);
        
        // Ограничиваем размер истории
        if (this.searchHistory.length > 10) {
            this.searchHistory.pop();
        }
        
        // Сохраняем в localStorage
        this.saveSearchHistory();
    }
    
    saveSearchHistory() {
        MapUtils.saveToLocalStorage('campus_nav_search_history', this.searchHistory);
    }
    
    loadSearchHistory() {
        const saved = MapUtils.loadFromLocalStorage('campus_nav_search_history');
        if (saved) {
            this.searchHistory = saved;
            console.log('Загружена история поиска:', this.searchHistory.length);
        }
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        MapUtils.removeFromLocalStorage('campus_nav_search_history');
    }
    
    calculateRoute() {
        if (!this.selectedStartPoint || !this.selectedEndPoint) {
            this.showNotification("Выберите начальную и конечную точки");
            return;
        }
        
        // Проверяем, что точки на одном этаже
        if (this.selectedStartPoint.floorId !== this.selectedEndPoint.floorId) {
            this.showNotification("Точки находятся на разных этажах. Выберите точки на одном этаже.");
            return;
        }
        
        console.log('Построение маршрута:', this.selectedStartPoint.name, '→', this.selectedEndPoint.name);
        
        this.clearRoute();
        
        const pathfinder = new PathFinder(
            this.grid,
            this.currentFloor.grid.width,
            this.currentFloor.grid.height
        );
        
        const path = pathfinder.findPath(
            this.selectedStartPoint.x,
            this.selectedStartPoint.y,
            this.selectedEndPoint.x,
            this.selectedEndPoint.y
        );
        
        if (!path) {
            this.showNotification("Путь не найден! Возможно, маршрут заблокирован.");
            return;
        }
        
        console.log('Маршрут найден, длина:', path.length);
        
        this.drawRoute(path);
        this.showRouteInfo(path);
        
        this.currentRoute = path;
    }
    
    drawRoute(path) {
        console.log('Отрисовка маршрута из', path.length, 'точек');
        
        // Отрисовка ячеек маршрута
        path.forEach(([x, y], index) => {
            if (index === 0 || index === path.length - 1) return;
            
            const routeCell = document.createElement('div');
            routeCell.className = 'route-cell';
            routeCell.style.left = `${x * this.cellSize}px`;
            routeCell.style.top = `${y * this.cellSize}px`;
            routeCell.style.width = `${this.cellSize}px`;
            routeCell.style.height = `${this.cellSize}px`;
            
            this.elements.mapContent.appendChild(routeCell);
        });
        
        // Отрисовка линий между точками
        for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i];
            const [x2, y2] = path[i + 1];
            
            const line = document.createElement('div');
            line.className = 'route-line';
            
            const x = Math.min(x1, x2) * this.cellSize + this.cellSize / 2;
            const y = Math.min(y1, y2) * this.cellSize + this.cellSize / 2;
            
            line.style.left = `${x}px`;
            line.style.top = `${y}px`;
            
            if (x1 === x2) {
                // Вертикальная линия
                line.style.width = '6px';
                line.style.height = `${Math.abs(y2 - y1) * this.cellSize}px`;
            } else {
                // Горизонтальная линия
                line.style.width = `${Math.abs(x2 - x1) * this.cellSize}px`;
                line.style.height = '6px';
            }
            
            this.elements.mapContent.appendChild(line);
        }
    }
    
    showRouteInfo(path) {
        if (!path || path.length < 2) return;
        
        // Расчет расстояния и времени
        const distance = (path.length - 1) * 2.5; // примерно 2.5 метра на ячейку
        const time = Math.round(distance / 1.4 * 60); // 1.4 м/с - средняя скорость ходьбы
        
        this.elements.routeFrom.textContent = this.selectedStartPoint?.name || '-';
        this.elements.routeTo.textContent = this.selectedEndPoint?.name || '-';
        this.elements.routeDistance.textContent = `${distance.toFixed(1)} м`;
        this.elements.routeTime.textContent = MapUtils.formatTime(time);
        this.elements.routeFloor.textContent = this.currentFloor.name;
        
        this.elements.routeInfo.classList.add('active');
        
        this.showNotification(`Маршрут построен! Расстояние: ${distance.toFixed(1)} м`);
    }
    
    clearRoute() {
        document.querySelectorAll('.route-cell, .route-line').forEach(el => {
            el.remove();
        });
        
        this.elements.routeInfo.classList.remove('active');
        this.currentRoute = null;
    }
    
    switchFloor(floorId) {
        const floor = this.floors.find(f => f.id === floorId);
        if (!floor) {
            console.error('Этаж не найден:', floorId);
            return;
        }
        
        console.log('Переключение на этаж:', floor.name);
        
        this.currentFloorId = floorId;
        this.currentFloor = floor;
        
        // Сбрасываем выбранные точки и маршрут
        this.selectedPoint = null;
        this.selectedStartPoint = null;
        this.selectedEndPoint = null;
        this.clearRoute();
        this.hidePointInfo();
        
        // Обновляем сетку
        this.createGridFromData();
        this.initMap();
        
        // Обновляем активный этаж в интерфейсе
        this.updateFloorButtons();
    }
    
    updateFloorButtons() {
        const currentFloorNumber = parseInt(this.currentFloor.name.split(' ')[1]) || 1;
        console.log('Текущий номер этажа:', currentFloorNumber);
        
        this.elements.floorBtns.forEach(btn => {
            const floorNumber = parseInt(btn.dataset.floor);
            const isActive = floorNumber === currentFloorNumber;
            btn.classList.toggle('active', isActive);
            
            if (isActive) {
                console.log('Активный этаж:', floorNumber);
            }
        });
    }
    
            hidePointInfo() {
    console.log('Скрытие информации о точке');
    this.elements.pointInfo.classList.remove('show');
    this.clearHighlights();
    this.selectedPoint = null;
};

    showMoveIndicator() {
        this.elements.moveIndicator.style.display = 'block';
        setTimeout(() => {
            this.elements.moveIndicator.style.display = 'none';
        }, 3000);
    }
    
    showNotification(message) {
        // Удаляем старые уведомления
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showRouteModal() {
        console.log('Показ модального окна маршрута');
        this.elements.routeModal.classList.add('active');
        
        // Очищаем поля
        this.elements.routeFromInput.value = '';
        this.elements.routeToInput.value = '';
        
        // Фокус на первое поле
        setTimeout(() => {
            this.elements.routeFromInput.focus();
        }, 100);
    }
    
    hideRouteModal() {
        this.elements.routeModal.classList.remove('active');
    }
    
    setupRouteModalSearch() {
        let timeoutId;
        
        // Автодополнение для поля "Откуда"
        this.elements.routeFromInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const query = e.target.value.trim();
            
            if (query.length < 2) return;
            
            timeoutId = setTimeout(() => {
                const results = MapUtils.searchPoints(this.allPoints, query).slice(0, 5);
                this.showRouteSearchSuggestions(results, 'from');
            }, 300);
        });
        
        // Автодополнение для поля "Куда"
        this.elements.routeToInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const query = e.target.value.trim();
            
            if (query.length < 2) return;
            
            timeoutId = setTimeout(() => {
                const results = MapUtils.searchPoints(this.allPoints, query).slice(0, 5);
                this.showRouteSearchSuggestions(results, 'to');
            }, 300);
        });
    }
    
    showRouteSearchSuggestions(results, field) {
        // Удаляем старые подсказки
        this.removeRouteSearchSuggestions();
        
        if (results.length === 0) return;
        
        const inputField = field === 'from' ? this.elements.routeFromInput : this.elements.routeToInput;
        const rect = inputField.getBoundingClientRect();
        
        const suggestions = document.createElement('div');
        suggestions.className = 'route-suggestions';
        suggestions.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 4000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        results.forEach(point => {
            const item = document.createElement('div');
            item.className = 'route-suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                font-size: 14px;
                color: #374151;
            `;
            item.textContent = point.name;
            
            item.addEventListener('click', () => {
                inputField.value = point.name;
                if (field === 'from') {
                    this.selectedStartPoint = point;
                } else {
                    this.selectedEndPoint = point;
                }
                this.removeRouteSearchSuggestions();
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f9fafb';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });
            
            suggestions.appendChild(item);
        });
        
        document.body.appendChild(suggestions);
        
        // Закрытие при клике вне
        const closeSuggestions = (e) => {
            if (!suggestions.contains(e.target) && e.target !== inputField) {
                this.removeRouteSearchSuggestions();
                document.removeEventListener('click', closeSuggestions);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeSuggestions);
        }, 0);
    }
    
    removeRouteSearchSuggestions() {
        document.querySelectorAll('.route-suggestions').forEach(el => el.remove());
    }
    
    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        
        // Селектор корпусов
        this.elements.buildingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = this.elements.buildingDropdown;
            dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        });
        
        document.querySelectorAll('.building-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const building = e.target.dataset.building;
                this.currentBuilding = building;
                
                // Обновляем текущий корпус
                this.elements.currentBuilding.textContent = `Корпус ${building}`;
                
                // Закрываем выпадающий список
                this.elements.buildingDropdown.style.display = 'none';
                
                // Обновляем активный элемент
                document.querySelectorAll('.building-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');
                
                console.log(`Переключение на корпус ${building}`);
            });
        });
        
        // Закрытие выпадающего списка при клике снаружи
        document.addEventListener('click', () => {
            this.elements.buildingDropdown.style.display = 'none';
        });
        
        // ОТКРЫТИЕ ПОЛНОЭКРАННОГО ПОИСКА
        this.elements.searchTrigger.addEventListener('click', () => {
            console.log('Открытие полноэкранного поиска');
            this.showFullscreenSearch();
        });
        
        // ЗАКРЫТИЕ ПОЛНОЭКРАННОГО ПОИСКА
        this.elements.closeSearch.addEventListener('click', () => {
            console.log('Закрытие полноэкранного поиска');
            this.hideFullscreenSearch();
        });
        
        // Поиск в полноэкранном режиме
        this.elements.searchInputFull.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            console.log('Поиск:', query);
            this.performSearch(query);
        });
        
        // Сохранение поиска при нажатии Enter
        this.elements.searchInputFull.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.addToSearchHistory(query);
                }
            }
        });
        
        // Быстрое построение маршрута - открытие модального окна
        this.elements.quickRouteBtn.addEventListener('click', () => {
            console.log('Открытие модального окна маршрута');
            this.showRouteModal();
        });
        
        // Закрытие модального окна маршрута
        this.elements.cancelRouteBtn.addEventListener('click', () => {
            console.log('Закрытие модального окна маршрута');
            this.hideRouteModal();
        });
        
        // Подтверждение построения маршрута
        this.elements.confirmRouteBtn.addEventListener('click', () => {
            const from = this.elements.routeFromInput.value.trim();
            const to = this.elements.routeToInput.value.trim();
            
            console.log('Построение маршрута:', from, '→', to);
            
            if (!from || !to) {
                this.showNotification("Заполните оба поля");
                return;
            }
            
            // Ищем точки по названиям
            const startPoint = this.allPoints.find(p => 
                p.name.toLowerCase().includes(from.toLowerCase()));
            const endPoint = this.allPoints.find(p => 
                p.name.toLowerCase().includes(to.toLowerCase()));
            
            if (!startPoint) {
                this.showNotification(`Точка "${from}" не найдена`);
                return;
            }
            
            if (!endPoint) {
                this.showNotification(`Точка "${to}" не найдена`);
                return;
            }
            
            this.selectedStartPoint = startPoint;
            this.selectedEndPoint = endPoint;
            
            // Переключаемся на нужный этаж
            if (startPoint.floorId !== this.currentFloorId) {
                this.switchFloor(startPoint.floorId);
            }
            
            // Строим маршрут
            this.calculateRoute();
            
            // Закрываем модальное окно
            this.hideRouteModal();
        });
        
        // Закрытие информации о маршруте
        this.elements.closeRouteInfo.addEventListener('click', () => {
            this.elements.routeInfo.classList.remove('active');
        });
        
        // Масштабирование
        this.elements.zoomInBtn.addEventListener('click', () => {
            if (this.zoomLevel < 1.5) {
                this.zoomLevel += 0.1;
                this.applyZoom();
                console.log('Увеличение масштаба:', this.zoomLevel);
            }
        });
        
        this.elements.zoomOutBtn.addEventListener('click', () => {
            if (this.zoomLevel > 0.2) {
                this.zoomLevel -= 0.1;
                this.applyZoom();
                console.log('Уменьшение масштаба:', this.zoomLevel);
            }
        });
        
        // Переключение этажей
        this.elements.floorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const floorNumber = parseInt(btn.dataset.floor);
                console.log('Клик по этажу:', floorNumber);
                
                const floor = this.floors.find(f => {
                    const floorNameNumber = parseInt(f.name.split(' ')[1]);
                    return floorNameNumber === floorNumber;
                });
                
                if (floor) {
                    this.switchFloor(floor.id);
                } else {
                    console.error('Этаж не найден:', floorNumber);
                }
            });
        });
        
        // Закрытие информации о точке
this.elements.closePointInfo.addEventListener('click', (e) => {
    e.stopPropagation(); // Останавливаем всплытие события
    console.log('Закрытие информации о точке');
    this.hidePointInfo();
});
        
        // Установка точки начала маршрута
        this.elements.setAsStartPoint.addEventListener('click', () => {
            if (this.selectedPoint) {
                this.selectedStartPoint = this.selectedPoint;
                this.showNotification(`Точка начала маршрута установлена: "${this.selectedPoint.name}"`);
                this.hidePointInfo();
                
                // Если уже есть конечная точка, строим маршрут
                if (this.selectedEndPoint) {
                    this.calculateRoute();
                }
            }
        });
        
        // Установка точки конца маршрута
        this.elements.setAsEndPoint.addEventListener('click', () => {
            if (this.selectedPoint) {
                this.selectedEndPoint = this.selectedPoint;
                this.showNotification(`Точка назначения установлена: "${this.selectedPoint.name}"`);
                this.hidePointInfo();
                
                // Если уже есть начальная точка, строим маршрут
                if (this.selectedStartPoint) {
                    this.calculateRoute();
                }
            }
        });
        
        // ПЕРЕМЕЩЕНИЕ КАРТЫ
        this.setupMapDrag();
        
        // Настройка автодополнения для модального окна
        this.setupRouteModalSearch();
        
        // Изменение размера окна
        window.addEventListener('resize', () => {
            this.applyMapPosition();
        });
        
        // Закрытие окон при клике вне их
document.addEventListener('click', (e) => {
    // Закрытие информации о точке при клике вне ее и не на самой точке
    if (!e.target.closest('.point-info') && 
        !e.target.closest('.point') && 
        !e.target.closest('.close-btn')) {
        this.hidePointInfo();
    }
    
    // Закрытие информации о маршруте при клике вне его и не на кнопке маршрута
    if (!e.target.closest('.route-info') && 
        !e.target.closest('.route-btn') &&
        !e.target.closest('.close-btn')) {
        this.elements.routeInfo.classList.remove('active');
    }
    
    // Закрытие полноэкранного поиска обрабатывается отдельно
    // (у него своя кнопка закрытия в интерфейсе)
});

// Также добавим обработчик для закрытия поиска при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (this.elements.searchOverlay.classList.contains('active')) {
            this.hideFullscreenSearch();
        }
        this.hidePointInfo();
        this.elements.routeInfo.classList.remove('active');
    }
});
        
        console.log('Обработчики событий настроены');
    }
    
    setupMapDrag() {
        const map = this.elements.mapContainer;
        let startX, startY;
        
        // Мышиные события для десктопа
        map.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            startX = e.clientX - this.mapPosition.x;
            startY = e.clientY - this.mapPosition.y;
            map.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            this.mapPosition.x = e.clientX - startX;
            this.mapPosition.y = e.clientY - startY;
            this.applyMapPosition();
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            map.style.cursor = 'grab';
        });
        
        // Сенсорные события для мобильных устройств
        map.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                const touch = e.touches[0];
                startX = touch.clientX - this.mapPosition.x;
                startY = touch.clientY - this.mapPosition.y;
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            this.mapPosition.x = touch.clientX - startX;
            this.mapPosition.y = touch.clientY - startY;
            this.applyMapPosition();
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        
        // Отключаем контекстное меню на карте
        map.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Масштабирование колесиком мыши
        map.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(0.2, Math.min(1.5, this.zoomLevel + delta));
            
            // Масштабируем относительно курсора мыши
            const rect = map.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const scaleChange = newZoom / this.zoomLevel;
            
            this.mapPosition.x = mouseX - (mouseX - this.mapPosition.x) * scaleChange;
            this.mapPosition.y = mouseY - (mouseY - this.mapPosition.y) * scaleChange;
            
            this.zoomLevel = newZoom;
            this.applyZoom();
        }, { passive: false });
    }
}

// Инициализация приложения
window.initApp = function() {
    console.log('Инициализация приложения...');
    window.navigatorApp = new CampusNavigator();
};

// Если данные уже загружены, инициализируем сразу
if (window.mapData && window.mapData.floors) {
    console.log('Данные карты загружены, запуск приложения...');
    window.initApp();
} else {
    console.log('Ожидание загрузки данных карты...');
}