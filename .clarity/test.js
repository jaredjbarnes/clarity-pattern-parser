var fs = require("fs-extra");
var path = require("path");

const seperator = "============================================================";
const startSeperator = "************************************************************";
const testDirectory = path.join(__dirname, "../lib/tests");
const specialTestNames = {
    "prepare": true,
    "destroy": true,
    "clean": true
};

const promiseFunction = () => {
    return Promise.resolve(null);
}

const promisify = (fn) => {
    return () => {
        fn = fn || promiseFunction;
        var result = fn();

        result = result instanceof Promise ? result : Promise.resolve(result);

        return result;
    }
}

fs.readdir(testDirectory).then((files) => {
    return files.reduce((promise, file) => {

        return promise.then(() => {
            if (path.extname(file) === ".js") {
                console.log(startSeperator);
                console.log(file);
                console.log(startSeperator);
                try {
                    var tests = require(path.join(testDirectory, file));
                } catch (error) {
                    console.log("REQUIRE ERROR: " + file);
                    console.log(seperator);
                    console.log(error);
                    console.log(seperator);

                    return Promise.resolve();
                }

                var defaultModules = tests.default || tests;
                var prepare = promisify(defaultModules.prepare);
                var destroy = promisify(defaultModules.destroy);
                var clean = promisify(defaultModules.clean);

                var preparePromise = prepare().catch((error) => {
                    console.log("UNEXPECTED FAILURE ON PREPARE: " + file);
                    console.log(seperator);
                    console.log(error);
                    console.log(seperator);

                    return Promise.reject();
                });

                return Object.keys(defaultModules).filter((testName) => {
                    return specialTestNames[testName] == null;
                }).reduce((promise, testName) => {

                    if (typeof defaultModules[testName] !== "function") {
                        console.log("UNEXPECTED EXPORT:  This export '" + testName + "' needs to be a function.");

                        return promise.then(() => {
                            return Promise.resolve();
                        });
                    }

                    return promise.then(() => {
                        let result = defaultModules[testName]();
                        result = result instanceof Promise ? result : Promise.resolve(result);

                        return result;
                    }).then(() => {
                        console.log("PASSED: " + testName);
                    }).catch((error) => {
                        console.log("FAILED: " + testName);
                        console.log(seperator);
                        console.log(error);
                        console.log(seperator);
                    }).then(() => {
                        return clean();
                    }).catch((error) => {
                        console.log("UNEXPECTED FAILURE ON CLEAN");
                        console.log(seperator);
                        console.log(error);
                        console.log(seperator);
                    });

                }, preparePromise).then(() => {
                    return destroy();
                }).catch((error) => {
                    console.log("UNEXPECTED FAILURE ON DESTROY");
                    console.log(seperator);
                    console.log(error);
                    console.log(seperator);
                }).then(() => {
                    console.log(startSeperator);
                    console.log("\n\n");
                });
            }

            return Promise.resolve();
        }).then(() => {
        });

    }, Promise.resolve());
}).catch((error) => {
    console.log(`Couldn't find test folder here: ${testDirectory}`);
});