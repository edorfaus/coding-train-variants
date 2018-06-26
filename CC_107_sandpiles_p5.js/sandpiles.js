class Sandpile {
	constructor() {
		this.grains = 0;
		this.north = null;
		this.south = null;
		this.east = null;
		this.west = null;
	}
}

class RectangularSandpileGroup {
	constructor(maxX = 1, maxY = maxX, minX = -maxX, minY = -maxY) {
		if (maxX < 0 || maxY < 0 || minX > 0 || minY > 0) {
			throw new Error('Invalid dimensions, must incude the origin at 0,0');
		}
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;

		// Construct the rectangular board of sandpiles
		let rowMax = maxY - minY;
		let colMax = maxX - minX;
		let northWest = new Sandpile();
		let southEast = northWest;
		for (let pile = northWest, i = colMax; i > 0; i--) {
			pile.east = new Sandpile();
			pile.east.west = pile;
			pile = pile.east;
			southEast = pile;
		}
		let prevLeft = northWest;
		for (let j = rowMax; j > 0; j--) {
			let nextLeft = new Sandpile;
			nextLeft.north = prevLeft;
			prevLeft.south = nextLeft;
			let prevPile = prevLeft;
			let thisPile = nextLeft;
			for (let i = colMax; i > 0; i--) {
				prevPile = prevPile.east;
				let pile = new Sandpile();
				pile.north = prevPile;
				pile.west = thisPile;
				prevPile.south = pile;
				thisPile.east = pile;
				thisPile = pile;
			}
			southEast = thisPile;
			prevLeft = nextLeft;
		}
		this.northWest = northWest;
		this.southEast = southEast;

		// Find the origin
		let origin = northWest;
		for (let i = minX; i < 0; i++) {
			origin = origin.east;
		}
		for (let i = minY; i < 0; i++) {
			origin = origin.south;
		}
		this.origin = origin;
	}
	getPile(x, y) {
		if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
			return null;
		}
		let pile = this.origin;
		while (x < 0) {
			pile = pile.west;
			x++;
		}
		while (x > 0) {
			pile = pile.east;
			x--;
		}
		while (y < 0) {
			pile = pile.north;
			y++;
		}
		while (y > 0) {
			pile = pile.south;
			y--;
		}
		return pile;
	}
	addGrains(grains = 1, x = 0, y = 0) {
		let pile = this.getPile(x, y);
		if (pile === null) {
			throw new Error('Invalid coordinates: out of bounds');
		}
		pile.grains += grains;
		let pilesToCheckForTopple = new Set();
		pilesToCheckForTopple.add(pile);
		pilesToCheckForTopple.forEach(this.checkForTopple, this);
	}
	checkForTopple(pile, pile_, pilesToCheck) {
		pilesToCheck.delete(pile);
		if (pile.grains >= 4) {
			let grainsPerNeighbor = Math.floor(pile.grains / 4);
			pile.grains -= grainsPerNeighbor * 4;
			this.handleToppleSpread(grainsPerNeighbor, pile, pilesToCheck);
		}
	}
	handleToppleSpread(grainsPerNeighbor, pile, pilesToCheck) {
		if (pile.north !== null) {
			pile.north.grains += grainsPerNeighbor;
			if (pile.north.grains >= 4) {
				pilesToCheck.add(pile.north);
			}
		}
		if (pile.west !== null) {
			pile.west.grains += grainsPerNeighbor;
			if (pile.west.grains >= 4) {
				pilesToCheck.add(pile.west);
			}
		}
		if (pile.east !== null) {
			pile.east.grains += grainsPerNeighbor;
			if (pile.east.grains >= 4) {
				pilesToCheck.add(pile.east);
			}
		}
		if (pile.south !== null) {
			pile.south.grains += grainsPerNeighbor;
			if (pile.south.grains >= 4) {
				pilesToCheck.add(pile.south);
			}
		}
	}
	toArray() {
		let result = new Array(this.maxY - this.minY + 1);
		let w = this.maxX - this.minX + 1;
		let left = this.northWest;
		for (let y = 0; left !== null; y++, left = left.south) {
			let arr = new Array(w);
			for (let x = 0, pile = left; pile !== null; x++, pile = pile.east) {
				arr[x] = pile.grains;
			}
			result[y] = arr;
		}
		return result;
	}
}

class ExpandingRectangularSandpileGroup extends RectangularSandpileGroup {
	constructor(maxX = 1, maxY = maxX, minX = -maxX, minY = -maxY) {
		super(maxX, maxY, minX, minY);
	}
	handleToppleSpread(grainsPerNeighbor, pile, pilesToCheck) {
		if (pile.north === null) {
			this.expandNorth();
		}
		if (pile.west === null) {
			this.expandWest();
		}
		if (pile.east === null) {
			this.expandEast();
		}
		if (pile.south === null) {
			this.expandSouth();
		}

		pile.north.grains += grainsPerNeighbor;
		if (pile.north.grains >= 4) {
			pilesToCheck.add(pile.north);
		}

		pile.west.grains += grainsPerNeighbor;
		if (pile.west.grains >= 4) {
			pilesToCheck.add(pile.west);
		}

		pile.east.grains += grainsPerNeighbor;
		if (pile.east.grains >= 4) {
			pilesToCheck.add(pile.east);
		}

		pile.south.grains += grainsPerNeighbor;
		if (pile.south.grains >= 4) {
			pilesToCheck.add(pile.south);
		}
	}
	expandWest() {
		let oldWest = this.northWest;
		let newWest = new Sandpile();
		newWest.east = oldWest;
		oldWest.west = newWest;
		this.northWest = newWest;
		for (oldWest = oldWest.south; oldWest !== null; oldWest = oldWest.south) {
			let newPile = new Sandpile();
			newPile.north = newWest;
			newPile.east = oldWest;
			newWest.south = newPile;
			oldWest.west = newPile;
			newWest = newPile;
		}
		this.minX--;
	}
	expandEast() {
		let oldEast = this.southEast;
		let newEast = new Sandpile();
		newEast.west = oldEast;
		oldEast.east = newEast;
		this.southEast = newEast;
		for (oldEast = oldEast.north; oldEast !== null; oldEast = oldEast.north) {
			let newPile = new Sandpile();
			newPile.south = newEast;
			newPile.west = oldEast;
			newEast.north = newPile;
			oldEast.east = newPile;
			newEast = newPile;
		}
		this.maxX++;
	}
	expandNorth() {
		let oldNorth = this.northWest;
		let newNorth = new Sandpile();
		newNorth.south = oldNorth;
		oldNorth.north = newNorth;
		this.northWest = newNorth;
		for (oldNorth = oldNorth.east; oldNorth !== null; oldNorth = oldNorth.east) {
			let newPile = new Sandpile();
			newPile.west = newNorth;
			newPile.south = oldNorth;
			newNorth.east = newPile;
			oldNorth.north = newPile;
			newNorth = newPile;
		}
		this.minY--;
	}
	expandSouth() {
		let oldSouth = this.southEast;
		let newSouth = new Sandpile();
		newSouth.north = oldSouth;
		oldSouth.south = newSouth;
		this.southEast = newSouth;
		for (oldSouth = oldSouth.west; oldSouth !== null; oldSouth = oldSouth.west) {
			let newPile = new Sandpile();
			newPile.east = newSouth;
			newPile.north = oldSouth;
			newSouth.west = newPile;
			oldSouth.south = newPile;
			newSouth = newPile;
		}
		this.maxY++;
	}
}
