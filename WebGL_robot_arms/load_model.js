var load_model = function(gl, program, model_list, transform, transformLocation, colorLocation, positionAttributeLocation) {
  var self = this;

  var number_retrieved = 0;
  var downloads_needed = 0;

  var model_data_dictionary = {};

  var model_dictionary = {}; // models
  var materials_dictionary = {}

  function _downloadAllModels() {
    var j;
    for (j = 0; j < model_list.length; j += 1) {
      _downloadModel(model_list[j]);
    }
  };

  function _downloadModel(obj_filename) {
    $.get(obj_filename, function(data) {
      var file_name, material_filename_list;

      number_retrieved += 1;
      console.log("Model '" + obj_filename + "' has been downloaded.");

      file_name = self.parseFilename(obj_filename).filename;

      model_data_dictionary[file_name] = data;

      var material_filename_list = getMaterialFileNamesFromOBJ(data);

      downloads_needed += material_filename_list.length;
      var j;
      for (j = 0; j < material_filename_list.length; j += 1) {
        _downloadMaterialsFile(obj_filename, material_filename_list[j]);
      }

      _initializeRendering();
    });
  };

  function _downloadMaterialsFile(obj_filename, mtl_filename) {
    var myget, file_parts, path_to_obj;
    var j, materials, material_names, name;

    // Use the path to the model file to get the materials file.
    file_parts = self.parseFilename(obj_filename);
    path_to_obj = file_parts.path;
    mtl_filename = path_to_obj + mtl_filename;

    myget = $.get(mtl_filename,
      function (data) {
        number_retrieved += 1;
        console.log("Materials file '" + mtl_filename + "' has been downloaded.");

        // Process the materials data and store it for the associated OBJ model
        materials = createObjModelMaterials(data);
        materials_dictionary[file_parts.filename] = materials;

        // If any of the materials reference texture map images, download the images
        material_names = Object.keys(materials);
        for (j = 0; j < material_names.length; j += 1) {
          name = material_names[j];
          if (materials[name].map_Kd) {
            _downloadTextureMapImage(obj_filename, materials[name], materials[name].map_Kd);
          }
        }

        _initializeRendering();
      }
      );
    myget.fail(
      function () {
        console.log("The get for the materials file '" + mtl_filename + "' failed.");
      }
    );
  };

  self.parseFilename = function (file_name) {
    var dot_position, slash_position, path, root, extension;
    var results = { path: "", filename: "", extension: ""};

    // Get the extension
    dot_position = file_name.lastIndexOf('.');
    if (dot_position > 0) {
      results.extension = file_name.substr(dot_position+1);
      results.filename = file_name.substr(0, dot_position);
    } else {
      results.extension = "";
      results.filename = file_name;
    }

    // Get the path
    slash_position = results.filename.lastIndexOf('/');
    if (slash_position > 0) {
      results.path = results.filename.substr(0,slash_position + 1);
      results.filename = results.filename.substr(slash_position + 1);
    } else {
      results.path = "";
    }

    return results;
  };

  self.getModelDictionary = function() {
    return model_dictionary;
  }

  function _initializeRendering() {

    console.log("In _initializeRendering: " + number_retrieved + " of " +
                downloads_needed + " files have been retrieved");
    if (number_retrieved >= downloads_needed) {
      console.log("All files have been retrieved!");

      var j, material_keys, material_filename, model_names, name, more_models;
      var materials_for_models;

      // Build all of the material properties from text data
      //material_keys = Object.keys(materials_data_dictionary);
      //for (j = 0; j < material_keys.length; j += 1) {
      //  material_filename = material_keys[j];
      //  materials_for_models = createObjModelMaterials(materials_data_dictionary[material_filename]);
      //  materials_dictionary[material_filename] = materials_for_models;
      //}

      // Build all of the models for rendering
      model_names = Object.keys(model_data_dictionary);
      for (j = 0; j < model_names.length; j += 1) {
        name = model_names[j];
        more_models = createModelsFromOBJ(model_data_dictionary[name], materials_dictionary[name]);
        _addModelsToModelDictionary(more_models);
      }

      // Create a Scene object which does all the rendering and events
      scene = new window['webgl_render'](gl, program, model_dictionary.Base, transformLocation, colorLocation, positionAttributeLocation);
      scene.render(transform, transformLocation);
    }
  }

  function _addModelsToModelDictionary(new_models) {
    var j, model_names, index, name;

    // Add them by index
    if (model_dictionary.number_models === undefined) {
      model_dictionary.number_models = 0;
    }
    for (j = 0; j < new_models.number_models; j += 1) {
      model_dictionary[model_dictionary.number_models] = new_models[j];
      model_dictionary.number_models += 1;
    }

    // Add them by name
    model_names = Object.keys(new_models);
    for (j = 0; j < model_names.length; j += 1) {
      name = model_names[j];
      if (name !== 'number_models' && isNaN(parseInt(name, 10))) {
        model_dictionary[name] = new_models[name];
      }
    }
  }

  function _downloadTextureMapImage(obj_filename, material, image_filename) {
    var file_parts, path_to_obj, filename;

    // Use the path to the model file to get the materials file.
    file_parts = self.parseFilename(obj_filename);
    path_to_obj = file_parts.path;
    filename = path_to_obj + image_filename;

    console.log("Texture map image '" + image_filename + "' is requested for OBJ model ", obj_filename);
    downloads_needed += 1;

    material.textureMap = new Image();
    material.textureMap.src = filename;
    material.textureMap.onload =
      function () {
        number_retrieved += 1;
        console.log("Texture map image '" + image_filename + "' has been downloaded.");

        _initializeRendering();
      };
  }

  downloads_needed = model_list.length;

  _downloadAllModels(model_list);
};