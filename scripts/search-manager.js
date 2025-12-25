export default class SearchManager {
  constructor(points) {
    this.allPoints = points;
  }

  search(query, building = null, floor = null) {
    let results = this.allPoints;
    
    if (building) {
      results = results.filter(p => p.building === building);
    }
    
    if (floor !== null) {
      results = results.filter(p => p.floor === floor);
    }
    
    if (query && query.trim()) {
      const queryLower = query.toLowerCase().trim();
      results = results.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.id.toLowerCase().includes(queryLower) ||
        (p.description && p.description.toLowerCase().includes(queryLower))
      );
    }
    
    return results.slice(0, 20);
  }

  searchByType(type) {
    return this.allPoints.filter(p => p.type === type);
  }

  searchByBuilding(building) {
    return this.allPoints.filter(p => p.building === building);
  }
}