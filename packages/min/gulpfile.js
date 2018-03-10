const gulp = require('gulp')
const ts = require('gulp-typescript')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const watch = require('gulp-watch')
const merge = require('merge2')

let tsProject = ts.createProject('tsconfig.json')

gulp.task('clean', function () {
  gulp
    .src(['dist', 'lib', 'types'])
    .pipe(clean())
})

gulp.task('tsc', function () {
  let tsResult = gulp.src('src/**/*.ts').pipe(tsProject())

  return merge([
    tsResult.dts.pipe(gulp.dest('types')),
    tsResult.js
    .pipe(gulp.dest('lib'))
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
  ])
})

gulp.task('watch', function () {
    return gulp.watch('src/**/*.ts', ['tsc'])
});

gulp.task('default', ['clean', 'tsc'])
