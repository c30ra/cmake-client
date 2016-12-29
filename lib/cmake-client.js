/*******************************************************************************
This file is part of the "cmake-client" project.
Copyright (C) 2016 Luca Carella <bkarelb at gmail dot com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

const Request = require('./request');
const EventEmitter = require('events');
const fs = require('fs')
const emitter = new EventEmitter;

function checkCMake(cmake_path) {

    let spawn = require('child_process').spawn;
    let cmake = spawn(cmake_path, ['--version'],['pipe']);

    cmake.stdout.on('data', (data) => {
      let re = /([0-9]+).([0-9]+).([0-9]+)/
      version = data.toString();
      console.log(version);
      let match = version.match(re);
      if(!(match[1] >= 3 && match[2] >= 7 && match[3] >= 0)){
        return false;
      }
    });


    cmake.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    cmake.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    return true;
  };

class CMakeClient extends EventEmitter{
  // Initialize CMakeClient with the path to cmake_path(path to cmake), and
  // verbose(default = false, print other message)
  constructor(cmake_path, verbose = false){
    super();
    if(checkCMake(cmake_path)){
      this.cmake_path = cmake_path;
    }
    else {
      throw (exception);
    }
    this.cmake = null;
    this.verbose = verbose;
    this.started = false;
  }

  //start the process, configure cmake
  start(){
    if(this.cmake !== null){
      console.log("cmake-client: cmake already started!");
      return
    }

    if(this.verbose){
      console.log("cmake-client: starting cmake");
    }

    let spawn = require('child_process').spawn;
    this.cmake = spawn(this.cmake_path, ['-E', 'server', '--debug', '--experimental'],['pipe', 'detached']);

    this.cmake.on('error', () => {
      console.log("Failed to start cmake, be sure that cmake is in path " +
                  "or the path to cmake is correct\n\t %s", this.cmake_path);
    })

    if(this.cmake !== null){
      this.started = true;
    }

    this.cmake.stdout.on('data', (data) => {
      //remove magic header
      // let re = /^\{.+\}$/;
      if(this.verbose){
        console.log("cmake-client: getting reply");
      }

      let list = data.toString().split('\n');
      // console.log(list);
      for (let str of list) {
          if(str === "[== \"CMake Server\" ==[" || str === "]== \"CMake Server\" ==]" || str === ""){
            continue;
          }
          // console.log(str);
          // let json = str.substring(24, str.length - 24);
          // console.log(str);
          // console.log("typeof(str): ", typeof(str));
          let reply = JSON.parse(str);
          this.emit('reply', reply);
      }
    });


    this.cmake.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    this.cmake.on('close', (code) => {
      console.log(`cmake-client: cmake exited with code ${code}`);
    });

    this.cmake.on('exit', (code) => {
      console.log(`cmake-client: cmake exited with code ${code}`);
    });

    this.cmake.stdout.on('error', () => {
      console.log(`cmake-client: Error while reading `, this.cmake.stdout.read());
    });

    this.cmake.stdin.on('error', () => {
      console.log(`cmake-client: Error while writing`);
    });

  };

  started() {
    return this.started;
  }
  request(requestObject){
    if(this.verbose){
      console.log("cmake-client: sending request: '%s'", requestObject.type);
    }
    let requestMessage = "[== \"CMake Server\" ==[\n" + JSON.stringify(requestObject) + "\n]== \"CMake Server\" ==]\n"
    this.cmake.stdin.write(requestMessage);
  };
}

exports.CMakeClient = CMakeClient;
