var fs = require('fs'),
    rimraf = require('rimraf'),
    _ = require('lodash'),
    events = require('events'),
    Proxy = require('./proxy.js'),
    Runner = require('./runner.js'),
    Logger = require('./logger.js'),
    Differ = require('./differ.js'),
    Report = require('./report.js');

var emptyDir = function(dirPath) {
    return rimraf.sync(dirPath);
};

var Pediff = function(config) {
    _.merge(this.config, config);
    events.EventEmitter.call(this);

    if(this.config.debug) {
        this.config.logLevel = 0;
    } else {
        this.config.logLevel = 1;
    }

    this.initialize();
};

Pediff.prototype = _.extend({
    config: {},
    specs: [],
    busy: false,
    initialize: function() {
        this.logger = new Logger(this.config.debug);
        this.runner = new Runner(this.config);
        this.differ = new Differ(this.config);

        if(!this.config.environments.length) {
            Proxy.emit('error', 'At least 2 environments must be given, exiting...');
            process.exit(0);
        }

        if(this.config.environments.length > 2) {
            var skipped = _.pluck(this.config.environments.splice(2, this.config.environments.length), 'name').join(', ');
            this.config.environments = this.config.environments.splice(0, 2);
            Proxy.emit('warn', 'Only 2 environments can be compared at a time, skipping ' + skipped);
        }

        this.specs = this.loadSpecs();
    },
    runAll: function() {
        return this.runBundle(this.specs);
    },
    runBundle: function(specs) {
        Proxy.emit('bundle:started');
        var startTime = Date.now();

        if(specs.length) {
            if(_.isString(specs[0])) {
                specs = this.parseSpecs(specs);
            }
            // remove previous results
            emptyDir(this.config.resultsDir);

            // run all specs in phantomjs and capture screenshots
            this.runner.runBundle(specs);

            // compare screenshots
            Proxy.once('runner:bundle:finished', function(results) {
                this.differ.run(results.results);
            }.bind(this));

            Proxy.once('differ:bundle:finished', function(results) {
                results = Report.generate(results, {
                    startTime: startTime,
                    config: this.config,
                    specs: this.specs
                });

                this.saveReport(results);

                Proxy.emit('bundle:finished', {
                    results: results,
                    specsLength: specs.length
                });
            }.bind(this));
        } else {
            var results = Report.generate([], {
                startTime: startTime,
                config: this.config,
                specs: this.specs
            });

            this.saveReport(results);

            Proxy.emit('bundle:finished', {
                results: results,
                specsLength: specs.length
            });
        }
    },
    loadSpecs: function() {
        var specs = [],
            files,
            specDir = this.config.specDir;

        if(!fs.existsSync(specDir)) {
            Proxy.emit('error:specDirNotFound', specDir);
        } else {
            // load a fileset of test specifications
            files = fs.readdirSync(specDir);

            if(files.length) {
                files.forEach(function(file) {
                    try {
                        var spec = require(specDir + file);

                        if(!_.isUndefined(spec.options)) {
                            if(_.isUndefined(spec.options.viewports)) {
                                spec.options.viewports = this.config.viewports;
                            }
                        }

                        spec.name = file.replace('.js', '');

                        specs.push(spec);
                    } catch (e) {
                        Proxy.emit('error:specFileLoadFailure', specDir + file);
                        Proxy.emit('error:specFileLoadFailure', e.toString());
                    }
                }.bind(this));
            }

            Proxy.emit('specsLoaded', specs);

            if(specs.length === 0) {
                Proxy.emit('error:specsNotFound');
            }
        }

        return specs;
    },
    parseSpecs: function(names) {
        var specs = [];

        if(!this.specs || this.specs.length === 0) {
            return specs;
        }

        _.each(names, function(name) {
            var spec = _.findWhere(this.specs, {name: name});
            if(spec) {
                specs.push(spec);
            } else {
                Proxy.emit('error:specNotFound', name);
            }
        }.bind(this));
        return specs;
    },
    saveReport: function(report) {
        if(!this.config.live) {
            fs.writeFileSync(this.config.resultsDir + 'report.json', JSON.stringify(report), {
                encoding: 'utf-8'
            });
        }
    }

}, events.EventEmitter.prototype);

module.exports = Pediff;
