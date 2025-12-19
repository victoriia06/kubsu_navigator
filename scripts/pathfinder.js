// Алгоритм A* для поиска пути
class PathFinder {
    constructor(grid, gridWidth, gridHeight) {
        this.grid = grid; // Двумерный массив 0=свободно, 1=стена
        this.width = gridWidth;
        this.height = gridHeight;
    }
    
    // Основной метод поиска пути
    findPath(startX, startY, endX, endY) {
        // Проверка границ
        if (!this.isValidCell(startX, startY) || !this.isValidCell(endX, endY)) {
            console.error('Координаты вне границ сетки');
            return null;
        }
        
        // Проверка, что начальная и конечная точки проходимы
        if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
            console.error('Начальная или конечная точка заблокированы');
            return null;
        }
        
        // Если точки совпадают
        if (startX === endX && startY === endY) {
            return [[startX, startY]];
        }
        
        // Создаем начальный и конечный узлы
        const startNode = new Node(startX, startY);
        const endNode = new Node(endX, endY);
        
        // Открытый и закрытый списки
        const openList = new PriorityQueue((a, b) => a.f < b.f);
        const closedSet = new Set();
        
        // Добавляем начальный узел в открытый список
        openList.push(startNode);
        
        while (!openList.isEmpty()) {
            // Находим узел с наименьшей оценкой f
            const currentNode = openList.pop();
            closedSet.add(currentNode.getKey());
            
            // Если достигли цели
            if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
                return this.reconstructPath(currentNode);
            }
            
            // Получаем соседей
            const neighbors = this.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                // Если сосед уже в закрытом списке, пропускаем
                if (closedSet.has(neighbor.getKey())) {
                    continue;
                }
                
                // Вычисляем стоимость
                const tentativeG = currentNode.g + 1;
                
                // Проверяем, есть ли уже такой узел в открытом списке
                const existingNode = openList.find(node => 
                    node.x === neighbor.x && node.y === neighbor.y
                );
                
                if (!existingNode) {
                    neighbor.g = tentativeG;
                    neighbor.h = this.calculateHeuristic(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = currentNode;
                    openList.push(neighbor);
                } else if (tentativeG < existingNode.g) {
                    existingNode.g = tentativeG;
                    existingNode.f = existingNode.g + existingNode.h;
                    existingNode.parent = currentNode;
                    openList.updatePriority(existingNode);
                }
            }
        }
        
        // Путь не найден
        return null;
    }
    
    // Получение соседних ячеек (только вертикально/горизонтально)
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            [0, -1], // Вверх
            [1, 0],  // Вправо
            [0, 1],  // Вниз
            [-1, 0]  // Влево
        ];
        
        for (const [dx, dy] of directions) {
            const newX = node.x + dx;
            const newY = node.y + dy;
            
            if (this.isWalkable(newX, newY)) {
                neighbors.push(new Node(newX, newY));
            }
        }
        
        return neighbors;
    }
    
    // Проверка, находится ли ячейка внутри сетки
    isValidCell(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    // Проверка, является ли ячейка проходимой
    isWalkable(x, y) {
        return this.isValidCell(x, y) && this.grid[y][x] === 0;
    }
    
    // Эвристическая функция (манхэттенское расстояние)
    calculateHeuristic(node, endNode) {
        return Math.abs(node.x - endNode.x) + Math.abs(node.y - endNode.y);
    }
    
    // Восстановление пути
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current !== null) {
            path.unshift([current.x, current.y]);
            current = current.parent;
        }
        
        return path;
    }
    
    // Сглаживание пути (удаление лишних точек на прямой)
    smoothPath(path) {
        if (!path || path.length < 3) return path;
        
        const smoothed = [path[0]];
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const current = path[i];
            const next = path[i + 1];
            
            // Удаляем промежуточные точки, если движение прямолинейно
            const dx1 = current[0] - prev[0];
            const dy1 = current[1] - prev[1];
            const dx2 = next[0] - current[0];
            const dy2 = next[1] - current[1];
            
            // Если направление не меняется, пропускаем текущую точку
            if (dx1 * dy2 !== dy1 * dx2) {
                smoothed.push(current);
            }
        }
        
        smoothed.push(path[path.length - 1]);
        return smoothed;
    }
    
    // Проверка прямой видимости между двумя точками
    hasLineOfSight(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            // Проверяем текущую клетку
            if (!this.isWalkable(x1, y1)) {
                return false;
            }
            
            if (x1 === x2 && y1 === y2) {
                break;
            }
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
        
        return true;
    }
}

// Класс узла для A*
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.g = 0; // Стоимость от начала
        this.h = 0; // Эвристическая оценка
        this.f = 0; // Общая оценка
        this.parent = null;
    }
    
    getKey() {
        return `${this.x},${this.y}`;
    }
}

// Приоритетная очередь для A*
class PriorityQueue {
    constructor(comparator = (a, b) => a < b) {
        this.heap = [];
        this.comparator = comparator;
        this.map = new Map(); // Для быстрого поиска узлов
    }
    
    push(node) {
        this.heap.push(node);
        this.map.set(node.getKey(), node);
        this.bubbleUp(this.heap.length - 1);
    }
    
    pop() {
        if (this.isEmpty()) return null;
        
        const root = this.heap[0];
        const last = this.heap.pop();
        this.map.delete(root.getKey());
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        
        return root;
    }
    
    bubbleUp(index) {
        const node = this.heap[index];
        
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            
            if (this.comparator(node.f, parent.f)) {
                this.heap[parentIndex] = node;
                this.heap[index] = parent;
                index = parentIndex;
            } else {
                break;
            }
        }
    }
    
    sinkDown(index) {
        const length = this.heap.length;
        const node = this.heap[index];
        
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swapIndex = null;
            let leftChild, rightChild;
            
            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (this.comparator(leftChild.f, node.f)) {
                    swapIndex = leftChildIndex;
                }
            }
            
            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swapIndex === null && this.comparator(rightChild.f, node.f)) ||
                    (swapIndex !== null && this.comparator(rightChild.f, leftChild.f))
                ) {
                    swapIndex = rightChildIndex;
                }
            }
            
            if (swapIndex === null) {
                break;
            }
            
            this.heap[index] = this.heap[swapIndex];
            this.heap[swapIndex] = node;
            index = swapIndex;
        }
    }
    
    find(predicate) {
        return this.heap.find(predicate);
    }
    
    updatePriority(node) {
        const index = this.heap.indexOf(node);
        if (index !== -1) {
            this.bubbleUp(index);
        }
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
    
    size() {
        return this.heap.length;
    }
    
    clear() {
        this.heap = [];
        this.map.clear();
    }
}

// Экспорт классов
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PathFinder, Node, PriorityQueue };
}