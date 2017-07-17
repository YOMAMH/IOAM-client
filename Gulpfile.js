/**
 * Created by renminghe on 2017/2/28.
 */
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cssmin = require('gulp-minify-css');


// 合并，压缩css文件
gulp.task('minCss', function() {
    gulp.src('./src/assets/css3singoin/css/*.css')
        .pipe(cssmin())
        .pipe(rename('singoin.min.css'))
        .pipe(gulp.dest('./src/assets/css3singoin/css'));

});


// 合并，压缩文件
gulp.task('login', function() {
    gulp.src('./src/assets/css3singoin/js/login.js')
        .pipe(uglify())
        .pipe(rename('login.min.js'))
        .pipe(gulp.dest('./src/assets/css3singoin/js'));
});

// 合并，压缩文件
gulp.task('cookie', function() {
    gulp.src('./src/assets/css3singoin/js/js-cookie.js')
        .pipe(uglify())
        .pipe(rename('js-cookie.min.js'))
        .pipe(gulp.dest('./src/assets/css3singoin/js'));
});

// 合并，压缩文件
gulp.task('silviomoreto', function() {
    gulp.src('./src/assets/silviomoreto/bootstrap-select.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./src/assets/silviomoreto'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run('minCss','cookie', 'login', 'silviomoreto');

    // 监听文件变化
    gulp.watch('./src/assets/css3singoin/js/login.js', function(){
        gulp.run('login');
    });
    gulp.watch('./src/assets/css3singoin/css/*.css', function(){
        gulp.run('minCss');
    });
    gulp.watch('./src/assets/silviomoreto/bootstrap-select.js', function(){
        gulp.run('silviomoreto');
    });
});