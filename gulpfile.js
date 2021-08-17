"use strict";

const isProduction = process.env.NODE_ENV == "production";

const webpack = require("webpack-stream");
const compiler = require("webpack");

const gulp = require("gulp");
const gulpif = require("gulp-if");
const sass = require("gulp-sass");
const less = require("gulp-less");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cleancss = require("gulp-clean-css");
const filelist = require("gulp-filelist");
const uglify = require("gulp-uglify");
const rigger = require("gulp-rigger");
const rename = require("gulp-rename");
const spritesmith = require("gulp.spritesmith");
const rsync = require("gulp-rsync");
const zip = require("gulp-zip");

const server = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
const del = require("del");

require("gulp-grunt")(gulp);

var path = {
	assets: ["src/fonts/**", "src/video/**", "src/data/**", "src/robots.txt"],
};

/*----------  Filelist  ----------*/

gulp.task("filelist", function () {
	return gulp
		.src("src/templates/pages/*.hbs")
		.pipe(
			rename({
				extname: ".html",
			})
		)
		.pipe(filelist("filelist.json", { flatten: true }))
		.pipe(gulp.dest("public/"));
});

/*----------  Scripts  ----------*/

gulp.task("scripts", function () {
	return gulp
		.src("src/js/main.js")
		.pipe(webpack(require("./webpack.config.js"), compiler))
		.pipe(gulp.dest("public/js/"));
});

/*----------  Styles  ----------*/

gulp.task("styles", function () {
	return gulp
		.src(["src/styles/*.*", "!src/styles/_*.*"])
		.pipe(gulpif("*.scss", sass().on("error", sass.logError)))
		.pipe(gulpif("*.less", less()))
		.pipe(postcss([autoprefixer()]))
		.pipe(gulp.dest("public/css/"))
		.pipe(sourcemaps.init())
		.pipe(cleancss())
		.pipe(
			rename({
				suffix: ".min",
			})
		)
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("public/css/"))
		.pipe(server.stream());
});

gulp.task("uploads", function () {
	return gulp
		.src("src/uploads/**", { base: "src/", since: gulp.lastRun("uploads") })
		.pipe(gulp.dest("public/"));
});

/*----------  Assets  ----------*/
gulp.task("images", function () {
	return gulp
		.src("src/images/**", { base: "src/", since: gulp.lastRun("images") })
		.pipe(gulp.dest("public/"));
});

gulp.task("copy", function () {
	return gulp
		.src(path.assets, { base: "src/", since: gulp.lastRun("copy") })
		.pipe(gulp.dest("public/"));
});

gulp.task("sprite", function () {
	return gulp
		.src("src/images/sprite-png/*.png")
		.pipe(
			spritesmith({
				padding: 20,
				imgName: "sprite.png",
				imgPath: "../images/sprite.png",
				cssName: "sprite.scss",
				retinaSrcFilter: "**/*@2x.png",
				retinaImgName: "sprite@2x.png",
				retinaImgPath: "../images/sprite@2x.png",
				cssVarMap: function (sprite) {
					var iconName;
					var basePaths = ["/src/images/"];

					var fullPath = sprite.source_image.replace(/\\/g, "/");

					for (var i = 0; i < basePaths.length; i++) {
						iconName = fullPath.split(basePaths[i])[1];
						if (iconName) break;
					}

					iconName = iconName
						.replace(/\//g, "-") // replace '/' by '-'
						.replace(/(.+)\..+$/, "$1") // remove extensions
						.replace(/-@2x/, ""); // remove '-@2x' part

					sprite.name = "icon-" + iconName;
				},
			})
		)
		.pipe(
			gulpif("*.png", gulp.dest("public/images/"), gulp.dest("temp/css/"))
		);
});

/*----------  Server  ----------*/

gulp.task("watch", function () {
	gulp.watch(
		"src/templates/**/*",
		gulp.series("filelist", "grunt-assemble", "reload")
	);
	gulp.watch("src/styles/**/*", gulp.series("sprite", "styles"));
	gulp.watch("src/js/**", gulp.series("scripts", "reload"));
	gulp.watch("src/images/**", gulp.series("images", "reload"));
	gulp.watch("src/uploads/**", gulp.series("uploads", "reload"));
	gulp.watch(path.assets, gulp.series("copy", "reload"));
});

gulp.task("reload", function (done) {
	server.reload();
	done();
});

gulp.task("server", function () {
	server.init({
		server: {
			baseDir: "public/",
		},
	});
});

gulp.task("browser", gulp.parallel("server", "watch"));

/*----------  Build  ----------*/
gulp.task("clean", function () {
	return del("public/");
});

gulp.task(
	"build",
	gulp.parallel(
		"copy",
		"filelist",
		"grunt-assemble",
		gulp.series("sprite", "styles"),
		"images",
		"uploads",
		"scripts"
	)
);

/*----------  Deploy  ----------*/
gulp.task("compress", function () {
	return gulp
		.src("./public/**")
		.pipe(zip("html-vita-nord.zip"))
		.pipe(gulp.dest("./public/"));
});

gulp.task("deploy", function () {
	return gulp.src("public/**").pipe(
		rsync({
			root: "public/",
			hostname: "ildar-meyker.ru",
			destination:
				"/home/users/i/ildar-meyker/domains/ildar-meyker.ru/html/leeft/vita-nord/",
		})
	);
});
