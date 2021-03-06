import { applyDefaults as baseApplyDefaults } from './gpml-utilities';

// anchors
// see jsPlumb anchor model: http://jsplumbtoolkit.com/doc/anchors
// TODO The documention below is out-of-date. See also pathvisiojs.formatConverter.gpml.point()
// This model is not fully formed.
// an anchor is an attachment point at which an edge can originate or terminate.
// It has the following elements:
// anchor = {
//  id: unique value for this anchor
//  references: reference to the pathway element to which the anchor is bound.
//  position: percentage of the distance along the specified side of the element or the edge to which the anchor is bound.
//    For nodes, if the side specified is right or left, the starting point is the topmost point on the side, and
//    if the side specified is top or bottom, the starting point is the leftmost point on the side (smallest x or y value in SVG coordinate system).
// }

const ANCHOR_DEFAULTS = {
	attributes: {
		Shape: {
			name: 'Shape',
			value: 'None'
		}
	},
	Graphics: {
		attributes: {
			LineThickness: {
				name: 'LineThickness',
				value: 0
			}
		}
	}
};

export function applyDefaults(gpmlElement, defaults) {
	var defaultsByShapeType = {
		Circle: {
			attributes: {
				Height: {
					name: 'Height',
					value: 8
				},
				LineThickness: {
					name: 'LineThickness',
					value: 0
				},
				Shape: {
					name: 'Shape',
					value: 'Circle'
				},
				Width: {
					name: 'Width',
					value: 8
				}
			}
		},
		None: {
			attributes: {
				Height: {
					name: 'Height',
					value: 4
				},
				LineThickness: {
					name: 'LineThickness',
					value: 0
				},
				Shape: {
					name: 'Shape',
					value: 'None'
				},
				Width: {
					name: 'Width',
					value: 4
				}
			}
		}
	};
	const drawAs = !!gpmlElement.attributes.Shape ? gpmlElement.attributes.Shape.value : 'None';
	return baseApplyDefaults(gpmlElement, [defaultsByShapeType[drawAs], ANCHOR_DEFAULTS, defaults]);
};

export function getAllFromNode(jsonNode) {
	//self.jsonNode = jsonNode;
	var jsonAnchors = [];
	var parentId, renderableType, id, position, x, y, sideOffsetX, sideOffsetY, positionOffsetX, positionOffsetY;
	/*
	var elementSides = [
		{'side': 'top', 'initialEdgeDirection': 90},
		{'side': 'right', 'initialEdgeDirection': 0},
		{'side': 'bottom', 'initialEdgeDirection': 270},
		{'side': 'left', 'initialEdgeDirection': 180}
	];
	//*/
	var elementSides = [
		{'side': 'top', 'dx': 0, 'dy': -1},
		{'side': 'right', 'dx': 1, 'dy': 0},
		{'side': 'bottom', 'dx': 0, 'dy': 1},
		{'side': 'left', 'dx': -1, 'dy': 0}
	];
	var anchorPositions = [0.25, 0.5, 0.75];

	parentId = jsonNode.id;
	renderableType = 'anchor';

	elementSides.forEach(function(element) {
		sideOffsetX = Math.max(element.dx, 0) * jsonNode.width;
		sideOffsetY = Math.max(element.dy, 0) * jsonNode.height;
		anchorPositions.forEach(function(position) {
			id = String(jsonNode.id) + String(element.side) + String(position);
			positionOffsetX = Math.abs(element.dy) * position * jsonNode.width;
			positionOffsetY = Math.abs(element.dx) * position * jsonNode.height;
			x = jsonNode.x + sideOffsetX + positionOffsetX;
			y = jsonNode.y + sideOffsetY + positionOffsetY;
			jsonAnchors.push({
				'parentId': jsonNode.id,
				'renderableType': 'anchor',
				'side': element.side,
				'dx': element.dx,
				'dy': element.dy,
				'id': id,
				'position': position,
				'x': x,
				'y': y
			});
		});
	});
	return jsonAnchors;
};
