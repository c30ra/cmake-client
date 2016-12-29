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

const CMakeClient = require('..').CMakeClient
const handshakeRequest = require('..').HandshakeRequest
const util = require('util');
const path = require('path');

function toPosix(string){
  return string.replace(/\\/g, "/");
}
const cmake = new CMakeClient('cmake', true);
cmake.start();

try {
  const colors = require('ansicolors')
  cmake.on('reply', (reply) => {
    if(reply.type === "progress"){
      console.log(colors.green(reply.progressMessage + ": " + (reply.progressCurrent/reply.progressMaximum*100).toFixed(2) + "%"));
    }
    if(reply.type === "message"){
      console.log(reply.message);
    }
    if(reply.type === "error"){
      console.log(reply.errorMessage);
    }
    if(reply.type === "reply"){
      if(reply.inReplyTo === "codemodel"){
        console.log(util.inspect(reply, { depth: null, colors: true }));
      }
      else {
        console.log(reply);
      }
    }
  })
} catch (e) {
  cmake.on('reply', (reply) => {
    if(reply.type === "progress"){
      console.log(reply.progressMessage + ": " + (reply.progressCurrent/reply.progressMaximum*100).toFixed(2) + "%");
    }
    if(reply.type === "message"){
      console.log(reply.message);
    }
    if(reply.type === "error"){
      console.log(reply.errorMessage);
    }
    if(reply.type === "reply"){
      if(reply.inReplyTo === "codemodel"){
        console.log(util.inspect(reply, { depth: null, colors: true }));
      }
      else {
        console.log(reply);
      }
    }
  })
}

// the first request should always be "handshake"
handshakeRequest.sourceDirectory = toPosix(path.resolve("./CMakeSample"));
// feel free to change this
handshakeRequest.buildDirectory = toPosix(path.resolve("./CMakeSample/build"));

cmake.request(handshakeRequest);

configure = {type: "configure"};
cmake.request(configure);

generate = {type: "compute"};
cmake.request(generate);

// codemodel request work after everything is computed and configured
set = {type: "codemodel"};
cmake.request(set);
