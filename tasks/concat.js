/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

module.exports = function(grunt) {

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('concat', 'Concatenate files.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: grunt.util.linefeed,
      banner: '',
      stripBanners: false,
      process: false
    });

    // Normalize boolean options that accept options objects.
    if (options.stripBanners === true) { options.stripBanners = {}; }
    if (options.process === true) { options.process = {}; }

    // Process banner.
    var banner = grunt.template.process(options.banner);

    // Iterate over all specified file groups.
    this.files.forEach(function(fileObj) {
      // The source files to be concatenated.
      var files = grunt.file.expandFiles(fileObj.src);

      // Concat banner + specified files.
      var src = banner + files.map(function(filepath) {
        // Read file source.
        var src = grunt.file.read(filepath);
        // Process files as templates if requested.
        if (options.process) {
          src = grunt.template.process(src, options.process);
        }
        // Strip banners if requested.
        if (options.stripBanners) {
          src = grunt.helper('strip_banner', src, options.stripBanners);
        }
        return src;
      }).join(grunt.util.normalizelf(options.separator));

      // Write the destination file.
      grunt.file.write(fileObj.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + fileObj.dest + '" created.');
    }, this);
  });

  // Return the given source coude with any leading banner comment stripped.
  grunt.registerHelper('strip_banner', function(src, options) {
    if (!options) { options = {}; }
    var m = [];
    if (options.line) {
      // Strip // ... leading banners.
      m.push('(?:.*\\/\\/.*\\n)*\\s*');
    }
    if (options.block) {
      // Strips all /* ... */ block comment banners.
      m.push('\\/\\*[\\s\\S]*?\\*\\/');
    } else {
      // Strips only /* ... */ block comment banners, excluding /*! ... */.
      m.push('\\/\\*[^!][\\s\\S]*?\\*\\/');
    }
    var re = new RegExp('^\\s*(?:' + m.join('|') + ')\\s*', '');
    return src.replace(re, '');
  });

};
