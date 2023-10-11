var fs = require('fs');
var path = require('path');


// 把所有的后缀都改wxss以及wxml、wxs
function fileDisply(filePath) {
	fs.readdir(filePath, function(err, files) {
		if (err) {
			console.warn(err)
		} else {
			//遍历读取到的文件列表
			files.forEach(function(filename) {
				//获取当前文件的绝对路径
				var filedir = path.join(filePath, filename);
				//根据文件路径获取文件信息，返回一个fs.Stats对象
				fs.stat(filedir, function(eror, stats) {
					if (eror) {
						console.warn('获取文件stats失败');
					} else {
						var isFile = stats.isFile(); //是文件
						var isDir = stats.isDirectory(); //是文件夹
						if (isFile) {
							var regcss = /(ttss)$/;
							var regml = /(ttml)$/;
							var regsjs = /(sjs)$/;
							var regjs = /(js)$/;

							//如果是ttss则转成wxss
							if (regcss.test(filedir)) {
								let newPath = filedir.replace(regcss, 'wxss');
								reNameFile(filedir, newPath)
							}
							//如果是ttml的文件转成wxml
							if (regml.test(filedir)) {
								let newPath = filedir.replace(regml, 'wxml');
								/* 在修改好文件内容后执行的回调函数，修改文件名 */
								let callback = function() {
									reNameFile(filedir, newPath)
								}
								/* 在修改好文件内容后执行的回调函数，修改文件名 */
								amendText(filedir, callback)
							}

							//如果是sjs的文件转成wxs
							if (regsjs.test(filedir)) {
								let newPath = filedir.replace(regsjs, 'wxs');
								reNameFile(filedir, newPath)
								amendTTToWX(filedir)
							}

							//如果是js文件则将所有的tt转成wx
							if (regjs.test(filedir)) {
								amendTTToWX(filedir)
							}
						}
						if (isDir) {
							fileDisply(filedir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
						}
					}
				})
			})
		}
	})
}

fileDisply(path.resolve(__dirname))

/**
 * 新的文件路径代替旧的文件路径，如果只是修改可后缀，那么相当于修改文件类型
 * @param {旧的文件路径} path 
 * @param {新文件路径} newPath 
 */
function reNameFile(path, newPath) {
	fs.rename(path, newPath, function(err) {
		if (err) {
			console.error(err);
			return;
		}
	})
}

/**
 * 修改文件内容
 * @param {需要修改内容的文件} path 
 * @param {文件修改好需要执行的回调} callback 
 */
function amendText(path, callback) {
	fs.readFile(path, 'utf8', function(err, files) {
		console.log(err, files)
		var result = files.replace(/tt:for/g, 'wx:for')
			.replace(/tt:if/g, 'wx:if')
			.replace(/tt:for-item/g, 'wx:for-item')
			.replace(/tt:for-index/g, 'wx:for-index')
			.replace(/tt:key/g, 'wx:key')
			.replace(/\.ttml/g, '.wxml')
			.replace(/\.sjs/g, '.wxs')
			.replace(/<sjs/g, '<wxs')
			.replace(/<\/sjs>/g, '</wxs>')
		//var result = files.replace(/s-if/g,'tt:if');

		fs.writeFile(path, result, 'utf8', function(err) {
			if (err) return console.log(err);
			callback()
		});

	})
}

/**
 * 修改js中的tt全局变量改为wx
 * @param {需要修改的文件} path 
 */
function amendTTToWX(path) {
	fs.readFile(path, 'utf8', function(err, files) {
		console.log(err, files)
		var result = files.replace(/tt\./g, 'wx.');
		fs.writeFile(path, result, 'utf8', function(err) {
			if (err) return console.log(err);
		});
	})
}
