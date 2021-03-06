import * as GpmlUtilities from './gpml-utilities';

export let SHAPE_DEFAULTS = {
	attributes: {
		Align: {
			name: 'Align',
			value: 'Center'
		},
		Color: {
			name: 'Color',
			value: '000000'
		},
		FillColor: {
			name: 'FillColor',
			value: 'Transparent'
		},
		FontSize: {
			name:'FontSize',
			value:10
		},
		LineThickness: {
			name: 'LineThickness',
			value: 1
		},
		Padding: {
			name: 'Padding',
			value: '0.5em'
		},
		ShapeType: {
			name: 'ShapeType',
			value: 'Rectangle'
		},
		Valign: {
			name: 'Valign',
			value: 'Top'
		},
		ZOrder: {
			name: 'ZOrder',
			value: 0
		},
	}
};

export function applyDefaults(gpmlElement, defaults) {
	gpmlElement = GpmlUtilities.applyDefaults(gpmlElement, [SHAPE_DEFAULTS, defaults]);
	return gpmlElement;
};
