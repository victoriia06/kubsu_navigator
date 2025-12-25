export default class PointsManager {
  constructor(points) {
    this.allPoints = points;
  }

  getPoints(building, floor) {
    return this.allPoints.filter(p => p.building === building && p.floor === floor);
  }

  search(query, building = null, floor = null) {
    let results = this.allPoints;
    
    if (building) {
      results = results.filter(p => p.building === building);
    }
    
    if (floor) {
      results = results.filter(p => p.floor === floor);
    }
    
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.id.toLowerCase().includes(queryLower)
      );
    }
    
    return results.slice(0, 20);
  }

  getPointById(id) {
    return this.allPoints.find(p => p.id === id);
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