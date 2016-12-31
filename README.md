# cmake-client v1.0.0

## Usage:
- Require CMakeClient:  
`const CMakeClient = require('cmake-client').CMakeClient`

- Instantiate a new CMakeClient class, this will not actually start cmake. The first parameter is the cmake path, cmake can also be in system path. The second parameter is optional(default is false), it print additional message to console for tracing execution.  
`const cmake = new CMakeClient('cmake', false);`

- When we are ready we can start the process:  
`cmake.start();`  
this will start cmake in server mode, and message handling begin.

- In order to get reply you have to subscribe to CMakeClient.reply event:  
```
cmake.on('reply', (reply) => {
  // handle reply here
}
```
replies are in JSON format.

- To send a request to cmake use:  
`cmake.request(request);`  
request must be a **JSON** object i.e:  
`configureRequest = {type: "configure"};`

## Additional Notes:
In order for cmake to work properly, a build environment must be present, so for example on windows first use vcvarsall.bat to initialize the environment. At the moment CMakeClient spawn the process using the current environment variables, in future will be possible to spawn cmake with custom environment variables.

At the moment cmake will run until the main process run, so if for example you execute the script in a windows shell, cmake will never exit, you have to **kill it manually** pressing <kbd>ctrl+c</kbd>.

Keep in mind that the process is spawned async, so multiple request maybe send before the previous one has finished to be processed by cmake. So if you instantiate CMakeClient with `verbose = true` you will see something like this in the console:
```
cmake-client: starting cmake
cmake-client: sending request: 'handshake'
cmake-client: sending request: 'configure'
cmake-client: sending request: 'compute'
cmake-client: sending request: 'codemodel'
cmake-client: getting reply
cmake-client: getting reply
{ cookie: '', inReplyTo: 'handshake', type: 'reply' }
cmake-client: getting reply
Configuring: 100.00%
cmake-client: getting reply
Configuring done
cmake-client: getting reply
{ cookie: '', inReplyTo: 'configure', type: 'reply' }
cmake-client: getting reply
```
A working example can be found in example directory.
If you run it from windows shell remember to kill the process with <kbd>ctrl + c</kbd> after it finish.
