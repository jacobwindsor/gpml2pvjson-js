var GpmlElement = require('./element.js')
  , Graphics = require('./graphics.js')
  , Point = require('./point.js')
  , strcase = require('tower-strcase')
  , Anchor = require('./anchor.js')
  , _ = require('lodash')
  ;

var markerNameToIdentifierMappings = {
  'arrow': {
    biopax:{
      name:'Interaction'
    },
    sbo:['SBO:0000167', 'SBO:0000393', 'SBO:0000394']
  },
  't-bar': {
    biopax:{
      name:'Control',
      controlType:'INHIBITION'
    },
    sbo:['SBO:0000169']
  },
  'mim-gap': { // are there Biopax and SBO mappings for this?
    biopax:{
      name:'Interaction'
    }
  },
  'mim-branching-right': { // are there Biopax and SBO mappings for this?
    biopax:{
      name:'Interaction'
    }
  },
  'mim-branching-left': { // are there Biopax and SBO mappings for this?
    biopax:{
      name:'Interaction'
    }
  },
  'mim-inhibition':{
    biopax:{
      name:'Control',
      controlType:'INHIBITION'
    },
    sbo:['SBO:0000169']
  },
  'mim-conversion':{
    biopax:{
      name:'Conversion'
    },
    sbo:['SBO:0000182']
  },
  'mim-necessary-stimulation':{
    biopax:{
      name:'Control',
      controlType:'ACTIVATION' // does anyone object?
    },
    sbo:['SBO:0000171']
  },
  'mim-binding':{
    biopax:{
      name:'MolecularInteraction' // what about ComplexAssembly?
    },
    sbo:['SBO:0000177'] // this is non-covalent binding in SBO
  },
  'mim-stimulation':{
    biopax:{
      name:'Control',
      controlType:'ACTIVATION' // does anyone object?
    },
    sbo:['SBO:0000170']
  },
  'mim-modification':{
    biopax:{
      name:'BiochemicalReaction'
    },
    sbo:['SBO:0000210']
  },
  'mim-catalysis':{
    biopax:{
      name:'Catalysis'
    },
    sbo:['SBO:0000172']
  },
  'mim-cleavage':{
    biopax:{
      name:'Degradation'
    },
    sbo:['SBO:0000178']
  },
  'mim-covalent-bond':{
    biopax:{
      name:'BiochemicalReaction'
    },
    sbo:['SBO:0000210'], // this doesn't exactly match, but it seems the closest
  },
  'mim-transcription-translation':{
    biopax:{
      name:'GeneticInteraction'
    },
    sbo:['SBO:0000183', 'SBO:0000184']
  }
};

module.exports = {
  applyDefaultGraphicsAttributes: function(gpmlElement) {
    var defaults = {
      Color: {
        name: 'Color',
        value: '000000'
      },
      FillColor: {
        name: 'FillColor',
        value: 'Transparent'
      },
      LineThickness: {
        name: 'LineThickness',
        value: 1
      }
    };

    gpmlElement.Graphics = {};
    gpmlElement.Graphics.attributes = defaults;

    return gpmlElement;
  },

  toPvjson: function(pvjson, gpmlElement) {
    var currentPvjsonClassElement = {};
    currentPvjsonClassElement.id = gpmlElement.attributes.GraphId.value;
    gpmlElement = this.applyDefaultGraphicsAttributes(pvjson, gpmlElement);
    return {currentPvjsonClassElement:currentPvjsonClassElement, gpmlElement:gpmlElement};
  },

  toPvjsonOld: function(pvjson, gpmlSelection, interactionSelection, callback) {
    var jsonAnchorInteraction
      , anchor
      , jsonAnchor
      , points
      , jsonPoints
      , relationType
      , target
      , targetId
      , groupRef
      , source
      , sourceId
      , pvjsonElements
      , pvjsonPath = {}
      ;

    GpmlElement.toPvjson(pvjson, gpmlSelection, interactionSelection, pvjsonPath, function(pvjsonPath) {
      Graphics.toPvjson(pvjson, gpmlSelection, interactionSelection, pvjsonPath, function(pvjsonPath) {
        Point.toPvjson(pvjson, gpmlSelection, interactionSelection, pvjsonPath, function(pvjsonPath, referencedElementTags) {
          Anchor.toPvjson(pvjson, gpmlSelection, interactionSelection, pvjsonPath, function(pvjsonAnchor) {
            var sourceNode, targetNode, marker;
            if (!!pvjsonPath.markerStart) {
              marker = pvjsonPath.markerStart;
              // sometimes the graphical terminology (startMarker, endMarker) won't line up with the graph terminology.
              sourceNode = pvjsonPath.points[pvjsonPath.points.length - 1].isAttachedTo;
              targetNode = pvjsonPath.points[0].isAttachedTo;
            } else if (!!pvjsonPath.markerEnd) {
              marker = pvjsonPath.markerEnd;
              sourceNode = pvjsonPath.points[0].isAttachedTo;
              targetNode = pvjsonPath.points[pvjsonPath.points.length - 1].isAttachedTo;
            }

            // this can be overridden with a more specific term below
            var biopaxType = 'Interaction';
            if (!!sourceNode && !!targetNode) {
              var markerInStringCase = strcase.paramCase(marker);
              var identifierMappings = markerNameToIdentifierMappings[markerInStringCase];
              if (!!identifierMappings && !!identifierMappings.biopax && !!identifierMappings.biopax.name) {
                biopaxType = identifierMappings.biopax.name;
              }

              /* this below is an attempt to model interactions using named graphs
              pvjsonPath.relationGraph = [{
                id: sourceNode,
                relation: targetNode
              }];
              //*/
              
              // and this is an attempt to model interactions using Biopax
              // TODO still need to consider things like CovalentBindingFeature, etc.
              if (biopaxType === 'Interaction' && !!identifierMappings && !!identifierMappings.controlType) {
                pvjsonPath.participants = [];
                pvjsonPath.participants.push(sourceNode);
                pvjsonPath.participants.push(targetNode);
              } else if (biopaxType === 'Control' || biopaxType === 'Catalysis') {
                if (!!identifierMappings && !!identifierMappings.controlType) {
                  pvjsonPath.controlType = identifierMappings.controlType;
                }
                pvjsonPath.controller = sourceNode;
                pvjsonPath.controlled = targetNode;
              } else if (biopaxType === 'Conversion' || biopaxType === 'BiochemicalReaction') {
                if (!!pvjsonPath.markerStart && !!pvjsonPath.markerEnd) { // TODO this isn't actually checking the other marker to make sure it also indicates conversion
                  pvjsonPath.conversionDirection = 'REVERSIBLE';
                } else {
                  pvjsonPath.conversionDirection = 'LEFT-TO-RIGHT';
                }
                pvjsonPath.left = sourceNode;
                pvjsonPath.right = targetNode;
              } else {
                pvjsonPath.participants = [];
                pvjsonPath.participants.push(sourceNode);
                pvjsonPath.participants.push(targetNode);
              }

              /*
              if (markerInStringCase === 'mim-binding' || markerInStringCase === 'mim-covalent-bond') {
                // TODO something with entityFeature, BindingFeature, CovalentBindingFeature, bindsTo...
              }
              //*/

              if (!!identifierMappings && !!identifierMappings.sbo && identifierMappings.sbo.length > 0) {
                pvjsonPath.interactionType = identifierMappings.sbo;
              }
            } else {
              console.warn('Unconnected Interaction(s) present in this pathway.');
            }
            pvjsonPath.type = biopaxType;

            pvjsonElements = [pvjsonPath].concat(pvjsonAnchor);
            callback(pvjsonElements);
          });
        });
      });
    });
  }
};
