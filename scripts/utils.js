// Утилиты для работы с картой
const MapUtils = {
    // Преобразование координат
    pixelsToGrid(pixelX, pixelY, gridWidth, gridHeight, canvasWidth, canvasHeight) {
        const gridX = Math.floor((pixelX / canvasWidth) * gridWidth);
        const gridY = Math.floor((pixelY / canvasHeight) * gridHeight);
        
        return {
            x: Math.max(0, Math.min(gridWidth - 1, gridX)),
            y: Math.max(0, Math.min(gridHeight - 1, gridY))
        };
    },
    
    gridToPixels(gridX, gridY, gridWidth, gridHeight, canvasWidth, canvasHeight) {
        return {
            x: (gridX / gridWidth) * canvasWidth,
            y: (gridY / gridHeight) * canvasHeight
        };
    },
    
    // Расчет расстояния
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // Форматирование времени
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} сек`;
        }
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        
        if (mins < 60) {
            return `${mins} мин ${secs} сек`;
        }
        
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        
        return `${hours} ч ${remainingMins} мин`;
    },
    
    // Типы точек
    pointTypes: {
        room: { name: 'Аудитория', color: '#3b82f6', icon: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h1v4m3-4v4' },
        entrance: { name: 'Вход/Выход', color: '#10b981', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        stairs: { name: 'Лестница', color: '#f59e0b', icon: 'M19 9l-7 7-7-7' },
        elevator: { name: 'Лифт', color: '#06b6d4', icon: 'M5 10l7-7m0 0l7 7m-7-7v18' },
        toilet: { name: 'Туалет', color: '#8b5cf6', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        cafe: { name: 'Столовая', color: '#f97316', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
        library: { name: 'Библиотека', color: '#14b8a6', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        office: { name: 'Офис', color: '#8b5cf6', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h1v4m3-4v4' },
        other: { name: 'Другое', color: '#6b7280', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
    },
    
    // Получение цвета по типу точки
    getPointColor(type) {
        return this.pointTypes[type]?.color || '#3b82f6';
    },
    
    // Получение названия типа
    getPointTypeName(type) {
        return this.pointTypes[type]?.name || type;
    },
    
    // Получение иконки типа
    getPointTypeIcon(type) {
        return this.pointTypes[type]?.icon || '';
    },
    
    // Фильтрация и поиск точек
    searchPoints(points, query) {
        if (!query.trim()) return [];
        
        const searchTerm = query.toLowerCase().trim();
        
        // Разделяем поисковый запрос на части
        const searchParts = searchTerm.split(/\s+/);
        
        return points.filter(point => {
            const pointName = point.name.toLowerCase();
            const pointId = point.id.toString();
            const pointType = this.getPointTypeName(point.type).toLowerCase();
            
            // Проверяем каждую часть поискового запроса
            return searchParts.every(part => {
                // Ищем в имени
                if (pointName.includes(part)) return true;
                
                // Ищем в номере кабинета
                if (pointId.includes(part)) return true;
                
                // Ищем в типе
                if (pointType.includes(part)) return true;
                
                return false;
            });
        });
    },
    
    // Группировка результатов по типу
    groupResultsByType(points) {
        return points.reduce((groups, point) => {
            const type = point.type;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(point);
            return groups;
        }, {});
    },
    
    // Сортировка результатов по релевантности
    sortSearchResults(results, query) {
        const searchTerm = query.toLowerCase();
        
        return results.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aId = a.id.toString();
            const bId = b.id.toString();
            
            // Приоритет: точное совпадение с номером
            if (aId === searchTerm && bId !== searchTerm) return -1;
            if (bId === searchTerm && aId !== searchTerm) return 1;
            
            // Приоритет: номер начинается с поискового запроса
            if (aId.startsWith(searchTerm) && !bId.startsWith(searchTerm)) return -1;
            if (bId.startsWith(searchTerm) && !aId.startsWith(searchTerm)) return 1;
            
            // Приоритет: имя начинается с поискового запроса
            if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
            if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
            
            // Приоритет: номер содержит поисковый запрос
            if (aId.includes(searchTerm) && !bId.includes(searchTerm)) return -1;
            if (bId.includes(searchTerm) && !aId.includes(searchTerm)) return 1;
            
            // Приоритет: имя содержит поисковый запрос
            if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
            if (bName.includes(searchTerm) && !aName.includes(searchTerm)) return 1;
            
            // Сортировка по номеру кабинета
            return a.id - b.id;
        });
    },
    
    // Сохранение данных в localStorage
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            return false;
        }
    },
    
    // Загрузка данных из localStorage
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return null;
        }
    },
    
    // Удаление данных из localStorage
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка удаления из localStorage:', error);
            return false;
        }
    },
    
    // Форматирование номера кабинета для отображения
    formatRoomNumber(roomName) {
        // Извлекаем номер кабинета из названия
        const match = roomName.match(/(\d+[а-яА-Я]?)/);
        return match ? match[1] : roomName;
    },
    
    // Получение этажа из номера кабинета
    getFloorFromRoomNumber(roomNumber) {
        if (!roomNumber) return null;
        
        const match = roomNumber.match(/^(\d+)/);
        if (match) {
            const number = parseInt(match[1]);
            // Предполагаем, что первая цифра - этаж (для кабинетов 100-199 - 1 этаж, 200-299 - 2 этаж и т.д.)
            return Math.floor(number / 100);
        }
        return null;
    },
    
    // Создание уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Экспорт утилит
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapUtils;
}