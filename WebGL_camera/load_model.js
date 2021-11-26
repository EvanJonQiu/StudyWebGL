var load_model = function(gl, scene_object, program, program_ray, model_list, gl2, prgram2) {
  var self = this;
  var downloads_needed = 0;
  var number_retrieved = 0;

  var model_data_dictionary = {};  // text data from model files

  var model_dictionary = {}; // models
  var materials_dictionary = {}; // materials ['filename']['materialname']

  var scene = null;
  var out = null;

  function _downloadAllModels(model_list) {
    var j;
    for (j = 0; j < model_list.length; j += 1) {
      _downloadModel(model_list[j]);
    }
  }

  function _downloadModel(obj_filename) {

    $.get(obj_filename,
      function (data) {
        var file_name, material_filename_list;

        number_retrieved += 1;
        console.log("Model '" + obj_filename + "' has been downloaded.");

        file_name = self.parseFilename(obj_filename).filename;

        // Remember the data in a dictionary. The key is the file name with
        // the file extension removed.
        model_data_dictionary[file_name] = data;

        material_filename_list = getMaterialFileNamesFromOBJ(data, out);

        console.log('Found these material MTL files: ' + Object.keys(material_filename_list));

        // Now get all of the material files and increase the number of
        // files that are needed before execution can begin.
        downloads_needed += material_filename_list.length;
        var j;
        for (j = 0; j < material_filename_list.length; j += 1) {
          _downloadMaterialsFile(obj_filename, material_filename_list[j]);
        }

        _initializeRendering();
      }
    );
  }

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
        more_models = createModelsFromOBJ(model_data_dictionary[name], materials_dictionary[name], out);
        _addModelsToModelDictionary(more_models);
      }

      // Create a Scene object which does all the rendering and events
      scene = new window[scene_object](gl, program, program_ray, model_dictionary, gl2, prgram2);
      scene.render();
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

  downloads_needed = model_list.length;
  _downloadAllModels(model_list);
};