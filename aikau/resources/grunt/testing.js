var notify = require("../../node_modules/grunt-notify/lib/notify-lib"),
   os = require("os"),
   tcpPortUsed = require("tcp-port-used"),
   selenium = require('selenium-standalone');

// Modify grunt
module.exports = function(grunt) {

   // New Test
   grunt.registerTask("newTest", ["shell:stopTestApp", "vdown", "vup", "test"]);
   grunt.registerTask("nt", ["newTest"]);

   // Register a test task that uses Intern_local for development purposes (no server restarts)
   grunt.registerTask("dt", ["intern:local"]);
   
   grunt.registerTask('startSelenium', 'Start selenium', function()
       {
           var done = this.async();
           selenium.install(function(){
               selenium.start(function(err, child){
                   done();
               });
           });
       }
   );

   // Register test tasks for local/vagrant/SauceLabs/grid respectively
   grunt.registerTask("test_local", ['startSelenium', "startUnitTestApp", "waitServer", "clean:testScreenshots", "generate-require-everything", "intern:local", 'shell:stopTestApp']);
   grunt.registerTask("test", ["startUnitTestApp", "waitServer", "clean:testScreenshots", "generate-require-everything", "intern:dev"]);
   grunt.registerTask("test_bs", ["startUnitTestApp", "waitServer", "clean:testScreenshots", "generate-require-everything", "intern:bs"]);
   grunt.registerTask("test_bamboo", ["startUnitTestApp", "waitServer", "clean:testScreenshots", "generate-require-everything", "intern:bamboo"]);
   grunt.registerTask("test_sl", ["startUnitTestApp", "waitServer", "clean:testScreenshots", "generate-require-everything", "intern:sl"]);
   grunt.registerTask("test_grid", ["waitServer", "clean:testScreenshots", "generate-require-everything", "intern:grid"]);

   // Watch for changes and retest
   grunt.registerTask("watchDev", ["watch:dev"]);
   grunt.registerTask("watchTest", ["watch:test"]);

   // Restart the test server
   grunt.registerTask("restartTestApp", ["shell:stopTestApp", "startUnitTestApp"]);

   // Build and then clear cached stuff
   grunt.registerTask("updateTest", ["notifyTestUpdating", "shell:mavenProcessTestResources", "http:testAppReloadWebScripts", "http:testAppClearCaches", "notifyTestUpdated"]);

   // Start jetty server if not already running. Use waitServer to check startup finished
   grunt.registerTask("startUnitTestApp", "Spawn a Maven process to start the Jetty server running the unit test application", function() {
      grunt.log.writeln("Check Jetty unit test application state...");
      var done = this.async();
      tcpPortUsed.check(8089, "localhost")
         .then(function(inUse) {
            if (!inUse) {
               grunt.log.writeln("Starting unit test app...");
               grunt.task.run("shell:startTestApp");
               done();
            } else {
               grunt.log.writeln("Jetty unit test application appears to be running already...");
               done();
            }
         }, function(err) {
            console.error("Unknown if Jetty unit test application is already running:", err.message);
            done();
         });
   });

   // Notifications
   grunt.registerTask("notifyTestUpdating", "Notify that the 'updatedTest' task has started", function() {
      notify({
         title: "Test app updating",
         message: "The test app is updating..."
      });
   });
   grunt.registerTask("notifyTestUpdated", "Notify that the 'updatedTest' task has completed", function() {
      notify({
         title: "Test app updated",
         message: "The test app has been updated and the caches cleared"
      });
   });
   grunt.event.on("intern.fail", function(data) {
      notify({
         title: "Unit test(s) failed",
         message: data
      });
   });
   grunt.event.on("intern.pass", function(data) {
      notify({
         title: "Unit test(s) passed successfully",
         message: data
      });
   });

   // Calculate this machine's (i.e. the server's) best IP address
   // Preference is given to VM tunnel (which will work everywhere) and then an ethernet interface
   var interfaceToUse = (function() {

      // Setup variables
      var networkInterfaces = os.networkInterfaces(),
         interfaceNames = Object.keys(networkInterfaces),
         vmInterface,
         localInterface,
         fallbackInterface;

      // Analyse all interfaces
      interfaceNames.forEach(function(interfaceName) {
         var lowerName = interfaceName && interfaceName.toLowerCase();
         networkInterfaces[interfaceName].forEach(function(nextInterface) {
            /*jshint noempty:false*/
            if (nextInterface.family === "IPv4" && !nextInterface.internal) {
               if (!lowerName) {
                  // Ignore unnamed interfaces (for the moment)
               } else if (lowerName.indexOf("vbox") === 0) {
                  vmInterface = nextInterface;
                  vmInterface.name = interfaceName;
               } else if (lowerName.indexOf("virtual") === 0) {
                  vmInterface = nextInterface;
                  vmInterface.name = interfaceName;
               } else if (lowerName.indexOf("eth") === 0) {
                  localInterface = nextInterface;
                  localInterface.name = interfaceName;
               } else if (lowerName.indexOf("en") === 0) {
                  localInterface = nextInterface;
                  localInterface.name = interfaceName;
               } else {
                  fallbackInterface = nextInterface;
                  fallbackInterface.name = interfaceName;
               }
            }
         });
      });

      // Choose prioritised interface
      var chosenInterface = vmInterface || localInterface || fallbackInterface;

      // In debug mode, output the IP information
      grunt.log.debug("");
      grunt.log.debug("\x1b[4m" + "Retrieving IP address of server" + "\x1b[0m");
      grunt.log.debug("Using network interface '" + chosenInterface.name + "' with address of " + chosenInterface.address);
      grunt.log.debug("");

      // Pass back the IP
      return chosenInterface;
   })();

   // Update the grunt config
   grunt.config.merge({
      intern: {
         options: {
            rowsCols: process.stdout.rows + "|" + process.stdout.columns, // Used by ConcurrentReporter
            serverIP: interfaceToUse.address // Used by all
         },
         bs: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern_bs",
               useLocalhost: true
            }
         },
         bamboo: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern_bamboo",
               useLocalhost: true
            }
         },
         dev: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern"
            }
         },
         dev_coverage: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern",
               doCoverage: true
            }
         },
         local: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern_local"
            }
         },
         sl: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern_sl"
            }
         },
         grid: {
            options: {
               runType: "runner",
               config: "src/test/resources/intern_grid"
            }
         }
      }
   });

};