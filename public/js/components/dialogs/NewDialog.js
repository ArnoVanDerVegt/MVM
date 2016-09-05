(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'components.dialogs.NewDialog',
        React.createClass({
            getInitialState: function() {
                return {
                    visible: false,
                    title:   'Create a new file'
                };
            },

            onClose: function() {
                this.setState({
                    visible: false
                });
            },

            onSelect: function(file) {
                var activeFile = this.state.activeFile,
                    path       = activeFile ? activeFile.getPath() : '/',
                    files      = this.props.files,
                    filename   = files.newName(path + '/file', file.ext);

                this.state.onConfirm && this.state.onConfirm(filename);
                this.setState({
                    visible: false
                });
            },

            render: function() {
                var files = [
                        {
                            icon:        'icon-project',
                            ext:         '.whlp',
                            title:       'Whlp',
                            description: 'Mindstorms VM project file.'
                        },
                        {
                            icon:        'icon-bracket',
                            ext:         '.whl',
                            title:       'Whl',
                            description: 'Mindstorms VM include file.'
                        },
                        {
                            icon:        'icon-image-file',
                            ext:         '.rgf',
                            title:       'Rgf',
                            description: 'Robot graphics file.'
                        }
                    ],
                    fileChildren = [];

                for (var i = 0; i < files.length; i++) {
                    (function(file) {
                        fileChildren.push({
                            type: 'li',
                            props: {
                                onClick: function() { this.onSelect(file); }.bind(this)
                            },
                            children: [
                                {
                                    props: {
                                        className: 'icon ' + file.icon,
                                    }
                                },
                                {
                                    props: {
                                        className: 'new-item-details'
                                    },
                                    children: [
                                        {
                                            type: 'h4',
                                            props: {
                                                className: 'new-item-title',
                                                innerHTML: file.title
                                            }
                                        },
                                        {
                                            type: 'span',
                                            props: {
                                                className: 'new-item-description',
                                                innerHTML: file.description
                                            }
                                        }
                                    ]
                                }
                            ]
                        });
                    }).call(this, files[i]);
                }

                return utilsReact.fromJSON(
                    wheel.components.dialogs.createDialog(
                        this,
                        'new',
                        this.state.icon || 'icon-file',
                        [
                            {
                                props: {
                                    className: 'new-content'
                                },
                                children: [
                                    {
                                        type:     'ul',
                                        children: fileChildren
                                    }
                                ]
                            }
                        ],
                        [
                            {
                                type: 'button',
                                props: {
                                    className: 'button',
                                    innerHTML: 'Cancel',
                                    onClick:   this.onClose
                                }
                            }
                        ]
                    )
                );
            }
        })
    );
})();