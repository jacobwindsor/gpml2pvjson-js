'use strict';

var Strcase = require('tower-strcase')
  , _ = require('lodash')
  , GpmlUtilities = require('./gpml-utilities.js')
  ;

module.exports = {
  toPvjson: function(args) {
    var pvjsonElement = args.pvjsonElement
      , gpmlElement = args.gpmlElement
      , attributeElement = args.attributeElement
      ;

    if (!attributeElement || !gpmlElement || !pvjsonElement) {
      throw new Error('Missing input element(s) in attribute.toPvjson()');
    }

    // NOTE: Yes, 'attributeElementAttributes' is confusing, but that's just the
    // way it needs to be when GPML has an element named 'Attribute'.
    var attributeElementAttributes = attributeElement.attributes
      , attributeKey = attributeElementAttributes.Key.value
      , attributeValue = attributeElementAttributes.Value.value
      ;

    if (attributeKey === 'org.pathvisio.DoubleLineProperty') {
      pvjsonElement.shape += '-double';
      // The line below is left here for future reference, but after discussing with AP, the desired behavior is for the entire shape to be filled. -AR
      //pvjsonElement.fillRule = 'evenodd';
    } else if (attributeKey === 'org.pathvisio.CellularComponentProperty') {
      //pvjson.type = 'PhysicalEntity'; // this is probably more valid as Biopax
      pvjsonElement.type = 'CellularComponent'; // this is not valid Biopax
      pvjsonElement.entityReference = attributeValue;
    }

    return pvjsonElement;
  }

};