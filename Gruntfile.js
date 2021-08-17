"use strict";

module.exports = function (grunt) {
	grunt.loadNpmTasks("grunt-assemble");
	grunt.loadNpmTasks("grunt-modernizr");
	grunt.loadNpmTasks("grunt-responsive-images");

	grunt.initConfig({
		assemble: {
			options: {
				helpers: ["handlebars-helpers", "handlebars-helper-repeat"],
				partials: "src/templates/partials/**/*.hbs",
				layoutdir: "src/templates/layouts",
				ext: ".html",
			},
			site: {
				expand: true,
				cwd: "src/templates/pages",
				src: ["**/*.hbs"],
				dest: "public/",
			},
		},

		modernizr: {
			dist: {
				crawl: false,
				customTests: [],
				dest: "./public/js/modernizr-output.js",
				tests: ["backgroundblendmode"],
				options: ["setClasses"],
				uglify: true,
			},
		},

		// responsive_images: {
		// 	options: {
		// 		quality: 60,
		// 		createNoScaledImage: true
		// 	},
		//     myTask: {
		//       options: {
		//         sizes: [{
		//         	name: '1000',
		//         	width: 1000
		//         },{
		//         	name: '1500',
		//         	width: 1500
		//         }]

		//         retina example
		//         {
		//         	name: '1000',
		//         	suffix: "-2x",
		//         	width: 2000
		//         }
		//       },
		//       files: [{
		//         expand: true,
		//         src: ['img/**/*.{jpg,png}'],
		//         cwd: 'src/',
		//         dest: 'public/'
		//       }]
		//     }
		//   },
	});
};
