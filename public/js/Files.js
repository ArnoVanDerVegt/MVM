var File = Class(function() {
		this.init = function(opts) {
			this._dir 		= opts.dir;
			this._files		= opts.files;
			this._name 		= opts.name || this._files.createNewName('File');
			this._canRename = ('canRename' in opts) ? opts.canRename : true;
			this._data 		= opts.data || '';
			this._hasData 	= ('data' in opts) || this._dir;
			this._isSaved 	= ('saved' in opts) ? opts.saved : false;
		};

		this.getName = function() {
			return this._name;
		};

		this.setNameLocal = function(name) {
			this._name = name;
		};

		this.setName = function(name, callback) {
			ajaxUtils.send(
				'/api/rename?oldFilename=' + encodeURIComponent(this._name) + '&newFilename=' + encodeURIComponent(name),
				function(error, data) {
					if (error) {
						console.error(error, data);
					} else {
						if (this._dir) {
							this._files.renameDir(this._name, name);
						}
						this._name = name;
						callback && callback();
					}
				}.bind(this)
			);
		};

		this.getData = function(callback) {
			if (callback) {
				if (this._hasData) {
					callback(this._data);
					return;
				}
				ajaxUtils.send(
					'/api/file?filename=' + encodeURIComponent(this._name),
					function(error, data) {
						if (error) {
							console.error(error, data);
						} else {
							this._saved 	= true;
							this._hasData 	= true;
							this._data 		= data;
							callback(data);
						}
					}.bind(this)
				);
			} else {
				return this._data;
			}
		};

		this.setData = function(data) {
			this._saved 	= false;
			this._hasData 	= true;
			this._data 		= data;
		};

		this.getHasData = function() {
			return this._hasData;
		};

		this.getCanRename = function() {
			return this._canRename;
		};

		this.getDir = function() {
			return this._dir;
		};

		this.getPath = function() {
			if (this._dir) {
				return this._name;
			}
			var i = this._name.lastIndexOf('/');
			return this._name.substr(0, i);
		};

		this.toString = function() {
			return this._name;
		};

		this.save = function() {
			if (this._isSaved) {
				return;
			}
			this._saved = true;
			ajaxUtils.send(
				'/api/file?filename=' + encodeURIComponent(this._name),
				function(error, data) {
					if (error) {
						console.error(error, data);
						this._saved = false;
					}
				}.bind(this),
				{
					data: 'hello!'
				}
			);
		};
	});

var Files = Class(Emitter, function(supr) {
		this.init = function(opts) {
			supr(this, 'init', arguments);

			this._files = [];
			ajaxUtils.send('/api/dir', this.onDir.bind(this));
		};

		this.onDir = function(error, data) {
			this._files = [];

			if (error) {
				return;
			}
			var files 		= data.files,
				toString 	= function() { return this.name; };
			for (var i = 0; i < files.length; i++) {
				files[i].toString = toString;
			}
			files.sort();
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				this.createFile({
					name: 		file.name,
					dir: 		!!file.dir,
					hasData: 	false,
					saved: 		true
				});
			}
			this.emit('Loaded');
		};

		this.exists = function(name) {
			if (name[0] !== '/') {
				name = '/' + name;
			}
			var files = this._files;
			for (var i = 0; i < files.length; i++) {
				if (files[i].getName() === name) {
					return i;
				}
			}
			return false;
		};

		this.newName = function(start, end) {
			var files  	= this._files,
				name,
				index	= 1;

			while (true) {
				name = start + index + end;
				if (this.exists(name) === false) {
					break;
				}
				index++;
			}

			return name;
		};

		this.getFile = function(index) {
			return this._files[index] || null;
		};

		this.getLength = function() {
			return this._files.length;
		};

		this.createFile = function(fileOpts) {
			fileOpts.files = this;
			var file = new File(fileOpts);
			file.save();
			this._files.push(file);
			this._files.sort();
		};

		this.renameDir = function(oldName, newName) {
			var files 	= this._files,
				length 	= oldName.length;
			for (var i = 0; i < files.length; i++) {
				var file = files[i],
					name = file.getName();
				if (name.substr(0, length) === oldName) {
					file.setNameLocal(newName + name.substr(length - name.length));
				}
			}
		};

		this.removeFile = function(name) {
			ajaxUtils.send(
				'/api/remove-file?filename=' + encodeURIComponent(name),
				function(error, data) {
					if (error) {
						console.error(error, data);
						this._saved = false;
					} else {
						var files = this._files;
						for (var i = 0; i < files.length; i++) {
							if (files[i].getName() === name) {
								files.splice(i, 1);
								return;
							}
						}
					}
				}.bind(this),
				{
					post: true
				}
			);
		};

		this.removeDir = function(name) {
			ajaxUtils.send(
				'/api/remove-dir?path=' + encodeURIComponent(name),
				function(error, data) {
					if (error) {
						console.error(error, data);
						this._saved = false;
					} else {
						var length 	= name.length,
							files 	= this._files,
							i 		= 0;

						while (i < files.length) {
							if (files[i].getName().substr(0, length) === name) {
								files.splice(i, 1);
							} else {
								i++;
							}
						}
					}
				}.bind(this),
				{
					post: true
				}
			);
		};
	});