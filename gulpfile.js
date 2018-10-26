'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');


sass.compiler = require('node-sass');
 
gulp.task('sass', function () {
  return gulp.src('./style/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    // Minify the file
    .pipe(csso())
    .pipe(gulp.dest('./src/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./style/sass/**/*.scss', ['sass']);
});